/**
 * One-time migration: move every cat image from Railway's ephemeral
 * filesystem to Cloudinary, then update the database URL in-place.
 *
 * Run this BEFORE your next Railway deploy, while the old images are
 * still being served by the current Railway instance.
 *
 * Usage (from the backend directory):
 *   node src/db/migrate-to-cloudinary.js
 *
 * Required environment variables (copy from Railway or your .env):
 *   DATABASE_URL          – Railway Postgres connection string
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *   CLOUDINARY_FOLDER     – optional, defaults to "craigpets"
 */

import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import pool from "./pool.js";

// ── Cloudinary setup ──────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "craigpets";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Upload a raw buffer to Cloudinary and return the secure_url. */
function uploadBufferToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result.secure_url);
    });
    stream.end(buffer);
  });
}

/** Download a URL and return a Buffer. Throws on non-2xx status. */
async function downloadToBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/** Return true if a URL already points to Cloudinary (no need to migrate). */
function isCloudinaryUrl(url) {
  return typeof url === "string" && url.includes("res.cloudinary.com");
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function migrate() {
  console.log("Connecting to database…");
  const client = await pool.connect();

  try {
    const { rows } = await client.query(
      "SELECT id, image_url FROM cat_images ORDER BY id",
    );

    console.log(`Found ${rows.length} image row(s) to inspect.\n`);

    let skipped = 0;
    let succeeded = 0;
    let failed = 0;

    for (const row of rows) {
      const { id, image_url } = row;

      // Already on Cloudinary – skip
      if (isCloudinaryUrl(image_url)) {
        console.log(`  [SKIP]  id=${id}  (already Cloudinary)`);
        skipped += 1;
        continue;
      }

      // Normalise to https so the fetch actually succeeds on Railway
      const fetchUrl = image_url.replace(/^http:\/\//i, "https://");

      process.stdout.write(`  [FETCH] id=${id}  ${fetchUrl}  …`);

      try {
        const buffer = await downloadToBuffer(fetchUrl);
        const newUrl = await uploadBufferToCloudinary(buffer, {
          folder: CLOUDINARY_FOLDER,
          resource_type: "image",
          // Keep a stable public_id derived from the original filename
          // so re-running the script is idempotent.
          public_id: `${CLOUDINARY_FOLDER}/img_${id}`,
          overwrite: false,
          invalidate: true,
        });

        await client.query(
          "UPDATE cat_images SET image_url = $1 WHERE id = $2",
          [newUrl, id],
        );

        console.log(`  OK  →  ${newUrl}`);
        succeeded += 1;
      } catch (err) {
        console.log(`  FAILED  (${err.message})`);
        failed += 1;
        // Row is left untouched – the old URL stays so nothing is lost.
      }
    }

    console.log("\n──────────────────────────────────────────");
    console.log(
      `Done.  Succeeded: ${succeeded}  |  Skipped: ${skipped}  |  Failed: ${failed}`,
    );

    if (failed > 0) {
      console.log(
        "\nFailed rows still have their original URLs in the database.",
      );
      console.log(
        "If the Railway files are already gone, you will need to re-upload those images manually via the admin panel.",
      );
    }
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
}

migrate().catch((err) => {
  console.error("Migration aborted:", err);
  process.exit(1);
});

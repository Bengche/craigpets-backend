import { v2 as cloudinary } from "cloudinary";

// Configure lazily so env vars are guaranteed to be loaded by the time
// the first upload request arrives (avoids ES-module import-order issues).
let configured = false;

function ensureConfigured() {
  if (configured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      `Cloudinary env vars missing. Set: CLOUDINARY_CLOUD_NAME=${
        cloudName ? "OK" : "MISSING"
      } CLOUDINARY_API_KEY=${
        apiKey ? "OK" : "MISSING"
      } CLOUDINARY_API_SECRET=${
        apiSecret ? "OK" : "MISSING"
      }`
    );
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  configured = true;
}

/**
 * Upload a raw buffer to Cloudinary and return the full result object.
 * @param {Buffer} buffer
 * @param {object} options  Cloudinary upload options
 * @returns {Promise<object>} Cloudinary upload result (includes secure_url, public_id, etc.)
 */
export function uploadBuffer(buffer, options = {}) {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
}

export { configured as isConfigured };
export default cloudinary;

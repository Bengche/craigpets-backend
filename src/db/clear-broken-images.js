import dotenv from "dotenv";
dotenv.config();

import pool from "./pool.js";

const { rowCount } = await pool.query(
  `DELETE FROM cat_images WHERE image_url LIKE '%railway.app/uploads/%'`,
);

console.log(`Deleted ${rowCount} broken image row(s).`);
await pool.end();

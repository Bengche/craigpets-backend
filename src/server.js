import dotenv from "dotenv";
import app from "./app.js";
import pool from "./db/pool.js";
import { ensureSchema } from "./db/schema.js";
import { seedData } from "./db/seed.js";
import cors from "cors";
dotenv.config();

const PORT = Number(process.env.PORT || 4010);

async function bootstrap() {
  try {
    await pool.query("SELECT 1");
    await ensureSchema();
    await seedData();

    app.listen(PORT, () => {
      console.log(`Craig Pets API ready on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

bootstrap();

const gracefulShutdown = async () => {
  try {
    await pool.end();
  } finally {
    process.exit(0);
  }
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

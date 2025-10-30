import dotenv from "dotenv";
import app from "./app.js";
import pool from "./db/pool.js";
import { ensureSchema } from "./db/schema.js";
import { seedData } from "./db/seed.js";
import cors from "cors";

dotenv.config();

// Add CORS early
app.use(cors({
  origin: "https://craigpets.com",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Add a quick health check route (for Railway)
app.get("/health", (req, res) => res.status(200).send("OK"));

const PORT = process.env.PORT || 4010;

async function bootstrap() {
  try {
    // Try database connection — but don't block server start if it fails
    try {
      await pool.query("SELECT 1");
      console.log("✅ Database connected");
      await ensureSchema();
      await seedData();
    } catch (dbErr) {
      console.error("⚠ Database initialization failed:", dbErr.message);
    }

    // Start server regardless
    app.listen(PORT, () => {
      console.log(🚀 Craig Pets API ready on port ${PORT});
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();

// Graceful shutdown
const gracefulShutdown = async () => {
  try {
    await pool.end();
  } finally {
    process.exit(0);
  }
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
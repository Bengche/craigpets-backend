import dotenv from "dotenv";
import app from "./app.js";
import pool from "./db/pool.js";
import { ensureSchema } from "./db/schema.js";
import { seedData } from "./db/seed.js";
import cors from "cors";

dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(app);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowAll = allowedOrigins.includes("*");

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (allowAll || !origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

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

import fs from "fs";
import path from "path";
import multer from "multer";
import { Router } from "express";
import { handleImageUpload } from "../controllers/uploadController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_COUNT,
  MAX_IMAGE_SIZE_BYTES,
} from "../utils/constants.js";

const uploadsDir = path.resolve(process.cwd(), "public", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, "_");
    const filename = `${timestamp}_${random}_${sanitized}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: MAX_IMAGE_COUNT,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"));
    }
  },
});

const router = Router();

router.post(
  "/images",
  authenticate,
  requireAdmin,
  upload.array("images", MAX_IMAGE_COUNT),
  handleImageUpload
);

export default router;

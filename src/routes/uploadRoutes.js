import multer from "multer";
import { Router } from "express";
import { handleImageUpload } from "../controllers/uploadController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_COUNT,
  MAX_IMAGE_SIZE_BYTES,
} from "../utils/constants.js";

// Store files in memory — Cloudinary receives the buffer directly.
const upload = multer({
  storage: multer.memoryStorage(),
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
  handleImageUpload,
);

export default router;

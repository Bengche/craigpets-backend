import { Router } from "express";
import {
  getCats,
  getCatById,
  createCat,
  updateCat,
  deleteCat,
} from "../controllers/catController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getCats);
router.get("/:id", getCatById);
router.post("/", authenticate, requireAdmin, createCat);
router.put("/:id", authenticate, requireAdmin, updateCat);
router.delete("/:id", authenticate, requireAdmin, deleteCat);

export default router;

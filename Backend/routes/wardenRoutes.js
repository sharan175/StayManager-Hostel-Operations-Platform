import express from "express";
import { getWardenStats, getWardenProfile } from "../controllers/wardenStatsController.js";
import { isAuth } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/warden/stats",   isAuth, getWardenStats);
router.get("/warden/profile", isAuth, getWardenProfile);
export default router;
import express from "express";
import { getWardenStats, getWardenProfile } from "../controllers/wardenStatsController.js";
import { isAuth } from "../middleware/authMiddleware.js";
import {getstudent} from "../controllers/wardenStudentController.js"
const router = express.Router();
router.get("/warden/stats",   isAuth, getWardenStats);
router.get("/warden/profile", isAuth, getWardenProfile);
router.get("/warden/student",isAuth,getstudent)
export default router;
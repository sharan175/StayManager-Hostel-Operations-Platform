import express from "express";
import { payFees } from "../controllers/feesController.js";
import { isAuth } from "../middleware/authMiddleware.js";
import { attachRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

router.post("/pay", isAuth, attachRole, requireRole("student"), payFees);

export default router;
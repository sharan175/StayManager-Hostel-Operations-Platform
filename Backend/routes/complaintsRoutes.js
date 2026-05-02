import express from "express";
import { submitComplaint, getComplaints } from "../controllers/complaintsController.js";
import { attachRole } from "../middleware/roleMiddleware.js";
import { checkFees } from "../middleware/checkFees.js";
import {isAuth} from "../middleware/authMiddleware.js"

const router = express.Router();

const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

router.post("/", isAuth, attachRole, requireRole("student"), checkFees, submitComplaint);
router.get("/", isAuth, attachRole, requireRole("student"), checkFees, getComplaints);

export default router;
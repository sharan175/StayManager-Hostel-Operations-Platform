import express from "express";
import { isAuth } from "../middleware/authMiddleware.js";
import { attachRole } from "../middleware/roleMiddleware.js";
import { checkFees } from "../middleware/checkFees.js";

const router = express.Router();

const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};


router.get("/status", isAuth, attachRole, requireRole("student"), (req, res) => {
  res.json({ message: "Student logged in", user: req.user });
});


router.get("/dashboard", isAuth, attachRole, requireRole("student"), checkFees, (req, res) => {
  res.json({ message: "Welcome to student dashboard" });
});

export default router;
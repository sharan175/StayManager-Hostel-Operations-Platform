import express from "express";
import { isAuth } from "../middleware/authMiddleware.js";
import { requireStudent } from "../middleware/studentMiddleware.js";

const router = express.Router();


router.get("/complete-profile", isAuth, (req, res) => {
  res.send("Enter name and phone");
});

router.get(
  "/student/dashboard",
  isAuth,
  requireStudent,
  (req, res) => {
    res.send("Student Dashboard");
  }
);

export default router;
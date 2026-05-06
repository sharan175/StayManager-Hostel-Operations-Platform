import express from "express";
import { submitComplaint, getComplaints, getWardenComplaints, resolveComplaint } from "../controllers/complaintsController.js";
import { attachRole } from "../middleware/roleMiddleware.js";
import { checkFees } from "../middleware/checkFees.js";
import { isAuth } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";

// ── Store uploads in /uploads with original extension preserved ──────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const router = express.Router();

const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

// ── Routes ────────────────────────────────────────────────────────────────────
// upload.single("image") must come BEFORE submitComplaint so req.file is set
router.post(   "/",          isAuth, attachRole, requireRole("student"), checkFees, upload.single("image"), submitComplaint);
router.get(    "/",          isAuth, attachRole, requireRole("student"), checkFees, getComplaints);
router.get(    "/warden",    isAuth, attachRole, requireRole("warden"),             getWardenComplaints);
router.patch(  "/:id/resolve", isAuth, attachRole, requireRole("warden"),           resolveComplaint);

export default router;
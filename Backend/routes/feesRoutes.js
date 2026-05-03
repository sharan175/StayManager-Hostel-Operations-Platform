import express from "express";

import { isAuth } from "../middleware/authMiddleware.js";
import { attachRole } from "../middleware/roleMiddleware.js";
import { getAllFees } from "../controllers/feesController.js";
import { payFees, allocateRoom } from "../controllers/feesController.js";
import {checkFees} from "../middleware/checkFees.js";
const router = express.Router();

const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

router.post("/pay", isAuth, attachRole, requireRole("student"), payFees);
router.get("/get/fees",isAuth, attachRole,requireRole("admin"),getAllFees);

router.post("/allocate", isAuth, attachRole, requireRole("student"), checkFees, allocateRoom);

export default router;
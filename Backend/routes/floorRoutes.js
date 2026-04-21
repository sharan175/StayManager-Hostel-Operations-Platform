import express, { Router } from "express";
import { upload } from "../config/upload.js";
import { createFloor, deleteFloor, getFloors, updateFloor } from "../controllers/floorController.js";

const router=express.Router();
router.get("/floors", getFloors);
router.post("/floors", upload.single("image"), createFloor);
router.put("/floors", upload.single("image"), updateFloor)
router.delete("/floors", deleteFloor);
export default router;
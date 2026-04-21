import express, { Router } from "express";
import { upload } from "../config/upload.js";
import { createRoom, deleteRoom, getRooms, updateRoom } from "../controllers/roomController.js";

const router=express.Router();
router.get("/rooms", getRooms);
router.post("/rooms", upload.single("image"), createRoom);
router.put("/rooms", upload.single("image"), updateRoom);
router.delete("/rooms", deleteRoom);
export default router;
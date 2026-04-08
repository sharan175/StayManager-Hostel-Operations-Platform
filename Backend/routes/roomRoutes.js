import express, { Router } from "express";
import {createRoom,deleteRoom} from "../controllers/roomController.js";
const route=express.Router();
route.post("/room",createRoom)
route.delete("/room",deleteRoom)
export default route;
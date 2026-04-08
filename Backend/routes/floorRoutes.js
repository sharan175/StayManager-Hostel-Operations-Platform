import express, { Router } from "express";
import {createFloor,deleteFloor} from "../controllers/floorController.js";
const route=express.Router();
route.post("/floor",createFloor)
route.delete("/floor",deleteFloor);
export default route;
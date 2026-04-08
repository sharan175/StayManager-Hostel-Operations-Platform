import express, { Router } from "express";
import {createFloor} from "../controllers/floorController.js";
const route=express.Router();
route.post("/floor",createFloor)
export default route;
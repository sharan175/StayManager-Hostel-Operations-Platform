import express, { Router } from "express";
import { createFood } from "../controllers/foodlistController.js";
const route=express.Router();
route.post("/food",createFood)
export default route;
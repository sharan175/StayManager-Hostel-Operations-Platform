import express, { Router } from "express";
import { createMenu } from "../controllers/foodmenuController.js";
const route=express.Router();
route.post("/menu",createMenu)
export default route;
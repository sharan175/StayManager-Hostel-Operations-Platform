import express, { Router } from "express";
import {makeAdmin} from "../controllers/adminController.js";
import {makeCook} from "../controllers/cookController.js"
import {makeWarden} from "../controllers/wardenController.js"
const route=express.Router();
route.post("/admin",makeAdmin);
route.post("/cook",makeCook);
route.post("/warden",makeWarden)
export default route;
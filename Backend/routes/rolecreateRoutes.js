import express, { Router } from "express";
import {makeAdmin,removeAdmin} from "../controllers/adminController.js";
import {makeCook,removeCook,getCook} from "../controllers/cookController.js"
import {makeWarden,removeWarden,getWarden} from "../controllers/wardenController.js"
const route=express.Router();
route.get("/warden",getWarden)
route.get("/cook",getCook)
route.post("/admin",makeAdmin);
route.post("/cook",makeCook);
route.post("/warden",makeWarden)
route.delete("/admin", removeAdmin);
route.delete("/cook", removeCook);
route.delete("/warden", removeWarden);
export default route;


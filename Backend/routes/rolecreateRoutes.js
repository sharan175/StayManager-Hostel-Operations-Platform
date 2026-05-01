import express, { Router } from "express";
import {makeAdmin,removeAdmin} from "../controllers/adminController.js";
import {makeCook,removeCook,getCook} from "../controllers/cookController.js"
import {makeWarden,removeWarden,getWarden} from "../controllers/wardenController.js"
import{makeStudent,removeStudent,getStudent} from "../controllers/studentController.js"
import router from "./wardenRoutes.js";
const route=express.Router();
route.get("/warden",getWarden);
route.get("/cook",getCook);
route.get("/student",getStudent);
route.post("/admin",makeAdmin);
route.post("/cook",makeCook);
route.post("/student",makeStudent);
route.post("/warden",makeWarden)
route.delete("/admin", removeAdmin);
route.delete("/cook", removeCook);
route.delete("/warden", removeWarden);
route.delete("/student",removeStudent)
export default route;


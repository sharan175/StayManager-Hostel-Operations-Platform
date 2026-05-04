import express, { Router } from "express"
import {allocation} from "../controllers/allocationcheckController.js"
import { isAuth } from "../middleware/authMiddleware.js";

const router=express.Router();
router.get("/allocatecheck",isAuth,allocation);
export default router;
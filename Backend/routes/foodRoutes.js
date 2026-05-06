

import express from "express";
import { isAuth } from "../middleware/authMiddleware.js";
import {
  createFood,
  getDishesByMenu,
  uploadDishPhoto,
  upload,
  deleteDish,
  selectDish,
  showfood,
  getDishSelectionStats
} from "../controllers/foodlistController.js";
import {
  createMenu,
  getActiveMenu,
  endMenuEarly,
} from "../controllers/foodmenuController.js";
const router = express.Router();


router.post("/menu", createMenu);                  
router.get("/menu/active", getActiveMenu);          
router.patch("/menu/:id/end", endMenuEarly);        

router.post("/dish", createFood);                          
router.get("/dishes/:menuId", getDishesByMenu);           
router.post("/dish-photo", upload.single("photo"), uploadDishPhoto); 
router.delete("/dish/:id", deleteDish);
router.get("/showfood", showfood);
router.post("/select-dish", isAuth, selectDish);
router.get("/dish-selection-stats", getDishSelectionStats);
export default router;
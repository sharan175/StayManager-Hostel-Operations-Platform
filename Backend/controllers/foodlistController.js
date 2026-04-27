import pool from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/dishes";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `dish_${Date.now()}${ext}`);
  },
});
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});


export const uploadDishPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    // Return a publicly accessible URL — adjust base URL to your server
    const url = `${process.env.BASE_URL || "http://localhost:3000"}/uploads/dishes/${req.file.filename}`;
    return res.status(200).json({ url });
  } catch (err) {
    console.error("Upload photo error:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
};


export const createFood = async (req, res) => {
  try {
    const { dish, nonveg, meal, photo_url } = req.body;

    if (!dish || nonveg === undefined || !meal) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const mealResult = await pool.query(
      "SELECT id FROM food_menu WHERE meal = $1 AND expiry_time > NOW() ORDER BY id DESC LIMIT 1",
      [meal]
    );

    if (mealResult.rows.length === 0) {
      return res.status(404).json({ error: "No active meal found with that name" });
    }

    const meal_id = mealResult.rows[0].id;

    const result = await pool.query(
      "INSERT INTO food_dishes (menu_id, dish_name, is_nonveg, photo_url) VALUES ($1, $2, $3, $4) RETURNING *",
      [meal_id, dish, nonveg, photo_url || null]
    );

    return res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Dish not created" });
  }
};


export const getDishesByMenu = async (req, res) => {
  try {
    const { menuId } = req.params;
    const result = await pool.query(
      "SELECT * FROM food_dishes WHERE menu_id = $1 ORDER BY id ASC",
      [menuId]
    );
    return res.status(200).json({ dishes: result.rows });
  } catch (err) {
    console.error("Get dishes error:", err);
    return res.status(500).json({ error: "Could not fetch dishes" });
  }
};
export const deleteDish = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM food_dishes WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Dish not found" });
    }

    const dish = result.rows[0];
    if (dish.photo_url) {
      const filename = dish.photo_url.split("/uploads/dishes/")[1];
      if (filename) {
        const filepath = `uploads/dishes/${filename}`;
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      }
    }

    return res.status(200).json({ message: "Dish removed successfully", data: dish });
  } catch (err) {
    console.error("Delete dish error:", err);
    return res.status(500).json({ error: "Could not delete dish" });
  }
};
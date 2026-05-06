import pool from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { error } from "console";

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
export const selectDish = async (req, res) => {
  try {

    // Check authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    const userId = req.user.id;
    const { meal_id, dish_id } = req.body;

    // Validate request body
    if (!meal_id || !dish_id) {
      return res.status(400).json({
        success: false,
        message: "meal_id and dish_id are required"
      });
    }

    // Get student id
    const studentResult = await pool.query(
      "SELECT id FROM students WHERE user_id = $1",
      [userId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const student_id = studentResult.rows[0].id;

    // Check if meal exists and is active
    const mealCheck = await pool.query(
      "SELECT * FROM food_menu WHERE id = $1 AND expiry_time > CURRENT_TIMESTAMP",
      [meal_id]
    );

    if (mealCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Meal not found or expired"
      });
    }

    // Check if dish belongs to meal
    const dishCheck = await pool.query(
      "SELECT * FROM food_dishes WHERE id = $1 AND menu_id = $2",
      [dish_id, meal_id]
    );

    if (dishCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Dish does not belong to this meal"
      });
    }

    // Prevent duplicate selection
    const alreadySelected = await pool.query(
  "SELECT * FROM food_selection WHERE student_id = $1 AND menu_id = $2",
  [student_id, meal_id]
   );

    if (alreadySelected.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Food already selected for this meal"
      });
    }

    // Insert selection
    const result = await pool.query(
      `INSERT INTO food_selection (student_id, menu_id, dish_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [student_id, meal_id, dish_id]
    );

    return res.status(201).json({
      success: true,
      message: "Food selected successfully",
      data: result.rows[0]
    });

  } catch (err) {
    console.error("Error in selectDish:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};
export const showfood = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT 
          f.id as menu_id,
          fd.id as dish_id,
          f.meal,
          fd.dish_name,
          fd.is_nonveg,
          fd.photo_url
      FROM food_menu f
      JOIN food_dishes fd 
          ON f.id = fd.menu_id
      WHERE f.expiry_time > CURRENT_TIMESTAMP
    `);

    // Check if food items exist
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No food items available"
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (err) {
    console.error("Error in showfood:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};

export const getDishSelectionStats = async (req, res) => {
  try {
    const query = `
      SELECT 
          fm.meal,
          fd.dish_name,
          COUNT(sd.dish_id) AS selected_count
      FROM food_selection sd
      JOIN food_menu fm 
          ON sd.menu_id = fm.id
      JOIN food_dishes fd 
          ON sd.dish_id = fd.id
      WHERE fm.expiry_time > NOW()
      GROUP BY 
          fm.meal,
          fd.dish_name,
          sd.menu_id,
          sd.dish_id
      ORDER BY 
          fm.meal,
          selected_count DESC;
    `;

    const result = await pool.query(query);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching dish selection stats:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
import pool from "../config/db.js";
export const createFood = async (req, res) => {
  try {
    const { dish,nonveg,meal} = req.body;

    
    if (!dish ||!nonveg ||!meal) {
      return res.status(400).json({ error: "All fields are required" });
    }

    
    const mealResult = await pool.query(
      "SELECT id FROM food_menu WHERE meal = $1",
      [meal]
    );

    if (mealResult.rows.length === 0) {
      return res.status(404).json({ error: "meal not found" });
    }

    const meal_id = mealResult.rows[0].id;

    
    const result = await pool.query(
      "INSERT INTO food_dishes (menu_id, dish_name, is_nonveg) VALUES ($1, $2, $3) RETURNING *",
      [meal_id, dish, nonveg]
    );


    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "menu not created" });
  }
};

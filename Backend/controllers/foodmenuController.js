import pool from "../config/db.js";
export const createMenu = async (req, res) => {
  const client = await pool.connect();

  try {
    const { meal, duration, unit } = req.body;

   
    if (!meal || typeof meal !== "string" || meal.trim() === "") {
      return res.status(400).json({ error: "Meal is required" });
    }

    if (!duration || isNaN(duration) || duration <= 0) {
      return res.status(400).json({ error: "Duration must be a positive number" });
    }

    const allowedUnits = ["minutes", "hours"];
    if (!unit || !allowedUnits.includes(unit)) {
      return res.status(400).json({ error: "Unit must be 'minutes' or 'hours'" });
    }

    if (duration > 24 * 60) {
      return res.status(400).json({ error: "Duration too large" });
    }

   
  const interval = `${duration} ${unit}`;

  
    await client.query("BEGIN");

    const query = 
      "INSERT INTO food_menu (date, meal, expiry_time) VALUES (CURRENT_DATE, $1, NOW() + $2::INTERVAL) RETURNING *"
    ;

    const result = await client.query(query, [meal.trim(), interval]);

   
    await client.query("COMMIT");

    return res.status(201).json({
      message: "Menu created successfully",
      data: result.rows[0],
    });

  } catch (err) {
    
    await client.query("ROLLBACK");

    console.error("Create Menu Error:", err);

    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });

  } finally {
    client.release();
  }
};
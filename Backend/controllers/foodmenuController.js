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

    const result = await client.query(
      "INSERT INTO food_menu (date, meal, expiry_time) VALUES (CURRENT_DATE, $1, NOW() + $2::INTERVAL) RETURNING *",
      [meal.trim(), interval]
    );

    await client.query("COMMIT");
    return res.status(201).json({ message: "Menu created successfully", data: result.rows[0] });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Create Menu Error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  } finally {
    client.release();
  }
};


export const getActiveMenu = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM food_menu WHERE expiry_time > NOW() ORDER BY id DESC LIMIT 1"
    );
    if (result.rows.length === 0) {
      return res.status(200).json({ menu: null });
    }
    return res.status(200).json({ menu: result.rows[0] });
  } catch (err) {
    console.error("Get Active Menu Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const endMenuEarly = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE food_menu SET expiry_time = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Menu not found" });
    }
    return res.status(200).json({ message: "Menu ended", data: result.rows[0] });
  } catch (err) {
    console.error("End Menu Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
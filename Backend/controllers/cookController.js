import pool from "../config/db.js";

export const makeCook = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];
    const userId = user.id;

    const cookCheck = await pool.query(
      "SELECT 1 FROM cooks WHERE user_id = $1",
      [userId]
    );

    if (cookCheck.rowCount > 0) {
      return res.status(400).json({ message: "Already cook" });
    }

    // 🔹 3. Insert
    await pool.query(
      "INSERT INTO cooks (user_id) VALUES ($1)",
      [userId]
    );

    res.json({
      message: "User assigned as cook",
      user,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
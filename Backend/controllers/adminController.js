import pool from "../config/db.js";

export const makeAdmin = async (req, res) => {
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

   
    const adminCheck = await pool.query(
      "SELECT 1 FROM admins WHERE user_id = $1",
      [userId]
    );

    if (adminCheck.rowCount > 0) {
      return res.status(400).json({ message: "Already admin" });
    }

    // 🔹 3. Insert
    await pool.query(
      "INSERT INTO admins (user_id) VALUES ($1)",
      [userId]
    );

    res.json({
      message: "User promoted to admin",
      user,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message  });
  }
};
export const removeAdmin = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // 🔹 Find user
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = userResult.rows[0].id;

    // 🔹 Check if admin exists
    const adminCheck = await pool.query(
      "SELECT 1 FROM admins WHERE user_id = $1",
      [userId]
    );

    if (adminCheck.rowCount === 0) {
      return res.status(400).json({ message: "User is not admin" });
    }

 
    await pool.query(
      "DELETE FROM admins WHERE user_id = $1",
      [userId]
    );

    res.json({ message: "Admin role removed" });

  } catch (err) {
    console.error(err);
    res.status(500).json({  message: err.message });
  }
};
import pool from "../config/db.js";

export const makeStudent = async (req, res) => {
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

    const studentCheck = await pool.query(
      "SELECT 1 FROM students WHERE user_id = $1",
      [userId]
    );

    if (studentCheck.rowCount > 0) {
      return res.status(400).json({ message: "Already a student" });
    }

    await pool.query(
      "INSERT INTO students (user_id) VALUES ($1)",
      [userId]
    );

    res.json({
      message: "User assigned as student",
      user,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getStudent = async (req, res) => {
  try {
    
    const result = await pool.query(
      `SELECT users.id, users.name, users.email
       FROM students
       JOIN users ON students.user_id = users.id`
    );

    res.json({
      message: "Students fetched successfully",
      students: result.rows,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const removeStudent = async (req, res) => {
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

    const userId = userResult.rows[0].id;

    const studentCheck = await pool.query(
      "SELECT 1 FROM students WHERE user_id = $1",
      [userId]
    );

    if (studentCheck.rowCount === 0) {
      return res.status(400).json({ message: "User is not a student" });
    }

    await pool.query(
      "DELETE FROM students WHERE user_id = $1",
      [userId]
    );

    res.json({ message: "Student removed successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

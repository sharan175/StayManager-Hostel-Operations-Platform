import pool from "../config/db.js";

export const completeProfile = async (req, res) => {
  const { name, phone } = req.body;

  try {
    await pool.query(
      `INSERT INTO students (user_id, name, phone_no)
       VALUES ($1,$2,$3)`,
      [req.user.id, name, phone]
    );

    res.redirect("/studentdashboard");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const redirectUser = async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM students WHERE user_id=$1",
    [req.user.id]
  );

  if (result.rows.length === 0) {
    return res.redirect("/complete-profile");
  }

  return res.redirect("/student/dashboard");
};


export const logout = (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out" });
  });
};
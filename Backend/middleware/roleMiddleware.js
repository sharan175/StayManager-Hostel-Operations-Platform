

import pool from "../config/db.js";

export const attachRole = async (req, res, next) => {
  if (!req.user) return next();
  try {
    const userId = req.user.id;

 
    const admin = await pool.query(
      "SELECT * FROM admins WHERE user_id = $1",
      [userId]
    );

    if (admin.rowCount > 0) {
      req.user.role = "admin";
      return next();
    }

   
    const cook = await pool.query(
      "SELECT * FROM cooks WHERE user_id = $1",
      [userId]
    );

    if (cook.rowCount > 0) {
      req.user.role = "cook";
      return next();
    }
    const warden = await pool.query(
      "SELECT * FROM wardens WHERE user_id = $1",
      [userId]
    );

    if (warden.rowCount > 0) {
      req.user.role = "warden";
      return next();
    }
    const students = await pool.query(
      "SELECT * FROM students WHERE user_id = $1",
      [userId]
    );

    if (students.rowCount > 0) {
      req.user.role = "student";
      return next();
    }
    req.user.role = "user";
    next();
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
};
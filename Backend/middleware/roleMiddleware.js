

import db from "../config/db.js";

export const attachRole = async (req, res, next) => {
  try {
    const userId = req.user.id;

 
    const admin = await db.query(
      "SELECT * FROM admins WHERE user_id = $1",
      [userId]
    );

    if (admin.rowCount > 0) {
      req.user.role = "admin";
      return next();
    }

   
    const cook = await db.query(
      "SELECT * FROM cooks WHERE user_id = $1",
      [userId]
    );

    if (cook.rowCount > 0) {
      req.user.role = "cook";
      return next();
    }

    req.user.role = "user";
    next();
  } catch (err) {
    res.status(500).json({ message: "Role check failed" });
  }
};
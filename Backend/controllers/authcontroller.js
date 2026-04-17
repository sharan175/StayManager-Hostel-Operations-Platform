import pool from "../config/db.js";
import bcrypt from "bcrypt";


export const completeProfile = async (req, res) => {
  const { name, phone, password } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ message: "Name, phone, and password are required" });
  }

  try {
    const existing = await pool.query(
      `SELECT name, phone_no, password FROM users WHERE id = $1`,
      [req.user.id]
    );
    const u = existing.rows[0];
    if (u.name && u.phone_no && u.password) {
      return res.status(403).json({ message: "Profile already complete" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `UPDATE users SET name = $1, phone_no = $2, password = $3 WHERE id = $4`,
      [name, phone, hashedPassword, req.user.id]
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const redirectUser = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT name, phone_no, password, google_id 
       FROM users 
       WHERE id = $1`,
      [req.user.id]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

   
    const isProfileIncomplete = !user.name || !user.phone_no || !user.password; 

    if (isProfileIncomplete) {
      return res.redirect("http://localhost:5173/complete-profile");
    }

    return res.redirect("http://localhost:5173/");
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


export const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });

  });
};
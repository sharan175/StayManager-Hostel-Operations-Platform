import pool from "../config/db.js";

export const makeWarden = async (req, res) => {
  try {
    //email fetch
    const email = req.body.email?.toLowerCase().trim();
    const floor = req.body.floor;

    if (!email||!floor) {
      return res.status(400).json({ message: "all paramters is required" });
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

    const wardenCheck = await pool.query(
      "SELECT 1 FROM wardens WHERE user_id = $1",
      [userId]
    );

    if (wardenCheck.rowCount > 0) {
      return res.status(400).json({ message: "Aldready Warden" });
    }

    //floor
   
    const floorResult = await pool.query(
      "SELECT * FROM floors WHERE floor_number = $1",
      [floor]
    );

    if (floorResult.rowCount === 0) {
      return res.status(404).json({ message: "floor not found" });
    }

    const floors = floorResult.rows[0];
    const floorId = floors.id;

    //
    await pool.query(
      "INSERT INTO wardens (user_id,floor_id) VALUES ($1,$2)",
      [userId,floorId]
    );

    res.json({
      message: "User assigned as warden",
      user,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
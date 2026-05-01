import pool from "../config/db.js";

export const getWardenStats = async (req, res) => {
  try {
    const userId = req.user.id;

   
    const wardenResult = await pool.query(
      `SELECT floor_id FROM wardens WHERE user_id = $1`,
      [userId]
    );

    if (wardenResult.rowCount === 0) {
      return res.status(404).json({ message: "Warden not found" });
    }

    const floorId = wardenResult.rows[0].floor_id;

   
    const totalRooms = await pool.query(
      `SELECT COUNT(*) FROM rooms WHERE floor_id = $1`, [floorId]
    );

    
    const occupied = await pool.query(
      `SELECT COUNT(DISTINCT a.student_id) 
       FROM allocations a
       JOIN rooms r ON r.id = a.room_id
       WHERE r.floor_id = $1`, [floorId]
    );

    // Complaints count (if you have a complaints table)
    // const complaints = await pool.query(
    //   `SELECT COUNT(*) FROM complaints WHERE floor_id = $1 AND status = 'open'`, [floorId]
    // );

    const total = parseInt(totalRooms.rows[0].count);
    const occ   = parseInt(occupied.rows[0].count);

    res.json({
      totalRooms: total,
      occupied:   occ,
      vacant:     total - occ,
      complaints: 0, 
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getWardenProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone_no, 'warden' AS role, f.floor_number
       FROM users u
       JOIN wardens w ON w.user_id = u.id
       JOIN floors f ON f.id = w.floor_id
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Warden not found" });
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
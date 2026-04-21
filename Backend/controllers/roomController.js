import pool from "../config/db.js";

export const createRoom = async (req, res) => {
  try {
    const { Room_no, floor_no, capacity } = req.body;
    if (!Room_no || !floor_no || !capacity)
      return res.status(400).json({ error: "All fields are required" });

    const floorResult = await pool.query(
      "SELECT id FROM floors WHERE floor_number = $1", [floor_no]
    );
    if (floorResult.rows.length === 0)
      return res.status(404).json({ error: "Floor not found" });

    const floor_id = floorResult.rows[0].id;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      "INSERT INTO rooms (floor_id, room_number, capacity, image_url) VALUES ($1, $2, $3, $4) RETURNING *",
      [floor_id, Room_no, capacity, image_url]
    );
    await pool.query(
      "UPDATE floors SET total_rooms = total_rooms + 1 WHERE id = $1", [floor_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { Room_no } = req.body;
    if (!Room_no) return res.status(400).json({ error: "Room number required" });

    const result = await pool.query(
      "DELETE FROM rooms WHERE room_number = $1 RETURNING *", [Room_no]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Room not found" });

    await pool.query(
      "UPDATE floors SET total_rooms = total_rooms - 1 WHERE id = $1 AND total_rooms > 0",
      [result.rows[0].floor_id]
    );
    res.json({ success: true, message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRooms = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, f.floor_number FROM rooms r
       JOIN floors f ON f.id = r.floor_id
       ORDER BY f.floor_number, r.room_number ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const updateRoom = async (req, res) => {
  try {
    const { Room_no, capacity } = req.body;
    if (!Room_no || !capacity)
      return res.status(400).json({ error: "Room number and capacity are required" });

    const image_url = req.file ? `/uploads/${req.file.filename}` : undefined;

    const result = await pool.query(
      `UPDATE rooms 
       SET capacity = $1 ${image_url ? ", image_url = $3" : ""}
       WHERE room_number = $2
       RETURNING *`,
      image_url ? [capacity, Room_no, image_url] : [capacity, Room_no]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Room not found" });

    res.json({ success: true, data: result.rows[0], message: "Room updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
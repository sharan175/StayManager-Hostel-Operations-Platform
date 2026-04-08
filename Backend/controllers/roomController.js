import pool from "../config/db.js";

// CREATE ROOM
export const createRoom = async (req, res) => {
  try {
    const { Room_no, floor_no, capacity } = req.body;

    // Validation
    if (!Room_no || !floor_no || !capacity) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Get floor
    const floorResult = await pool.query(
      "SELECT id FROM floors WHERE floor_number = $1",
      [floor_no]
    );

    if (floorResult.rows.length === 0) {
      return res.status(404).json({ error: "Floor not found" });
    }

    const floor_id = floorResult.rows[0].id;

    // Insert room first
    const result = await pool.query(
      "INSERT INTO rooms (floor_id, room_number, capacity) VALUES ($1, $2, $3) RETURNING *",
      [floor_id, Room_no, capacity]
    );

    // Then update count
    await pool.query(
      "UPDATE floors SET total_rooms = total_rooms + 1 WHERE id = $1",
      [floor_id]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Room not created" });
  }
};


// DELETE ROOM
export const deleteRoom = async (req, res) => {
  try {
    const { Room_no } = req.body;

    if (!Room_no) {
      return res.status(400).json({ error: "Room number required" });
    }

    // Delete and get floor_id
    const result = await pool.query(
      "DELETE FROM rooms WHERE room_number = $1 RETURNING *",
      [Room_no]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    const floor_id = result.rows[0].floor_id;

    // Decrement count
    await pool.query(
      "UPDATE floors SET total_rooms = total_rooms - 1 WHERE id = $1 AND total_rooms > 0",
      [floor_id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};
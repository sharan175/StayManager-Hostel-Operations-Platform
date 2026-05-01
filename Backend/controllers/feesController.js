import pool from "../config/db.js";

export const payFees = async (req, res) => {
  const client = await pool.connect();
  try {
    const studentId = req.user.id;
    const { room_id, months_paid, amount } = req.body;

    if (!room_id || !months_paid || !amount) {
      return res.status(400).json({ message: "room_id, months_paid and amount are required" });
    }

    // check room exists and is available
    const roomResult = await client.query(
      "SELECT * FROM rooms WHERE id = $1",
      [room_id]
    );

    if (roomResult.rowCount === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!roomResult.rows[0].is_available) {
      return res.status(400).json({ message: "Room is not available" });
    }

    // check student not already allocated
    const allocationCheck = await client.query(
      "SELECT 1 FROM allocations WHERE student_id = $1 AND is_active = true",
      [studentId]
    );

    if (allocationCheck.rowCount > 0) {
      return res.status(400).json({ message: "Student already has an active allocation" });
    }

    // calculate expire_at
    const expireAt = new Date();
    expireAt.setMonth(expireAt.getMonth() + months_paid);

    // start transaction
    await client.query("BEGIN");

    // insert into fees
    const feesResult = await client.query(
      "INSERT INTO fees (student_id, amount, months_paid, expire_at) VALUES ($1, $2, $3, $4) RETURNING id",
      [studentId, amount, months_paid, expireAt]
    );
    const feesId = feesResult.rows[0].id;

    // insert into allocations
    await client.query(
      "INSERT INTO allocations (room_id, student_id, fees_id) VALUES ($1, $2, $3)",
      [room_id, studentId, feesId]
    );

    // increment occupied_count
    await client.query(
      "UPDATE rooms SET occupied_count = occupied_count + 1 WHERE id = $1",
      [room_id]
    );

    // mark fees_paid true on student
    await client.query(
      "UPDATE students SET fees_paid = true WHERE user_id = $1",
      [studentId]
    );

    await client.query("COMMIT");

    res.json({ message: "Payment successful, room allocated" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
};
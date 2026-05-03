import pool from "../config/db.js";

export const checkFees = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const studentId = req.user.id;

    // check fees_paid on student
    const studentResult = await client.query(
      "SELECT * FROM students WHERE user_id = $1",
      [studentId]
    );

   
    if (studentResult.rowCount === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = studentResult.rows[0];
  
    
    if (!student.fees_paid) {
      return res.status(403).json({ message: "Fees not paid" });
    }

   
    const feesResult = await client.query(
      "SELECT * FROM fees WHERE student_id = $1 ORDER BY paid_at DESC LIMIT 1",
      [studentId]
    );
    if (feesResult.rowCount === 0) {
      return res.status(403).json({ message: "No fees record found" });
    }
     console.log("req.user.id:", studentId);
     console.log("fees result:", feesResult.rows);

    const fees = feesResult.rows[0];
    const now = new Date();
    const expireAt = new Date(fees.expire_at);
    const gracePeriodEnd = new Date(fees.expire_at);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3);

    // within expiry — allow
    if (now < expireAt) {
      return next();
    }

    // grace period active — block but don't clean up
    if (now >= expireAt && now < gracePeriodEnd) {
      return res.status(403).json({ message: "Fees expired, please renew" });
    }

    // grace period over — clean up
    if (now >= gracePeriodEnd) {
      await client.query("BEGIN");

      // get active allocation
      const allocation = await client.query(
        "SELECT * FROM allocations WHERE student_id = $1 AND is_active = true",
        [studentId]
      );

      if (allocation.rowCount > 0) {
        const roomId = allocation.rows[0].room_id;

        // flip allocation inactive
        await client.query(
          "UPDATE allocations SET is_active = false WHERE student_id = $1 AND is_active = true",
          [studentId]
        );

        // decrement occupied_count
        await client.query(
          "UPDATE rooms SET occupied_count = occupied_count - 1 WHERE id = $1",
          [roomId]
        );
      }

      // flip fees_paid false
      await client.query(
        "UPDATE students SET fees_paid = false WHERE user_id = $1",
        [studentId]
      );

      await client.query("COMMIT");

      return res.status(403).json({ message: "Fees expired, room released. Please pay again" });
    }

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
};
import pool from "../config/db.js";

export const submitComplaint = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    // get student's actual id
    const studentResult = await pool.query(
      "SELECT id FROM students WHERE user_id = $1",
      [userId]
    );

    if (studentResult.rowCount === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentId = studentResult.rows[0].id;

    const result = await pool.query(
      "INSERT INTO complaints (student_id, title, description) VALUES ($1, $2, $3) RETURNING *",
      [studentId, title, description]
    );

    res.json({
      message: "Complaint submitted successfully",
      complaint: result.rows[0],
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
export const getComplaints = async (req, res) => {
  try {
    const userId = req.user.id;
      const studentResult = await pool.query(
      "SELECT id FROM students WHERE user_id = $1",
      [userId]
    );

    if (studentResult.rowCount === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentId = studentResult.rows[0].id;

    const result = await pool.query(
      "SELECT * FROM complaints WHERE student_id = $1 ORDER BY created_at DESC",
      [studentId]
    );

    res.json({
      message: "Complaints fetched successfully",
      complaints: result.rows,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
export const getWardenComplaints = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        c.id,
        c.title,
        c.description,
        c.image_url,
        c.status,
        u.name,
        r.room_number
       FROM complaints c
       JOIN students s ON s.id = c.student_id
       JOIN users u ON u.id = s.user_id
       JOIN allocations a ON u.id = a.student_id
       JOIN rooms r ON r.id = a.room_id
       JOIN floors f ON f.id = r.floor_id
       JOIN wardens w ON w.floor_id = f.id
       WHERE w.user_id = $1 AND c.status = false`,
      [userId]
    );

    res.json({
      message: "Complaints fetched successfully",
      complaints: result.rows,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const resolveComplaint = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // verify complaint belongs to warden's floor
    const check = await pool.query(
      `SELECT c.id
       FROM complaints c
       JOIN students s ON s.id = c.student_id
       JOIN users u ON u.id = s.user_id
       JOIN allocations a ON u.id = a.student_id
       JOIN rooms r ON r.id = a.room_id
       JOIN floors f ON f.id = r.floor_id
       JOIN wardens w ON w.floor_id = f.id
       WHERE w.user_id = $1 AND c.id = $2`,
      [userId, id]
    );

    if (check.rowCount === 0) {
      return res.status(403).json({ message: "Not authorized to resolve this complaint" });
    }

    await pool.query(
      "UPDATE complaints SET status = true WHERE id = $1",
      [id]
    );

    res.json({ message: "Complaint marked as resolved" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
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
import pool from "../config/db.js";

// CREATE FLOOR
export const createFloor = async (req, res) => {
  try {
    const { floor, name } = req.body;

    // Validation
    if (!floor || !name) {
      return res.status(400).json({
        success: false,
        message: "Floor number and name are required",
      });
    }

    const result = await pool.query(
      "INSERT INTO floors(floor_number, name) VALUES($1, $2) RETURNING *",
      [floor, name]
    );

    return res.status(201).json({
      success: true,
      data: result.rows[0],
      message: "Floor created successfully",
    });

  } catch (err) {
    // Handle duplicate key error (if constraint exists)
    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Floor already exists",
      });
    }

    console.error("Create Floor Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// DELETE FLOOR
export const deleteFloor = async (req, res) => {
  try {
    const { floor } = req.body;

    // Validation
    if (!floor) {
      return res.status(400).json({
        success: false,
        message: "Floor number is required",
      });
    }

    const result = await pool.query(
      "DELETE FROM floors WHERE floor_number = $1 RETURNING *",
      [floor]
    );

    // Check if floor exists
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Floor not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
      message: "Floor deleted successfully",
    });

  } catch (err) {
    console.error("Delete Floor Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
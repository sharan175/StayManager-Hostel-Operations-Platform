import pool from "../config/db.js";

export const createFloor = async (req, res) => {
  try {
    const { floor, name } = req.body;
    if (!floor || !name)
      return res.status(400).json({ success: false, message: "Floor number and name are required" });

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      "INSERT INTO floors(floor_number, name, image_url) VALUES($1, $2, $3) RETURNING *",
      [floor, name, image_url]
    );
    return res.status(201).json({ success: true, data: result.rows[0], message: "Floor created successfully" });
  } catch (err) {
    if (err.code === "23505")
      return res.status(409).json({ success: false, message: "Floor already exists" });
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteFloor = async (req, res) => {
  try {
    const { floor } = req.body;
    if (!floor)
      return res.status(400).json({ success: false, message: "Floor number is required" });
    const result = await pool.query(
      "DELETE FROM floors WHERE floor_number = $1 RETURNING *", [floor]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Floor not found" });
    return res.status(200).json({ success: true, message: "Floor deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getFloors = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM floors ORDER BY floor_number ASC"
    );
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
export const updateFloor = async (req, res) => {
  try {
    const { floor, name } = req.body;
    if (!floor || !name)
      return res.status(400).json({ success: false, message: "Floor number and name are required" });

    const image_url = req.file ? `/uploads/${req.file.filename}` : undefined;

    const result = await pool.query(
      `UPDATE floors 
       SET name = $1 ${image_url ? ", image_url = $3" : ""}
       WHERE floor_number = $2
       RETURNING *`,
      image_url ? [name, floor, image_url] : [name, floor]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: "Floor not found" });

    return res.json({ success: true, data: result.rows[0], message: "Floor updated" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
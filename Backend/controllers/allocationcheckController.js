import pool from "../config/db.js";
export const allocation=async(req,res)=>{
    const userId = req.user.id;
    try{
      const studentResult = await pool.query(
      "SELECT id,fees_paid FROM students WHERE user_id = $1",
      [userId]
    );

    if (studentResult.rowCount === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const Result = await pool.query(
      `select r.room_number,f.floor_number 
      from allocations a
      join rooms r on r.id=a.room_id
      join floors f on f.id=r.floor_id
      where a.student_id=$1`,
      [userId]
    );
     if(Result.rowCount==0){
        return res.json({ message: "no room found" })
     }

    res.json({
      message: "Complaints fetched successfully",
      fees_paid:studentResult.rows[0].fees_paid,
      floor:Result.rows[0].floor_number,
      rooms:Result.rows[0].room_number
    });

    }catch(err)
    {
         res.status(500).json({ message: err.message });
    }
}

import pool from "../config/db.js";
export  const createFloor=async(req,res)=>{
    try{
        const {floor,name}=req.body;
        const result=await pool.query("INSERT INTO floors(floor_number,name) VALUES($1,$2) RETURNING *",
            [floor,name]);
            res.json(result.rows[0]);

        
    }
        catch(err){
            res.status(500).json({error: err.message})
        }
    
}
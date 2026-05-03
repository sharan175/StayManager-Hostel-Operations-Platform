import pool from "../config/db.js";
export const getstudent =async (req,res)=>{
try{
   const userId=req.user.id;
   const floorResult=await pool.query("select floor_id from wardens where user_id=$1",[userId])
   if(floorResult.rowCount==0){
    return res.status(404).json({ message: "floor not assigned" });
   }
   const floor=floorResult.rows[0].floor_id;
   const studentDetail = await pool.query(
  `
  select 
    u.name as name,
    u.phone_no as phone,
    r.room_number,
    s.fees_paid as paid
  from floors f 
  join rooms r on r.floor_id = f.id
  join allocations a on a.room_id = r.id
  join users u on u.id = a.student_id
  join students s on s.user_id = u.id
  where f.id = $1
  `,
  [floor]
);
 if(studentDetail.rows.length ===0){
    return res.json({message:"No details found"})
 }
    res.status(200).json({message:"success",user:studentDetail.rows})
}catch(err){
    res.status(500).json({ message: err.message });
}
}
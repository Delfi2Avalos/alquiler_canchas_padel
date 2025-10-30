import { Router } from "express";
import { pool } from "../config/db.js";
const r = Router();

// GET /canchas?sedeId=...
r.get("/", async (req,res)=>{
  const { sedeId } = req.query;
  try {
    const [rows] = await pool.execute(
      sedeId ? "SELECT * FROM Canchas WHERE sede_id=?" : "SELECT * FROM Canchas",
      sedeId ? [sedeId] : []
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.code || e.message });
  }
});

export default r;

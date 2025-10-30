import express from "express";
import cors from "cors";
import { pool } from "./config/db.js";
import canchasRouter from "./routes/canchas.js";
import reservasRouter from "./routes/reservas.js";

const app = express();
app.use(cors());
app.use(express.json());

// Home
app.get("/", (req,res)=> res.json({ ok:true, service:"padel-api" }));

// Healthcheck DB
app.get("/health/db", async (req,res)=>{
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT 1 AS ok");
    conn.release();
    res.json({ ok: rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ ok:false, error: e.code || e.message });
  }
});

// Rutas
app.use("/canchas", canchasRouter);
app.use("/reservas", reservasRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`API running at http://localhost:${PORT}`));

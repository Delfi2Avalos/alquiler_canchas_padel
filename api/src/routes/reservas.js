import { Router } from "express";
import { pool } from "../config/db.js";
const r = Router();

// POST /reservas
// body: { canchaId, clienteId, fecha, horaInicio, horaFin, precio }
r.post("/", async (req,res)=>{
  const { canchaId, clienteId, fecha, horaInicio, horaFin, precio } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Mantenimiento solapado
    const [mant] = await conn.execute(
      `SELECT 1 FROM Mantenimiento 
       WHERE cancha_id=? AND (fecha_inicio <= ? AND fecha_fin >= ?) LIMIT 1`,
      [canchaId, `${fecha} ${horaInicio}`, `${fecha} ${horaFin}`]
    );
    if (mant.length) throw new Error("Cancha en mantenimiento");

    // Choque de reservas
    const [ch] = await conn.execute(
      `SELECT 1 FROM Reservas 
       WHERE cancha_id=? AND fecha=? 
         AND NOT (hora_fin <= ? OR hora_inicio >= ?)
       LIMIT 1`,
      [canchaId, fecha, horaInicio, horaFin]
    );
    if (ch.length) throw new Error("Franja ocupada");

    // Insert
    const [ins] = await conn.execute(
      `INSERT INTO Reservas (cancha_id, cliente_id, fecha, hora_inicio, hora_fin, estado, precio)
       VALUES (?,?,?,?,?,'pendiente',?)`,
      [canchaId, clienteId, fecha, horaInicio, horaFin, precio]
    );

    await conn.commit();
    res.status(201).json({ id: ins.insertId, estado: "pendiente" });
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ error: e.message });
  } finally {
    conn.release();
  }
});

export default r;

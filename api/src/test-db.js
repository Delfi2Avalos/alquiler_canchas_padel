import { pool } from "./config/db.js";

try {
  const conn = await pool.getConnection();
  const [rows] = await conn.query("SELECT 1 AS ok, DATABASE() AS db");
  conn.release();
  console.log("✅ Conectado a MySQL:", rows[0]);
  process.exit(0);
} catch (e) {
  console.error("❌ Error de conexión:", e.code || e.message);
  process.exit(1);
}

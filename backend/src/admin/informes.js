import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/reservas", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DATE(fecha_creacion) AS fecha, COUNT(*) AS total_reservas
      FROM reservas
      WHERE estado='confirmada'
      GROUP BY DATE(fecha_creacion)
      ORDER BY fecha ASC
    `);
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error("Error reservas:", err);
    res.status(500).json({ ok: false, msg: "Error en servidor" });
  }
});

router.get("/cancelaciones", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DATE(fecha_creacion) AS fecha, COUNT(*) AS total_cancelaciones
      FROM reservas
      WHERE estado='cancelada'
      GROUP BY DATE(fecha_creacion)
      ORDER BY fecha ASC
    `);
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error("Error cancelaciones:", err);
    res.status(500).json({ ok: false, msg: "Error en servidor" });
  }
});

router.get("/medicos", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT CONCAT(u.name, ' ', u.last) AS nombre_medico,
             COUNT(r.id) AS total_reservas
      FROM reservas r
      JOIN users u ON r.user_id = u.id
      WHERE u.role='medico' AND r.estado='confirmada'
      GROUP BY r.user_id
      ORDER BY total_reservas DESC
    `);
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error("Error reservas por médico:", err);
    res.status(500).json({ ok: false, msg: "Error en servidor" });
  }
});

export default router;

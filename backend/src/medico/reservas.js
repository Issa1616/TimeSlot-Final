import express from "express";
import { pool } from "./db.js";
const router = express.Router();

router.get("/medico/:medicoId", async (req, res) => {
  const { medicoId } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT r.id, r.estado, r.fecha_creacion, 
             hs.fecha AS fecha_servicio, hs.hora_inicio, hs.hora_fin,
             s.nombre AS servicio_nombre, s.descripcion AS servicio_desc,
             u.id AS paciente_id, u.name AS paciente_name, u.last AS paciente_last
      FROM reservas r
      JOIN horario_servicio hs ON r.horario_servicio_id = hs.id
      JOIN servicios s ON hs.servicio_id = s.id
      JOIN users u ON r.user_id = u.id
      WHERE s.user_id = ?
      ORDER BY hs.fecha, hs.hora_inicio
    `, [medicoId]);
    
    res.json(rows);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Error al obtener reservas" });
  }
});

export default router;

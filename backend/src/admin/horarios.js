import express from "express";
import { pool } from "../db.js"; 

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT h.id, h.negocio_id, h.dia_semana, h.hora_inicio, h.hora_fin, h.abierto,
              n.nombre AS negocio_nombre
       FROM horarios h
       JOIN negocios n ON h.negocio_id = n.id
       ORDER BY h.negocio_id, FIELD(h.dia_semana, 'lunes','martes','miércoles','jueves','viernes','sábado','domingo')`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener horarios" });
  }
});

router.put("/", async (req, res) => {
  const horarios = req.body; 
  if (!Array.isArray(horarios)) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  try {
    const updates = horarios.map(h => 
      pool.query(
        "UPDATE horarios SET hora_inicio=?, hora_fin=?, abierto=? WHERE id=?",
        [h.hora_inicio, h.hora_fin, h.abierto, h.id]
      )
    );

    await Promise.all(updates);
    res.json({ message: "Horarios actualizados correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar horarios" });
  }
});

export default router;

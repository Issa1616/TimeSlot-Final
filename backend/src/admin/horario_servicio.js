import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.post("/generar-franjas", async (req, res) => {
  const franjas = req.body;
  if (!Array.isArray(franjas) || franjas.length === 0) {
    return res.status(400).json({ error: "No se recibieron franjas" });
  }
  try {
    for (const f of franjas) {
      const { servicio_id, horario_id, fecha, hora_inicio, hora_fin } = f;
      const [existing] = await pool.query(
        "SELECT id FROM horario_servicio WHERE servicio_id = ? AND horario_id = ? AND fecha = ? AND hora_inicio = ?",
        [servicio_id, horario_id, fecha, hora_inicio]
      );
      if (existing.length > 0) continue;
      await pool.query(
        "INSERT INTO horario_servicio (servicio_id, horario_id, fecha, hora_inicio, hora_fin) VALUES (?, ?, ?, ?, ?)",
        [servicio_id, horario_id, fecha, hora_inicio, hora_fin]
      );
    }
    res.json({ ok: true, message: "Franjas generadas correctamente" });
  } catch (e) {
    console.error("Error generando franjas:", e);
    res.status(500).json({ error: "Error generando franjas" });
  }
});

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM horario_servicio");
    res.json(rows);
  } catch (e) {
    console.error("Error obteniendo franjas:", e);
    res.status(500).json({ error: "Error obteniendo franjas" });
  }
});

export default router;

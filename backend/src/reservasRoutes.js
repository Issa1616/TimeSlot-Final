
import { Router } from "express";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";

const r = Router();


function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}


r.get("/", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, area, profesional, fechaISO, hora, modalidad FROM reservas_chatbot WHERE user_id = ?",
      [req.user.id]
    );

    const reservas = rows.map((r) => ({
      id: String(r.id),
      userId: req.user.id,
      area: r.area,
      profesional: r.profesional,
      fechaISO: r.fechaISO,
      hora: r.hora,
      modalidad: r.modalicad || "Presencial",
    }));

    res.json(reservas);
  } catch (e) {
    console.error("Error cargando reservas:", e);
    res.status(500).json({ error: "Error al cargar reservas" });
  }
});

r.post("/", auth, async (req, res) => {
  try {
    const { area, profesional, fechaISO, hora, modalidad } = req.body || {};

    if (!area || !profesional || !fechaISO || !hora) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const [result] = await pool.query(
      `INSERT INTO reservas_chatbot 
        (user_id, area, profesional, fechaISO, hora, modalidad)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        area,
        profesional,
        fechaISO,
        hora,
        modalidad || "Presencial",
      ]
    );

    const insertId = result.insertId;

    const nueva = {
      id: String(insertId),
      userId: req.user.id,
      area,
      profesional,
      fechaISO,
      hora,
      modalidad: modalidad || "Presencial",
    };

    res.status(201).json(nueva);
  } catch (e) {
    console.error("Error creando reserva:", e);
    res.status(500).json({ error: "Error al crear reserva" });
  }
});

export default r;

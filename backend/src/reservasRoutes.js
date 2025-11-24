import { Router } from "express";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";

const r = Router();
const reservas = []; 

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
    const locales = reservas.filter((x) => x.userId === req.user.id);

    const [rows] = await pool.query(
      "SELECT id, area, profesional, fechaISO, hora, modalidad FROM reservas_chatbot WHERE user_id = ?",
      [req.user.id]
    );


    const desdeChatbot = rows.map((r) => ({
      id: String(r.id),
      userId: req.user.id,
      area: r.area,
      profesional: r.profesional,
      fechaISO: r.fechaISO,
      hora: r.hora,
      modalidad: r.modalidad || "Presencial",
    }));

    
    const todas = [...locales, ...desdeChatbot];

    res.json(todas);
  } catch (e) {
    console.error("Error cargando reservas:", e);
    res.status(500).json({ error: "Error al cargar reservas" });
  }
});


r.post("/", auth, (req, res) => {
  const { area, profesional, fechaISO, hora, modalidad } = req.body || {};
  if (!area || !profesional || !fechaISO || !hora) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const nuevo = {
    id: String(Date.now()),
    userId: req.user.id,
    area,
    profesional,
    fechaISO,
    hora,
    modalidad: modalidad || "Presencial",
  };

  reservas.push(nuevo);
  res.json(nuevo);
});

export default r;

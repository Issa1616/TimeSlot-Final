import express from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, last, email, phone FROM users WHERE role='medico'"
    );
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener médicos" });
  }
});

router.post("/", async (req, res) => {
  const { name, last, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const [exists] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
    if (exists.length > 0) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (name, last, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?, 'medico')",
      [name, last || "", email, password_hash, phone || ""]
    );

    res.status(201).json({ message: "Médico creado correctamente", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, last, email, phone } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE users SET name=?, last=?, email=?, phone=? WHERE id=? AND role='medico'",
      [name, last || "", email, phone || "", id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Médico no encontrado" });
    }

    res.json({ message: "Médico actualizado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "DELETE FROM users WHERE id=? AND role='medico'",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Médico no encontrado" });
    }

    res.json({ message: "Médico eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;

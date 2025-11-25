console.log("JWT_SECRET:", process.env.JWT_SECRET);
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";
import crypto from "crypto";

const r = Router();

function signToken(userId, role) {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}


r.post("/register", async (req, res) => {
  const { name, last, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const [existe] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existe.length > 0) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    const hash = await bcrypt.hash(password, 10);

    const finalRole = "paciente"; 

    const [result] = await pool.query(
      "INSERT INTO users (name, last, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
      [name, last || null, email, hash, finalRole]
    );

    const user = {
      id: result.insertId,
      name,
      last: last || null,
      email,
      role: finalRole,
    };

    // ⚠ YA NO INICIA SESIÓN aquí. Registro solo crea usuario.
    return res.json({ ok: true, user });
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});


r.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT id, name, last, email, password_hash, role FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const user = rows[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const token = signToken(user.id, user.role);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        last: user.last,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});


r.post("/forgot", async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: "Falta el email" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      console.log("Intento reset email NO existe:", email);
      return res.json({
        ok: true,
        message:
          "Si el correo está registrado, se enviarán instrucciones.",
      });
    }

    const userId = rows[0].id;

    const token = crypto.randomBytes(20).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 30);

    console.log("Reset solicitado:", email, token);

    return res.json({
      ok: true,
      message:
        "Te enviamos un correo con los pasos (simulado).",
    });
  } catch (err) {
    console.log("FORGOT ERROR:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

r.post("/reset", async (req, res) => {
  const { token, password } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT id, user_id, expires_at, used 
       FROM password_resets 
       WHERE token = ? 
       ORDER BY id DESC 
       LIMIT 1`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Token inválido" });
    }

    const rset = rows[0];

    if (rset.used === 1 || new Date(rset.expires_at) < new Date()) {
      return res.status(400).json({ error: "Token expirado" });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [hash, rset.user_id]
    );

    await pool.query(
      "UPDATE password_resets SET used = 1 WHERE id = ?",
      [rset.id]
    );

    return res.json({ ok: true });
  } catch (err) {
    console.log("RESET ERROR:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

export default r;

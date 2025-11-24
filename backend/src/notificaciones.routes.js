
import { Router } from "express";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";

const r = Router();


const pushTokens = new Map();


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


r.post("/token", auth, (req, res) => {
  const { pushToken } = req.body || {};
  if (!pushToken) {
    return res.status(400).json({ error: "Falta pushToken" });
  }

  pushTokens.set(req.user.id, pushToken);
  console.log("💾 Guardado pushToken para usuario", req.user.id, pushToken);
  res.json({ ok: true });
});


r.post("/test", auth, async (req, res) => {
  const pushToken = pushTokens.get(req.user.id);
  if (!pushToken) {
    return res
      .status(400)
      .json({ error: "Este usuario no tiene pushToken registrado" });
  }

  try {
    const expoRes = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: pushToken,
        sound: "default",
        title: "TimeSlot",
        body: "Tienes reservas próximas en TimeSlot.",
      }),
    });

    const expoJson = await expoRes.json();
    console.log("📨 Respuesta Expo:", expoJson);
    res.json({ ok: true, expo: expoJson });
  } catch (e) {
    console.error("Error enviando push:", e);
    res.status(500).json({ error: "No se pudo enviar la notificación" });
  }
});

export default r;

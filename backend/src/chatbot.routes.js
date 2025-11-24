import { Router } from "express";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";
import { responderIA } from "./ia.js";

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

r.post("/", auth, async (req, res) => {
  const { message = "", context = {} } = req.body || {};
  const texto = message.toLowerCase().trim();

  let ctx = { ...context };
  let reply = "";
  let readyToCreate = false;

  if (!ctx.intent) {
    const quiereReserva =
      texto.includes("reserva") ||
      texto.includes("turno") ||
      texto.includes("cita");

    if (quiereReserva) {
      ctx.intent = "crear_reserva";
      reply =
        "Perfecto, te ayudo a crear una reserva 🩺\n\n" +
        "¿Para qué área es? (Ej: Clínica Médica, Odontología, Nutrición)";
      return res.json({ reply, context: ctx, readyToCreate });
    }


    try {
      const iaReply = await responderIA(message, ctx);
      return res.json({
        reply: iaReply,
        context: ctx,
        readyToCreate: false,
      });
    } catch (err) {
      console.error("Error en responderIA:", err);
      return res.status(500).json({
        reply:
          "Hubo un problema al usar la IA 😓. Intentá de nuevo más tarde.",
        context: ctx,
        readyToCreate: false,
      });
    }
  }

  if (ctx.intent === "crear_reserva") {
    if (!ctx.area) {
      ctx.area = message.trim();
      reply =
        `Genial, área: *${ctx.area}* ✅\n\n` +
        "Ahora decime con qué profesional querés el turno (Ej: Dr. Pérez, Dra. García).";
      return res.json({ reply, context: ctx, readyToCreate });
    }

    if (!ctx.profesional) {
      ctx.profesional = message.trim();
      reply =
        `Perfecto, profesional: *${ctx.profesional}* ✅\n\n` +
        "¿Para qué fecha lo querés? Usá el formato *AAAA-MM-DD* (Ej: 2025-11-20).";
      return res.json({ reply, context: ctx, readyToCreate });
    }

    if (!ctx.fechaISO) {
      const fecha = message.trim();
      const esValida = /^\d{4}-\d{2}-\d{2}$/.test(fecha);
      if (!esValida) {
        reply =
          "Formato de fecha inválido ❌. Por favor usá el formato *AAAA-MM-DD* (Ej: 2025-11-20).";
        return res.json({ reply, context: ctx, readyToCreate });
      }

      ctx.fechaISO = fecha;
      reply =
        `Fecha: *${ctx.fechaISO}* ✅\n\n` +
        "¿A qué hora? Usá el formato *HH:MM* en 24 horas (Ej: 14:30).";
      return res.json({ reply, context: ctx, readyToCreate });
    }

    if (!ctx.hora) {
      const hora = message.trim();
      const esValida = /^\d{2}:\d{2}$/.test(hora);
      if (!esValida) {
        reply =
          "Formato de hora inválido ❌. Usá el formato *HH:MM* en 24 horas (Ej: 09:00 o 14:30).";
        return res.json({ reply, context: ctx, readyToCreate });
      }

      ctx.hora = hora;
      reply =
        `Hora: *${ctx.hora}* ✅\n\n` +
        "Por último, ¿la consulta es *presencial* o *virtual*?";
      return res.json({ reply, context: ctx, readyToCreate });
    }

    if (!ctx.modalidad) {
      let modalidad = message.toLowerCase().trim();
      if (modalidad.includes("pres")) modalidad = "presencial";
      if (modalidad.includes("vir")) modalidad = "virtual";

      if (modalidad !== "presencial" && modalidad !== "virtual") {
        reply =
          "No entendí la modalidad ❌. Decime si la consulta es *presencial* o *virtual*.";
        return res.json({ reply, context: ctx, readyToCreate });
      }

      ctx.modalidad = modalidad;

      readyToCreate = true;
      reply =
        "Perfecto, ya tengo todos los datos ✅\n\n" +
        `• Área: *${ctx.area}*\n` +
        `• Profesional: *${ctx.profesional}*\n` +
        `• Fecha: *${ctx.fechaISO}*\n` +
        `• Hora: *${ctx.hora}*\n` +
        `• Modalidad: *${ctx.modalidad}*\n\n` +
        "¿Querés que confirme esta reserva? Escribí *sí* para confirmar o *no* para cancelar.";
      return res.json({ reply, context: ctx, readyToCreate });
    }

    if (ctx.modalidad && !ctx.confirmado) {
      if (texto === "si" || texto === "sí" || texto.includes("confirm")) {
        ctx.confirmado = true;

        try {
          const [result] = await pool.query(
            "INSERT INTO reservas_chatbot(user_id, area, profesional, fechaISO, hora, modalidad) VALUES (?,?,?,?,?,?)",
            [
              req.user.id,
              ctx.area,
              ctx.profesional,
              ctx.fechaISO,
              ctx.hora,
              ctx.modalidad,
            ]
          );

          const reservaId = result.insertId;

          reply =
            "Listo 🙌 tu reserva fue creada correctamente.\n\n" +
            `🆔 Código de reserva: *#${reservaId}*\n` +
            `• Área: *${ctx.area}*\n` +
            `• Profesional: *${ctx.profesional}*\n` +
            `• Fecha: *${ctx.fechaISO}*\n` +
            `• Hora: *${ctx.hora}*\n` +
            `• Modalidad: *${ctx.modalidad}*\n\n` +
            "Gracias por usar el asistente de TimeSlot 💙";

          ctx = {};
          return res.json({ reply, context: ctx, readyToCreate: false });
        } catch (err) {
          console.error("Error creando reserva_chatbot:", err);
          reply =
            "Ups, hubo un error al crear la reserva 😢. Intentá de nuevo más tarde o hacela desde la pantalla de reservas.";
          return res.json({ reply, context: ctx, readyToCreate: false });
        }
      } else if (texto === "no" || texto.includes("cancel")) {
        ctx.confirmado = false;
        reply =
          "Ok, cancelé la creación de la reserva ❌.\n" +
          'Si querés, podés empezar otra diciendo: *"quiero hacer una reserva"*.';
        ctx = {};
        return res.json({ reply, context: ctx, readyToCreate: false });
      } else {
        reply = "No entendí 🤔. ¿Confirmás la reserva? Respondé *sí* o *no*.";
        return res.json({ reply, context: ctx, readyToCreate });
      }
    }
  }

  reply =
    "Mmm, creo que nos perdimos un poco 🤯. Podés decirme de nuevo: *quiero hacer una reserva* y empezamos otra vez.";
  return res.json({ reply, context: {}, readyToCreate: false });
});

export default r;

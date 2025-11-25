
import Groq from "groq-sdk";
import { agregarMensaje, obtenerHistorial } from "./memory.js";

let client = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.error("❌ Falta GROQ_API_KEY en el .env");
      throw new Error("Falta GROQ_API_KEY");
    }

    console.log("🔑 Groq inicializado");
    client = new Groq({ apiKey });
  }

  return client;
}

export async function responderIA(mensaje) {
  try {
    const groq = getClient();

    agregarMensaje("user", mensaje);
    const mensajes = [
      {
        role: "system",
        content:
          "Sos un asistente virtual llamado TimeSlotBot. " +
          "Contestás SIEMPRE en español, breve, claro y amable. " +
          "Trabajás para una app de reservas médicas llamada TimeSlot. " +
          "Tenés memoria de la conversación (se te envía el historial) y debés usarla " +
          "para recordar lo que el usuario ya dijo anteriormente. " +
          "Si el usuario expresa intención de reservar un turno (por ejemplo: 'quiero reservar', 'quiero un turno', 'necesito cita'), seguí este flujo GUIADO (sin crear reservas reales por tu cuenta): " +
          "1) Preguntá el área o especialidad (por ejemplo: clínica, psicología, nutrición, etc.). " +
          "2) Preguntá la fecha deseada (en formato día/mes o día/mes/año). " +
          "3) Preguntá si prefiere mañana o tarde y sugerí 2 o 3 horarios posibles (por ejemplo 9:00, 10:30, 15:00) pero aclará que son horarios simulados. " +
          "4) Una vez que el usuario confirma un horario, respondé algo como: 'Perfecto, tu reserva queda lista para [fecha] a las [hora] con [profesional/área]. La app se encargará de registrarla.' " +
          "NO inventes que ya se guardó en el sistema, solo indicá que la app la va a registrar. " +
          "Si el usuario pregunta cosas que no tienen que ver con salud o reservas, respondé igual de forma cordial pero corta.",
      },
      ...obtenerHistorial(),
    ];

    const respuesta = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", 
      messages: mensajes,
    });

    const texto =
      respuesta.choices[0]?.message?.content ??
      "No pude generar una respuesta ahora.";
    agregarMensaje("assistant", texto);

    return texto;
  } catch (err) {
    console.error("❌ Error con Groq:", err);
    return "Ahora mismo no puedo responder como asistente inteligente 😓. Probá de nuevo en un ratito.";
  }
}

import OpenAI from "openai";

let client = null;


function getClient() {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("❌ No existe OPENAI_API_KEY dentro del .env o no cargó");
      throw new Error("Falta OPENAI_API_KEY");
    }

    console.log(
      "🔑 Inicializando OpenAI con key que empieza en:",
      apiKey.slice(0, 10)
    );

    client = new OpenAI({ apiKey });
  }

  return client;
}

export async function responderIA(mensaje, contextoOpcional = {}) {
  try {
    const openai = getClient();

    const respuesta = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "Sos un asistente virtual llamado TimeSlotBot. " +
            "Contestás siempre en español, breve y claro. " +
            "Trabajás para una app de reservas médicas TimeSlot. " +
            "Si el usuario quiere reservar, decile que escriba 'quiero hacer una reserva'.",
        },
        {
          role: "user",
          content: mensaje,
        },
      ],
    });

    return (
      respuesta.choices[0]?.message?.content ??
      "No pude generar una respuesta ahora."
    );
  } catch (err) {
    console.error("❌ Error llamando a OpenAI:", err);
    return "Ahora mismo no puedo responder como asistente inteligente 😓. Probá de nuevo en un ratito.";
  }
}

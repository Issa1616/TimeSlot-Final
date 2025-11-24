import express from "express";
import cors from "cors";
import dotenv from "dotenv";


dotenv.config({ override: true });

import chatbotRoutes from "./chatbot.routes.js";
import authRoutes from "./auth.routes.js";
import reservasRoutes from "./reservasroutes.js";
import notificacionesRoutes from "./notificaciones.routes.js";
import servicios from "./admin/servicios.js";
import informesRouter from "./admin/informes.js";
import usuariosRoutes from "./admin/usuarios.js";
import horariosRoutes from "./admin/horarios.js";
import horarioServicioRouter from "./admin/horario_servicio.js";

import { pool } from "./db.js";

console.log(
  "🔑 OPENAI_API_KEY cargada (primeros 10 chars):",
  process.env.OPENAI_API_KEY?.slice(0, 10)
);

const app = express();

const ORIGIN = process.env.CORS_ORIGIN || true;
app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json());


app.use("/api/chatbot", chatbotRoutes);


pool
  .query("SELECT 1")
  .then(() => console.log("✅ MySQL disponible"))
  .catch((e) => console.log("⚠️ MySQL NO disponible:", e.message));

app.use((req, _res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});


app.get("/api/health", (_req, res) => res.json({ ok: true }));


app.use("/api/auth", authRoutes);
app.use("/api/reservas", reservasRoutes); 
app.use("/api/servicios", servicios);
app.use("/api/informes", informesRouter);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/horarios", horariosRoutes);
app.use("/api/horario_servicio", horarioServicioRouter);



app.use((req, res) => res.status(404).json({ error: "Not found" }));


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ API escuchando en http://0.0.0.0:${PORT}`);
});

import express from "express";
import cors from "cors";
import servicios from "./src/admin/servicios.js";
import informesRouter from "./src/admin/informes.js";
import usuariosRoutes from "./src/admin/usuarios.js";
import horariosRoutes from "./src/admin/horarios.js";


const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/servicios", servicios);
app.use("/api/informes", informesRouter);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/horarios", horariosRoutes);

const PORT = 4000;
app.listen(PORT, "0.0.0.0", () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
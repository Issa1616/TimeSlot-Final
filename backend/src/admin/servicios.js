import { Router } from "express"; 
import { pool } from "../db.js"; 

const router = Router(); 

router.get("/", async (req, res) => { 
  try { 
    const [rows] = await pool.query(`
      SELECT 
        s.id AS servicio_id, 
        s.nombre AS nombre_servicio, 
        s.descripcion, 
        s.duracion_min, 
        s.user_id, 
        u.name AS medico_nombre, 
        u.last AS medico_apellido 
      FROM servicios s 
      LEFT JOIN users u ON s.user_id = u.id 
      ORDER BY s.id DESC
    `); 
    res.json({ ok: true, data: rows }); 
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ ok: false, msg: "Error en servidor" }); 
  } 
}); 

router.get("/medicos", async (req, res) => { 
  try { 
    const [rows] = await pool.query(`
      SELECT id AS usuario_id, name AS nombre_usuario, last AS apellido 
      FROM users 
      WHERE role='medico' 
      ORDER BY name
    `); 
    res.json({ ok: true, data: rows }); 
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ ok: false, msg: "Error en servidor" }); 
  } 
}); 

router.put("/asignar", async (req, res) => { 
  try { 
    const { servicio_id, usuario_id } = req.body; 
    if (!servicio_id || !usuario_id) { 
      return res.status(400).json({ ok: false, msg: "Faltan parámetros" }); 
    } 
    await pool.query(`UPDATE servicios SET user_id=? WHERE id=?`, [usuario_id, servicio_id]); 
    const [rows] = await pool.query(`
      SELECT id AS servicio_id, nombre AS nombre_servicio, descripcion, duracion_min, user_id 
      FROM servicios 
      WHERE id=?`, [servicio_id]); 
    res.json({ ok: true, msg: "Médico asignado correctamente", data: rows[0] }); 
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ ok: false, msg: "Error en servidor" }); 
  } 
}); 

router.post("/", async (req, res) => { 
  try { 
    console.log("BODY RECIBIDO:", req.body); 
    const { nombre_servicio, descripcion, duracion_min, negocio_id, user_id } = req.body; 
    if (!nombre_servicio || !duracion_min || !negocio_id) { 
      console.log("Faltan datos", { nombre_servicio, duracion_min, negocio_id }); 
      return res.status(400).json({ ok: false, msg: "Faltan datos obligatorios" }); 
    } 
    const [result] = await pool.query(
      `INSERT INTO servicios (negocio_id, user_id, nombre, descripcion, duracion_min) VALUES (?, ?, ?, ?, ?)`, 
      [negocio_id, user_id || null, nombre_servicio, descripcion, duracion_min]
    ); 
    console.log("INSERT REALIZADO:", result); 
    const [rows] = await pool.query(`
      SELECT id AS servicio_id, nombre AS nombre_servicio, descripcion, duracion_min, user_id, negocio_id 
      FROM servicios 
      WHERE id=?`, [result.insertId]); 
    console.log("SELECT RESULT:", rows); 
    res.json({ ok: true, data: rows[0] }); 
  } catch (err) { 
    console.error("Error al crear servicio:", err); 
    res.status(500).json({ ok: false, msg: "Error en servidor" }); 
  } 
}); 

router.put("/:id", async (req, res) => { 
  try { 
    const { id } = req.params; 
    const { nombre_servicio, descripcion, duracion_min } = req.body; 
    await pool.query(`UPDATE servicios SET nombre=?, descripcion=?, duracion_min=? WHERE id=?`, 
      [nombre_servicio, descripcion, duracion_min, id]
    ); 
    const [rows] = await pool.query(`
      SELECT id AS servicio_id, nombre AS nombre_servicio, descripcion, duracion_min, user_id 
      FROM servicios 
      WHERE id=?`, [id]); 
    res.json({ ok: true, data: rows[0] }); 
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ ok: false, msg: "Error en servidor" }); 
  } 
}); 

router.delete("/:id", async (req, res) => { 
  try { 
    const { id } = req.params; 
    const [rows] = await pool.query("SELECT id FROM servicios WHERE id = ?", [id]); 
    if (rows.length === 0) { 
      return res.status(404).json({ ok: false, msg: "Servicio no encontrado" }); 
    } 
    await pool.query("DELETE FROM servicios WHERE id = ?", [id]); 
    res.json({ ok: true, msg: "Servicio eliminado correctamente" }); 
  } catch (err) { 
    console.error("Error al eliminar servicio:", err); 
    res.status(500).json({ ok: false, msg: "Error en servidor" }); 
  } 
}); 

export default router;

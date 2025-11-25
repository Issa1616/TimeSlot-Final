

let historial = [];

/**
 * Agrega un mensaje al historial
 * @param {"user" | "assistant"} role
 * @param {string} content
 */
export function agregarMensaje(role, content) {
  historial.push({ role, content });

  if (historial.length > 10) {
    historial = historial.slice(-10);
  }
}

export function obtenerHistorial() {
  return [...historial];
}


export function limpiarHistorial() {
  historial = [];
}

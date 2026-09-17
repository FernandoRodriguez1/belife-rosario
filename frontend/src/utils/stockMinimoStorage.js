// ============================================================================
// stockMinimoStorage.js — SOLUCIÓN TEMPORAL (VÉASE "IMPORTANTE" ABAJO)
// ============================================================================
// El backend (belife-rosario.API) NO tiene la columna "stock_minimo" en su
// esquema de producto: es un campo que vive solo en el frontend. Cada vez que
// el frontend refresca los datos desde la API, el valor configurado se perdía
// y volvía a usarse el default.
//
// Para conservar el valor entre sesiones lo persistimos en localStorage usando
// una key por producto ("stock_minimo_producto_{id}").
//
// IMPORTANTE: esto es un workaround mientras el backend no tenga esta columna.
// Cuando la base de datos real lo soporte, hay que migrar estas funciones para
// leer/escribir el campo desde la API (eliminando también estas keys) y borrar
// este archivo. No reutilizar para otros datos.
// ============================================================================

import { getDefaultStockMinimo } from './unidadPrecio';

function keyParaProducto(productoId) {
  return `stock_minimo_producto_${productoId}`;
}

export function guardarStockMinimo(productoId, valor) {
  if (productoId == null) return;
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < 0) return;

  try {
    localStorage.setItem(keyParaProducto(productoId), String(numero));
  } catch {
    // localStorage puede no estar disponible (modo privado, cuota llena);
    // no debe romper el guardado del producto.
  }
}

export function obtenerStockMinimo(productoId, unidadMedida, unidadPrecio) {
  try {
    const guardado = localStorage.getItem(keyParaProducto(productoId));
    if (guardado !== null) {
      const numero = Number(guardado);
      if (Number.isFinite(numero) && numero >= 0) return numero;
    }
  } catch {
    // si no hay acceso a localStorage, caemos al default.
  }
  return getDefaultStockMinimo(unidadMedida, unidadPrecio);
}

export function eliminarStockMinimo(productoId) {
  try {
    localStorage.removeItem(keyParaProducto(productoId));
  } catch {
    // ignorar fallos de localStorage.
  }
}

// Re-export para compatibilidad con código existente
export { getDefaultStockMinimo } from './unidadPrecio';
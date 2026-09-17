// ============================================================================
// unidadPrecio.js — conversión gramos ↔ kilos (modo de presentación)
// ============================================================================
// El stock y el stock mínimo se almacenan SIEMPRE en gramos (o en unidades,
// cuando la unidad de medida es "Unidad"). El modo "kilos" (unidad_medida =
// "Gramos" + unidad_precio = "Por-Kilo") es solo una vista del formulario:
// 1 kg = 1000 g.
//
// Centralizar acá la conversión evita duplicar el factor 1000 entre el modal
// (presentación/ingreso) y el hook (frontera con la API, que siempre habla en
// gramos). El hook NO convierte: recibe y devuelve gramos tal cual.
// ============================================================================

export const GRAMOS_POR_KILO = 1000;

// Paso del selector de cantidad en modo kilos (0.1 kg).
export const PASO_KILOGRAMOS = 0.1;

// Redondea kg a precisión de gramos (3 decimales) para no arrastrar errores de
// coma flotante al sumar/restar el paso de 0.1 kg.
export function redondearKilos(kilos) {
  return Math.round(kilos * GRAMOS_POR_KILO) / GRAMOS_POR_KILO;
}

export function esModoKilos(unidadMedida, unidadPrecio) {
  return unidadMedida === 'Gramos' && unidadPrecio === 'Por-Kilo';
}

export function aKilos(gramos) {
  return gramos / GRAMOS_POR_KILO;
}

export function aGramos(kilos) {
  return Math.round(kilos * GRAMOS_POR_KILO);
}

// Convierte el stock (SIEMPRE en gramos, o unidades) a la unidad en la que se
// expresa el precio: si "Por-Kilo" se divide por 1000 (kg), si "Por-100-Gramos"
// por 100, y sin conversión cuando no aplica ("Unidad" → precio por unidad).
export function stockEnUnidadDePrecio(stock, unidadPrecio) {
  switch (unidadPrecio) {
    case 'Por-Kilo':
      return stock / GRAMOS_POR_KILO;
    case 'Por-100-Gramos':
      return stock / 100;
    default:
      return stock;
  }
}

// Convierte en tiempo real el string del input de stock/stock mínimo:
// si `desdeKilos` es true, el valor está en kilos y se pasa a gramos;
// si es false, el valor está en gramos y se pasa a kilos.
export function convertirEntreKilosYGramos(valor, desdeKilos) {
  const numero = Number(valor);
  if (!valor || !Number.isFinite(numero) || numero === 0) return valor;
  return desdeKilos ? String(aGramos(numero)) : String(aKilos(numero));
}
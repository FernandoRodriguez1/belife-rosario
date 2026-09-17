// ============================================================================
// unidadPrecio.js — conversión gramos ↔ kilos ↔ 100g (modo de presentación)
// ============================================================================
// El stock y el stock mínimo se almacenan SIEMPRE en gramos (o en unidades,
// cuando la unidad de medida es "Unidad").
//
// Modos de presentación para Gramos:
// - "Por-Kilo":        stock en kg (ej: 2.5 = 2500g), step=0.01
// - "Por-100-Gramos":  stock en g  (ej: 200 = 200g),  step=50 (incremento)
// - (sin precio esp.): stock en g  (ej: 500 = 500g),  step=1
// ============================================================================

export const GRAMOS_POR_KILO = 1000;

// Paso del selector de cantidad en modo kilos (0.1 kg).
export const PASO_KILOGRAMOS = 0.1;

// Paso del selector de cantidad en modo Por-100-Gramos (50 g).
export const PASO_CIEN_GRAMOS = 50;

// Redondea kg a precisión de gramos (3 decimales) para no arrastrar errores de
// coma flotante al sumar/restar el paso de 0.1 kg.
export function redondearKilos(kilos) {
  return Math.round(kilos * GRAMOS_POR_KILO) / GRAMOS_POR_KILO;
}

// Redondea a múltiplos de 50g para modo Por-100-Gramos
export function redondearCienGrados(gramos) {
  return Math.round(gramos / PASO_CIEN_GRAMOS) * PASO_CIEN_GRAMOS;
}

// Modo "kilos": Gramos + precio Por-Kilo → se muestra en kg
export function esModoKilos(unidadMedida, unidadPrecio) {
  return unidadMedida === 'Gramos' && unidadPrecio === 'Por-Kilo';
}

// Modo "100 gramos": Gramos + precio Por-100-Gramos → se muestra en g (pero precio por 100g)
export function esModoCienGrados(unidadMedida, unidadPrecio) {
  return unidadMedida === 'Gramos' && unidadPrecio === 'Por-100-Gramos';
}

// Detecta el modo de presentación del stock para un producto
// Retorna: 'kilos' | 'cienGrados' | 'gramos' | 'unidades'
export function getStockDisplayMode(unidadMedida, unidadPrecio) {
  if (unidadMedida === 'Unidad') return 'unidades';
  if (esModoKilos(unidadMedida, unidadPrecio)) return 'kilos';
  if (esModoCienGrados(unidadMedida, unidadPrecio)) return 'cienGrados';
  return 'gramos';
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

// Convierte valor del input entre modos de presentación
// modoOrigen, modoDestino: 'gramos' | 'kilos' | 'cienGrados' | 'unidades'
export function convertirStockEntreModos(valor, modoOrigen, modoDestino) {
  const numero = Number(valor);
  if (!valor || !Number.isFinite(numero) || numero === 0) return valor;

  // Primero convertimos a gramos (unidad base)
  let gramos;
  switch (modoOrigen) {
    case 'kilos':
      gramos = aGramos(numero);
      break;
    case 'cienGrados':
    case 'gramos':
      gramos = numero;
      break;
    case 'unidades':
      // Unidades no se convierten a gramos (son cosas distintas)
      // Si venimos de unidades, no hacemos conversión automática
      return valor;
    default:
      gramos = numero;
  }

  // Luego de gramos al modo destino
  switch (modoDestino) {
    case 'kilos':
      return String(aKilos(gramos));
    case 'cienGrados':
    case 'gramos':
      return String(gramos);
    case 'unidades':
      return valor; // no convertible
    default:
      return String(gramos);
  }
}

// Devuelve el stock formateado para mostrar en el input del formulario.
export function getDisplayStock(product) {
  const { stock, unidad_medida, unidad_precio } = product;
  const mode = getStockDisplayMode(unidad_medida, unidad_precio);
  switch (mode) {
    case 'kilos':
      return String(aKilos(stock));
    case 'cienGrados':
    case 'gramos':
      return String(stock);
    case 'unidades':
    default:
      return String(stock);
  }
}

// Devuelve el stock mínimo formateado para mostrar en el input del formulario.
export function getDisplayStockMinimo(product) {
  const { stock_minimo, unidad_medida, unidad_precio } = product;
  const mode = getStockDisplayMode(unidad_medida, unidad_precio);
  const defaultMinimo = getDefaultStockMinimo(unidad_medida, unidad_precio);
  const valor = stock_minimo ?? defaultMinimo;
  switch (mode) {
    case 'kilos':
      return String(aKilos(valor));
    case 'cienGrados':
    case 'gramos':
      return String(valor);
    case 'unidades':
    default:
      return String(valor);
  }
}

// Default de stock mínimo según modo (en gramos o unidades)
export function getDefaultStockMinimo(unidadMedida, unidadPrecio) {
  if (unidadMedida === 'Unidad') return 5;
  if (esModoKilos(unidadMedida, unidadPrecio)) return GRAMOS_POR_KILO; // 1000g = 1kg
  return 500; // Gramos (Por-100-Gramos o sin precio especial)
}

// Parsea el input de stock del formulario a gramos (para enviar a la API).
export function parseStockInput(value, product) {
  const { unidad_medida, unidad_precio } = product;
  const numero = Number(value);
  if (!Number.isFinite(numero)) return 0;
  const mode = getStockDisplayMode(unidad_medida, unidad_precio);
  switch (mode) {
    case 'kilos':
      return aGramos(numero);
    case 'cienGrados':
    case 'gramos':
      return numero;
    case 'unidades':
    default:
      return numero;
  }
}

// Parsea el input de stock mínimo del formulario a gramos (para enviar a la API).
export function parseStockMinimoInput(value, product) {
  return parseStockInput(value, product); // misma lógica
}

// Formato legible de stock para tablas/lista
// >= 1000g -> "9 kg 250 g", < 1000g -> "425 g", Unidades -> "50 u."
export function formatStockDisplay(stock, unidadMedida) {
  if (unidadMedida === 'Unidad') return `${stock} u.`;
  if (stock >= 1000) {
    const kg = Math.floor(stock / 1000);
    const resto = stock % 1000;
    return resto > 0 ? `${kg} kg ${resto} g` : `${kg} kg`;
  }
  return `${stock} g`;
}

// Formato de precio con sufijo de unidad
// Por-Kilo -> "$ 8.000,00 / kg"
// Por-100-Gramos -> "$ 2.000,00 / 100 g"
// Unidad -> "$ 2.500,00 / u."
// Gramos sin precio especial -> "$ 2.000,00 / g"
export function formatPriceWithUnit(precio, unidadMedida, _unidadPrecio) {
  const formatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(precio);
  
  if (unidadMedida === 'Unidad') return `${formatted} / u.`;
  if (_unidadPrecio === 'Por-Kilo') return `${formatted} / kg`;
  if (_unidadPrecio === 'Por-100-Gramos') return `${formatted} / 100 g`;
  return `${formatted} / g`;
}
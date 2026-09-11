const STOCK_MINIMO_DEFAULT = 5;

export function esStockBajo(producto) {
  const minimo = producto.stock_minimo ?? STOCK_MINIMO_DEFAULT;
  return producto.stock <= minimo;
}

export function contarProductosStockBajo(productos) {
  return filtrarStockBajo(productos).length;
}

export function filtrarStockBajo(productos) {
  return productos.filter(esStockBajo);
}
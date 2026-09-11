export function calcularSubtotal(precioUnitario, cantidad) {
  return precioUnitario * cantidad;
}

export function calcularTotalCarrito(items) {
  return items.reduce(
    (total, item) => total + calcularSubtotal(item.precio_actual, item.cantidad),
    0
  );
}

export function calcularCantidadItems(items) {
  return items.reduce((total, item) => total + item.cantidad, 0);
}

export function hayStockDisponible(stock, cantidad) {
  return cantidad >= 1 && cantidad <= stock;
}
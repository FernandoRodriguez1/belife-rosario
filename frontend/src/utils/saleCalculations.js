export function calcularSubtotal(precioUnitario, cantidad, unidadPrecio = null) {
  // unidadPrecio: 'Por-Kilo' | 'Por-100-Gramos' | null
  // cantidad: en la unidad de presentación (kg para Por-Kilo, gramos para Por-100-Gramos)
  switch (unidadPrecio) {
    case 'Por-100-Gramos':
      // precioUnitario = precio por 100g, cantidad = gramos
      // subtotal = (precio/100) * gramos
      return (precioUnitario / 100) * cantidad;
    case 'Por-Kilo':
      // precioUnitario = precio por kg, cantidad = kg
      return precioUnitario * cantidad;
    default:
      // unidades o gramos sin precio especial
      return precioUnitario * cantidad;
  }
}

export function calcularTotalCarrito(items) {
  return items.reduce(
    (total, item) => total + calcularSubtotal(item.precio_actual, item.cantidad, item.unidad_precio),
    0
  );
}

export function calcularCantidadItems(items) {
  return items.reduce((total, item) => total + item.cantidad, 0);
}

export function hayStockDisponible(stock, cantidad) {
  // stock y cantidad siempre en gramos (unidad del backend)
  return cantidad >= 1 && cantidad <= stock;
}
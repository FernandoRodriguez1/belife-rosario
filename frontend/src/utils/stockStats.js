// Cálculo de stock separado por escala: sumar "Unidad" y "Gramos" en un mismo
// número no representa nada (30 unidades + 500 g ≠ "530"). Cada total se suma
// solo sobre los productos de su propia unidad de medida.

export function calcularStockPorUnidad(productos) {
  const unidades = productos.reduce(
    (sum, p) =>
      p.unidad_medida === 'Gramos' ? sum : sum + (Number(p.stock) || 0),
    0
  );
  const gramos = productos.reduce(
    (sum, p) =>
      p.unidad_medida === 'Gramos' ? sum + (Number(p.stock) || 0) : sum,
    0
  );

  return {
    unidades,
    gramos,
    hayUnidades: productos.some((p) => p.unidad_medida !== 'Gramos'),
    hayGramos: productos.some((p) => p.unidad_medida === 'Gramos'),
  };
}
import apiClient from './apiClient';

const BASE = '/api/ventas';

function normalizarDetalle(d) {
  return {
    producto_id: d.productoId,
    nombre: d.productoNombre,
    unidad_medida: d.unidadMedida ?? null,
    unidad_precio: d.unidadPrecio ?? null,
    cantidad: d.cantidad,
    precio_unitario: Number(d.precioUnitario),
    subtotal: Number(d.subtotal),
  };
}

function normalizarVentaPorProducto(v) {
  const detalles = v.detalles ?? [];
  return {
    id: v.id,
    total: Number(v.monto),
    forma_pago: v.formaPago ?? null,
    fecha: v.fechaHora,
    cantidad_items:
      v.cantidadDetalles ??
      detalles.reduce((sum, d) => sum + (d.cantidad ?? 0), 0),
    items: detalles.map(normalizarDetalle),
    administrador_nombre: v.administrador_nombre ?? 'Administrador',
  };
}

export const ventasService = {
  getAll: () => apiClient.get(BASE),
  getById: (id) => apiClient.get(`${BASE}/${id}`),
  getByProducto: (productoId) =>
    apiClient.get(`${BASE}/producto/${productoId}`).then((data) => data.map(normalizarVentaPorProducto)),
  // Body esperado por el backend: { formaPago, detalles: [{ productoId,
  // cantidad, precioUnitario }] }. El stock se descuenta del lado del servidor.
  create: (data) => apiClient.post(BASE, data),
  update: (id, data) => apiClient.put(`${BASE}/${id}`, { ...data, id }),
  remove: (id) => apiClient.delete(`${BASE}/${id}`),
};

export default ventasService;
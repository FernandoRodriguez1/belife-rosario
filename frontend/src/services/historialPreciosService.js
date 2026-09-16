import apiClient from './apiClient';

const BASE = '/api/historial-precios';

export const historialPreciosService = {
  getAll: () => apiClient.get(BASE),
  getByProductoId: (productoId) => apiClient.get(`${BASE}/producto/${productoId}`),
  // El backend toma PrecioAnterior del precio actual del producto y actualiza
  // PrecioActual con precioNuevo; solo hay que enviar productoId, precioNuevo,
  // administradorId.
  create: (data) => apiClient.post(BASE, data),
  remove: (id) => apiClient.delete(`${BASE}/${id}`),
};

export default historialPreciosService;
import apiClient from './apiClient';

const BASE = '/api/ventas';

export const ventasService = {
  getAll: () => apiClient.get(BASE),
  getById: (id) => apiClient.get(`${BASE}/${id}`),
  getByProducto: (productoId) => apiClient.get(`${BASE}/producto/${productoId}`),
  // Body esperado por el backend: { formaPago, detalles: [{ productoId,
  // cantidad, precioUnitario }] }. El stock se descuenta del lado del servidor.
  create: (data) => apiClient.post(BASE, data),
  update: (id, data) => apiClient.put(`${BASE}/${id}`, { ...data, id }),
  remove: (id) => apiClient.delete(`${BASE}/${id}`),
};

export default ventasService;
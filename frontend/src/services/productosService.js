import apiClient from './apiClient';

const BASE = '/api/productos';

// Los campos del backend vienen en camelCase (precioActual, categoriaId...). La
// normalización a snake_case se hace en los hooks, que son los que alimentan la UI.
export const productosService = {
  getAll: () => apiClient.get(BASE),
  getById: (id) => apiClient.get(`${BASE}/${id}`),
  create: (data) => apiClient.post(BASE, data),
  update: (id, data) => apiClient.put(`${BASE}/${id}`, { ...data, id }),
  remove: (id) => apiClient.delete(`${BASE}/${id}`),
};

export default productosService;
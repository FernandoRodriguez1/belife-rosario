import apiClient from './apiClient';

const BASE = '/api/categorias';

export const categoriasService = {
  getAll: () => apiClient.get(BASE),
  getById: (id) => apiClient.get(`${BASE}/${id}`),
  create: (data) => apiClient.post(BASE, data),
  update: (id, data) => apiClient.put(`${BASE}/${id}`, { ...data, id }),
  remove: (id) => apiClient.delete(`${BASE}/${id}`),
};

export default categoriasService;
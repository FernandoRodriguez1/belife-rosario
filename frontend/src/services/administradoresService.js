import apiClient from './apiClient';

const BASE = '/api/administradores';

export const administradoresService = {
  getAll: () => apiClient.get(BASE),
  getById: (id) => apiClient.get(`${BASE}/${id}`),
};

export default administradoresService;
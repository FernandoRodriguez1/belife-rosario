import apiClient from './apiClient';

export function createCatalogService(basePath) {
  return {
    getAll: () => apiClient.get(basePath),
    getById: (id) => apiClient.get(`${basePath}/${id}`),
    create: (data) => apiClient.post(basePath, data),
    update: (id, data) => apiClient.put(`${basePath}/${id}`, { ...data, id }),
    remove: (id) => apiClient.delete(`${basePath}/${id}`),
  };
}

export const categoriasService = createCatalogService('/api/categorias');
export const marcasService = createCatalogService('/api/marcas');

export default createCatalogService;
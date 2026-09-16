import apiClient from './apiClient';

export const authService = {
  // Supuesto de contrato: la API documentada espera { usuario, password }, pero
  // el backend (belife-rosario.API) espera { nombre, password }. Para cubrir
  // ambas variantes enviamos los dos campos (los no reconocidos se ignoran).
  async login(usuario, password) {
    const data = await apiClient.post('/api/auth/login', {
      usuario,
      password,
      nombre: usuario,
    });
    return {
      token: data.token ?? null,
      // El backend real responde "tokenExpiracion"; la documentación decía
      // "expiration". Aceptamos ambos.
      expiration: data.tokenExpiracion ?? data.expiration ?? null,
      administrador: data.administrador ?? null,
    };
  },
};

export default authService;
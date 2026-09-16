import { DEFAULT_API_BASE_URL, TOKEN_KEY } from './config';

const REQUEST_TIMEOUT_MS = 120000;

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(
    /\/+$/,
    ''
  ) || DEFAULT_API_BASE_URL;

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

async function parseJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

const FALLBACK_MESSAGES = {
  400: 'Solicitud inválida. Revisá los datos enviados.',
  401: 'No autorizado.',
  403: 'No tenés permisos para realizar esta acción.',
  404: 'No se encontró el recurso solicitado.',
  409: 'No se puede completar la operación porque hay datos relacionados.',
  500: 'Ocurrió un error en el servidor. Si estás duplicando un código o nombre que ya existe, cambiá el valor e intentá de nuevo.',
};

function extractErrorMessage(payload, status) {
  if (typeof payload === 'string' && payload.trim()) return payload.trim();
  if (payload && typeof payload === 'object') {
    if (payload.message) return payload.message;
    if (payload.error) return payload.error;
    if (payload.detail) return payload.detail;
    if (payload.title) return payload.title;
  }
  return FALLBACK_MESSAGES[status] ?? `Error ${status}`;
}

function buildError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function request(method, path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(buildUrl(path), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw buildError(
        'El servidor tardó demasiado en responder. Puede que la API esté arrancando (Render "duerme" el servicio); intentá de nuevo en unos segundos.',
        504
      );
    }
    throw buildError(
      'No se pudo conectar con el servidor. Revisá tu conexión a internet e intentá de nuevo.',
      0
    );
  }
  clearTimeout(timer);

  const payload = await parseJson(response);

  if (!response.ok) {
    if (response.status === 401 && !path.includes('/auth/login')) {
      throw buildError(
        'Tu sesión expiró o no tenés permisos. Volvé a iniciar sesión.',
        401
      );
    }
    throw buildError(
      `${extractErrorMessage(payload, response.status)} (HTTP ${response.status})`,
      response.status
    );
  }

  return payload;
}

export const apiClient = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
};

export default apiClient;
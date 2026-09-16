import { useCallback, useMemo, useState } from 'react';
import { AuthContext } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { administradoresService } from '../services/administradoresService';
import {
  CURRENT_ADMIN_KEY,
  TOKEN_EXPIRATION_KEY,
  TOKEN_KEY,
} from '../services/config';

/**
 * SUPUESTOS sobre el payload del JWT (para verificar juntos después):
 * El backend (Services/TokenService.cs) genera claims con los tipos .NET
 * ClaimTypes.NameIdentifier => corto "nameid" (id del admin) y ClaimTypes.Name
 * => corto "unique_name" (nombre del admin). Por eso acá se intenta leer
 * "nameid"/"unique_name" además de "sub"/"nombre"/"usuario"/"id". El claim
 * "exp" (expiracion) viene en formato unix timestamp.
 */

function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '='
    );
    return JSON.parse(atob(padded));
  } catch (err) {
    console.warn('[AUTH] No se pudo decodificar el payload del JWT:', err);
    return null;
  }
}

function extractAdminFromPayload(payload) {
  if (!payload) return null;
  const rawId = payload.id ?? payload.sub ?? payload.nameid;
  const nombre = payload.nombre ?? payload.name ?? payload.unique_name;
  if (rawId == null && !nombre) return null;
  return {
    id: rawId != null ? Number(rawId) : null,
    nombre: nombre ?? null,
    usuario: payload.usuario ?? null,
  };
}

function leerSesionGuardada() {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiration = localStorage.getItem(TOKEN_EXPIRATION_KEY);

  if (!token || !expiration) return null;

  const expDate = new Date(expiration);
  if (isNaN(expDate.getTime()) || Date.now() > expDate.getTime()) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRATION_KEY);
    localStorage.removeItem(CURRENT_ADMIN_KEY);
    return null;
  }

  const storedAdmin = localStorage.getItem(CURRENT_ADMIN_KEY);
  if (storedAdmin) {
    try {
      return JSON.parse(storedAdmin);
    } catch {
      /* si está corrupto, seguimos con el plan de abajo */
    }
  }

  return extractAdminFromPayload(decodeJwtPayload(token));
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => leerSesionGuardada());

  const login = useCallback(async (usuario, contraseña) => {
    const session = await authService.login(usuario, contraseña);

    localStorage.setItem(TOKEN_KEY, session.token);
    if (session.expiration) {
      localStorage.setItem(TOKEN_EXPIRATION_KEY, session.expiration);
    }

    let admin = session.administrador;

    if (!admin) {
      const decoded = decodeJwtPayload(session.token);
      console.warn(
        '[AUTH] El login no devolvió el objeto administrador; usando el payload del JWT:',
        decoded
      );
      admin = extractAdminFromPayload(decoded);
    }

    if (!admin || !admin.nombre) {
      console.warn(
        '[AUTH] El JWT no traía info del admin; plan B: buscar el admin en GET /api/administradores.'
      );
      const administradores = await administradoresService.getAll();
      const match = administradores.find(
        (a) => String(a.nombre).toLowerCase() === String(usuario).trim().toLowerCase()
      );
      if (match) {
        admin = { id: match.id, nombre: match.nombre, activo: match.activo };
      }
    }

    if (!admin || !admin.nombre) {
      console.warn(
        '[AUTH] No se pudo resolver el administrador (payload JWT + GET /api/administradores). Se descarta la sesión.'
      );
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRATION_KEY);
      localStorage.removeItem(CURRENT_ADMIN_KEY);
      return false;
    }

    setCurrentUser(admin);
    localStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify(admin));
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRATION_KEY);
    localStorage.removeItem(CURRENT_ADMIN_KEY);
    setCurrentUser(null);
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      logout,
    }),
    [currentUser, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
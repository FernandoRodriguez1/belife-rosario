import { useCallback, useMemo, useState } from 'react';
import { AuthContext } from '../hooks/useAuth';
import { administradores } from '../data/administradores';

// TODO: cuando se conecte el login real, reemplazar esta validación mock por un
// fetch a la API que devuelva el token JWT. La sesión se puede persistir en
// localStorage y restaurarla al montar la app validando el token.
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  const login = useCallback((usuario, contraseña) => {
    const admin = administradores.find(
      (a) =>
        a.activo &&
        a.usuario.toLowerCase() === usuario.trim().toLowerCase() &&
        a.contraseña === contraseña
    );
    if (!admin) return false;

    setCurrentUser(admin);
    return true;
  }, []);

  const logout = useCallback(() => {
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
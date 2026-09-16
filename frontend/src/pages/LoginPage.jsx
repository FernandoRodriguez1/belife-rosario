import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import logo from '../assets/logo.png';
import fondoNormal from '../assets/fondoNormal.png';

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usuario.trim() || !contraseña) {
      setError('Ingresá tu usuario y contraseña.');
      return;
    }

    try {
      const ok = await login(usuario, contraseña);
      if (ok) {
        navigate('/dashboard', { replace: true });
      } else {
        setError('Usuario o contraseña incorrectos.');
      }
    } catch (err) {
      setError(
        err.status === 401
          ? 'Usuario o contraseña incorrectos.'
          : err.message
      );
    }
  };

  const fieldClass = (hasError) =>
    `w-full rounded-full border bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
      hasError
        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
        : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500/20'
    }`;

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="fixed inset-0 z-0 bg-brand-500">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-85"
          style={{ backgroundImage: `url(${fondoNormal})` }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-8 shadow-xl sm:p-10">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <img
            src={logo}
            alt="Logo Belife Rosario"
            className="h-20 w-auto object-contain"
          />
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">
              Belife Rosario
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Iniciá sesión en el panel de administración.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="usuario"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Usuario
            </label>
            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Tu nombre de usuario"
              autoComplete="username"
              className={fieldClass(Boolean(error))}
            />
          </div>

          <div>
            <label
              htmlFor="contraseña"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <input
              id="contraseña"
              type="password"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              placeholder="••••••"
              autoComplete="current-password"
              className={fieldClass(Boolean(error))}
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 ring-1 ring-inset ring-red-600/10">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full">
            <LogIn className="size-4" />
            Ingresar
          </Button>

          <p className="text-center text-xs text-gray-400">
            Usá tus credenciales del sistema.
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
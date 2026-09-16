import { LayoutGrid, LogOut, Tag, Tags } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.png';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Productos', icon: LayoutGrid },
  { to: '/categorias', label: 'Categorías', icon: Tags },
  { to: '/marcas', label: 'Marcas', icon: Tag },
];

// Pill nav sobria: píldoras rounded-full dentro de un contenedor gris claro
// también redondeado con padding alrededor del grupo. Ítem activo con fondo de
// marca y texto blanco; inactivos en gris oscuro con hover gris muy claro.
// Solo transición de color (transition-colors), sin animaciones.
function renderNavLinks(className) {
  return (
    <nav
      className={`flex items-center gap-1 rounded-full bg-gray-100 p-1 ${className}`}
    >
      {NAV_LINKS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            `inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
              isActive
                ? 'bg-gray-800 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-200'
            }`
          }
        >
          <Icon className="size-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:gap-8 lg:px-8">
        {/* Grupo izquierdo: logo + pestañas juntos (desktop) */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-4 lg:gap-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <img
              src={logo}
              alt="Logo Belife Rosario"
              className="h-9 w-auto shrink-0 object-contain sm:h-10"
            />
            <div className="min-w-0">
              <p className="truncate font-display text-base font-bold leading-tight text-gray-900 sm:text-lg">
                Belife Rosario
              </p>
              <p className="hidden text-xs font-medium text-gray-500 sm:block">
                Panel Admin · Gestión
              </p>
            </div>
          </div>
          {renderNavLinks('hidden shrink-0 lg:flex')}
        </div>

        {/* Grupo derecho: usuario + cerrar sesión */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden text-sm font-medium text-gray-700 lg:block">
            {currentUser?.nombre}
          </span>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Pestañas en fila propia solo en mobile/tablet */}
      <div className="px-4 pb-4 sm:px-6 lg:hidden">
        {renderNavLinks(
          'overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:overflow-visible'
        )}
      </div>
    </header>
  );
}

export default Header;
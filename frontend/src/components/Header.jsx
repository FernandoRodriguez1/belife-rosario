import { LayoutGrid, LogOut, Tag, Tags } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.png';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Productos', icon: LayoutGrid },
  { to: '/categorias', label: 'Categorías', icon: Tags },
  { to: '/marcas', label: 'Marcas', icon: Tag },
];

function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Logo Belife Rosario"
            className="h-10 w-auto object-contain"
          />
          <div>
            <p className="font-display text-lg font-bold leading-tight text-gray-900">
              Belife Rosario
            </p>
            <p className="text-xs font-medium text-brand-600">
              Panel Admin · Gestión
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-medium text-gray-700 sm:block">
            {currentUser?.nombre}
          </span>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 pb-4 sm:px-6 lg:px-8">
        {NAV_LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-brand-700 hover:bg-brand-50'
              }`
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </div>
    </header>
  );
}

export default Header;
import { X } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { administradores } from '../data/administradores';

const adminLookup = new Map(
  administradores.map((admin) => [admin.id, admin.nombre])
);

const formatFecha = (iso) => {
  const date = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

function PriceHistoryModal({ product, history, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-lg rounded-3xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="min-w-0">
            <h2 className="truncate font-display text-xl font-bold text-gray-900">
              Historial de precios
            </h2>
            <p className="mt-0.5 truncate text-sm text-gray-500">
              {product.nombre}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 rounded-lg p-2 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600"
            title="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          {history.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Este producto no tiene cambios de precio registrados.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {history.map((entry) => {
                const admin =
                  adminLookup.get(entry.administrador_id) ?? 'Administrador';
                const isIncrease = entry.precio_nuevo > entry.precio_anterior;
                return (
                  <li key={entry.id} className="py-3">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm text-gray-500 line-through">
                        {formatCurrency(entry.precio_anterior)}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(entry.precio_nuevo)}
                      </span>
                      <span
                        className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          isIncrease
                            ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
                            : 'bg-green-50 text-green-700 ring-green-600/20'
                        }`}
                      >
                        {isIncrease ? 'Aumento' : 'Baja'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {admin} · {formatFecha(entry.fecha)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default PriceHistoryModal;
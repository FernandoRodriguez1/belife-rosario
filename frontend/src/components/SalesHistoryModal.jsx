import { useState } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { formatFecha } from '../utils/formatFecha';
import { labelFormaPago } from '../utils/formaPago';

function SalesHistoryModal({ ventas, isLoading = false, error = '', onClose }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/40 p-4 sm:items-center"
    >
      <div
        className="my-8 w-full max-w-2xl rounded-3xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900">
              Historial de Ventas
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Ventas registradas en el punto de venta.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600"
            title="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-5 py-6 sm:px-6">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Cargando ventas...
            </p>
          ) : error ? (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 ring-1 ring-inset ring-red-600/10">
              {error}
            </p>
          ) : ventas.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Todavía no hay ventas registradas.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {ventas.map((venta) => {
                // El backend de ventas no expone el administrador; el nombre
                // llega en venta.administrador_nombre solo si se agrega luego.
                const admin = venta.administrador_nombre ?? 'Administrador';
                const isExpanded = expandedId === venta.id;
                return (
                  <li key={venta.id} className="py-2">
                    <button
                      onClick={() => toggleExpand(venta.id)}
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors duration-150 hover:bg-gray-50"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {formatFecha(venta.fecha)}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {admin} · {venta.cantidad_items} productos ·{' '}
                          {labelFormaPago(venta.forma_pago)}
                        </p>
                      </div>
                      <span className="ml-auto font-display text-sm font-semibold text-gray-900">
                        {formatCurrency(venta.total)}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="size-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="size-4 text-gray-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-2 pb-3 pt-1">
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-4">
                                  Producto
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-4">
                                  Cant.
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-4">
                                  Precio
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-4">
                                  Subtotal
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {venta.items.map((item) => (
                                <tr key={item.producto_id}>
                                  <td className="px-3 py-2.5 text-sm text-gray-900 sm:px-4">
                                    {item.nombre}
                                  </td>
                                  <td className="px-3 py-2.5 text-right text-sm text-gray-500 sm:px-4">
                                    {item.cantidad}
                                  </td>
                                  <td className="px-3 py-2.5 text-right whitespace-nowrap text-sm text-gray-500 sm:px-4">
                                    {formatCurrency(item.precio_unitario)}
                                  </td>
                                  <td className="px-3 py-2.5 text-right whitespace-nowrap font-display text-sm font-semibold text-gray-900 sm:px-4">
                                    {formatCurrency(item.subtotal)}
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-gray-50">
                                <td
                                  colSpan="3"
                                  className="px-3 py-2.5 text-right text-sm font-medium text-gray-500 sm:px-4"
                                >
                                  Total
                                </td>
                                <td className="px-3 py-2.5 text-right whitespace-nowrap font-display text-sm font-bold text-gray-900 sm:px-4">
                                  {formatCurrency(venta.total)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
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

export default SalesHistoryModal;
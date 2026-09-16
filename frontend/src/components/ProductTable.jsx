import { AlertTriangle, History, Package, Pencil, Trash2 } from 'lucide-react';
import Badge from './Badge';
import { formatCurrency } from '../utils/formatCurrency';
import { esStockBajo } from '../utils/stockAlerts';

const estadoIndicator = (estado) =>
  estado === 'activo'
    ? { dot: 'bg-green-500', label: 'Activo', text: 'text-gray-700' }
    : { dot: 'bg-gray-300', label: 'Inactivo', text: 'text-gray-400' };

function ProductTable({ products, onEdit, onDelete, onHistory }) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 border-t-2 border-t-brand-500 bg-white p-12 text-center shadow-sm">
        <p className="text-sm font-medium text-gray-900">No hay productos</p>
        <p className="mt-1 text-sm text-gray-500">
          Intentá con otra búsqueda o cargá un producto nuevo.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 border-t-2 border-t-brand-500 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Stock
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => {
              const categoria =
                product.categoria_nombre ?? 'Sin categoría';
              const estado = estadoIndicator(product.estado);
              const lowStock = esStockBajo(product);
              return (
                <tr
                  key={product.id}
                  className="transition-colors duration-150 hover:bg-gray-50"
                >
                  <td
                    className={`px-6 py-4 ${
                      lowStock ? 'border-l-4 border-l-red-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-50">
                        <Package className="size-5 text-brand-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {product.nombre}
                        </p>
                        <p className="mt-0.5 truncate text-sm text-gray-500">
                          {product.codigo}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge category={categoria}>{categoria}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`size-2 rounded-full ${estado.dot}`} />
                      <span className={`text-sm font-medium ${estado.text}`}>
                        {estado.label}
                      </span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-display text-sm font-semibold text-gray-900">
                    {formatCurrency(product.precio_actual)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {lowStock ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-sm font-semibold text-red-700">
                        <AlertTriangle className="size-4" />
                        {product.stock} u.
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
                        {product.stock} u.
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onHistory(product)}
                        title="Ver historial"
                        className="rounded-lg p-2 text-gray-400 transition-colors duration-150 hover:bg-amber-50 hover:text-amber-600"
                      >
                        <History className="size-4" />
                      </button>
                      <button
                        onClick={() => onEdit(product)}
                        title="Editar"
                        className="rounded-lg p-2 text-gray-400 transition-colors duration-150 hover:bg-brand-50 hover:text-brand-600"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => onDelete(product)}
                        title="Eliminar"
                        className="rounded-lg p-2 text-gray-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductTable;
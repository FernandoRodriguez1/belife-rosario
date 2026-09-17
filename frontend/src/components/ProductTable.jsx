import { AlertTriangle, History, Package, Pencil, Trash2 } from 'lucide-react';
import Badge from './Badge';
import { formatCurrency } from '../utils/formatCurrency';
import { esStockBajo } from '../utils/stockAlerts';

const estadoIndicator = (estado) =>
  estado === 'activo'
    ? { dot: 'bg-green-500', label: 'Activo', text: 'text-gray-700' }
    : { dot: 'bg-gray-300', label: 'Inactivo', text: 'text-gray-400' };

const STOCK_SUFFIX = { Gramos: 'g', Unidad: 'u.' };

const marcaBadgeClass =
  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset bg-gray-100 text-gray-600 ring-gray-500/20';

function ProductTable({ products, onEdit, onDelete, onHistory }) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 border-t-2 border-t-gray-300 bg-white p-12 text-center shadow-sm">
        <p className="text-sm font-medium text-gray-900">No hay productos</p>
        <p className="mt-1 text-sm text-gray-500">
          Intentá con otra búsqueda o cargá un producto nuevo.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 border-t-2 border-t-gray-300 bg-white shadow-sm">
      <div className="overflow-x-auto">
        {/* table-fixed reparte el ancho con porcentajes fijos por columna (los
            anchos de cada breakpoint suman 100%): en desktop todas las columnas
            entran sin scroll horizontal y las celdas "elásticas" truncan con
            ellipsis. En pantallas chicas se fuerza un min-width para que el
            scroll solo aparezca ahí y las acciones nunca queden cortadas. */}
        <table className="w-full min-w-[560px] table-fixed divide-y divide-gray-200 lg:min-w-0">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-[40%] px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-4 lg:w-[26%]">
                Producto
              </th>
              <th className="hidden px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-4 lg:table-cell lg:w-[14%]">
                Categoría
              </th>
              <th className="hidden px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-4 lg:table-cell lg:w-[13%]">
                Marca
              </th>
              <th className="hidden px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-4 lg:table-cell lg:w-[9%]">
                Estado
              </th>
              <th className="w-[20%] px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-4 lg:w-[11%]">
                Precio
              </th>
              <th className="w-[15%] px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-4 lg:w-[9%]">
                Stock
              </th>
              <th className="w-[25%] px-2 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-4 lg:w-[18%]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => {
              const categoria =
                product.categoria_nombre ?? 'Sin categoría';
              const marca = product.marca_nombre ?? 'Sin marca';
              const estado = estadoIndicator(product.estado);
              const lowStock = esStockBajo(product);
              const stockSuffix = STOCK_SUFFIX[product.unidad_medida] ?? 'u.';
              return (
                <tr
                  key={product.id}
                  className="transition-colors duration-150 hover:bg-gray-50"
                >
                  <td
                    className={`px-2 py-3 sm:px-4 sm:py-4 ${
                      lowStock ? 'border-l-4 border-l-red-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100 sm:size-10 sm:rounded-lg">
                        <Package className="size-4 text-gray-600 sm:size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {product.nombre}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-gray-500 sm:text-sm">
                          {product.codigo}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-2 py-3 sm:px-4 sm:py-4 lg:table-cell">
                    <div className="truncate">
                      <Badge category={categoria}>{categoria}</Badge>
                    </div>
                  </td>
                  <td className="hidden px-2 py-3 sm:px-4 sm:py-4 lg:table-cell">
                    <div className="truncate">
                      <span className={marcaBadgeClass}>{marca}</span>
                    </div>
                  </td>
                  <td className="hidden whitespace-nowrap px-2 py-3 sm:px-4 sm:py-4 lg:table-cell">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`size-2 rounded-full ${estado.dot}`} />
                      <span className={`text-sm font-medium ${estado.text}`}>
                        {estado.label}
                      </span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 font-display text-xs font-semibold text-gray-900 sm:px-4 sm:py-4 sm:text-sm">
                    {formatCurrency(product.precio_actual)}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 sm:px-4 sm:py-4">
                    {lowStock ? (
                      <span className="inline-flex items-center gap-1.5">
                        <AlertTriangle className="hidden size-3.5 text-red-600 sm:inline sm:size-4" />
                        <span className="rounded-full bg-red-100 px-1.5 text-xs font-semibold text-red-700 sm:px-2.5 sm:py-1 sm:text-sm">
                          {product.stock} {stockSuffix}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-gray-900 sm:text-sm">
                        {product.stock} {stockSuffix}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 sm:px-4 sm:py-4">
                    <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                      <button
                        onClick={() => onHistory(product)}
                        title="Ver historial"
                        className="rounded-lg p-1.5 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <History className="size-4" />
                      </button>
                      <button
                        onClick={() => onEdit(product)}
                        title="Editar"
                        className="rounded-lg p-1.5 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => onDelete(product)}
                        title="Eliminar"
                        className="rounded-lg p-1.5 text-gray-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
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
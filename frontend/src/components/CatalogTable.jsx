import { Pencil, Trash2 } from 'lucide-react';
import Badge from './Badge';

function CatalogTable({
  icon: Icon,
  items,
  emptyMessage,
  productLabel = 'Productos',
  onEdit,
  onDelete,
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 border-t-2 border-t-brand-500 bg-white p-12 text-center shadow-sm">
        <p className="text-sm font-medium text-gray-900">No hay elementos</p>
        <p className="mt-1 text-sm text-gray-500">{emptyMessage}</p>
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
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                {productLabel}
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr
                key={item.id}
                className="transition-colors duration-150 hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                      <Icon className="size-5 text-brand-600" />
                    </div>
                    <p className="truncate text-sm font-medium text-gray-900">
                      {item.nombre}
                    </p>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <Badge category={item.nombre}>
                    {item.cantidadProductos}{' '}
                    {item.cantidadProductos === 1 ? 'producto' : 'productos'}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(item)}
                      title="Editar"
                      className="rounded-lg p-2 text-gray-400 transition-colors duration-150 hover:bg-brand-50 hover:text-brand-600"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      title="Eliminar"
                      className="rounded-lg p-2 text-gray-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CatalogTable;
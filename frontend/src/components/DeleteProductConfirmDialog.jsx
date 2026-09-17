import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import Button from './Button';
import { formatCurrency } from '../utils/formatCurrency';
import { formatFecha } from '../utils/formatFecha';
import { labelFormaPago } from '../utils/formaPago';
import { ventasService } from '../services/ventasService';

function DeleteProductConfirmDialog({ product, onConfirm, onCancel }) {
  const [ventas, setVentas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    ventasService
      .getByProducto(product.id)
      .then((data) => {
        if (!active) return;
        setVentas(data ?? []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        setVentas([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [product.id]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/40 p-4 sm:items-center"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="size-5 text-red-600" />
            </div>
            <h2 className="font-display text-lg font-bold text-gray-900">
              Eliminar producto
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="rounded-lg p-2 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600"
            title="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 text-brand-600 animate-spin" />
              <span className="ml-3 text-sm text-gray-500">Cargando ventas...</span>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 ring-1 ring-inset ring-red-600/10">
                No se pudieron cargar las ventas asociadas.
              </p>
              <p className="text-sm text-gray-500">
                ¿Estás seguro de que querés eliminar "{product.nombre}"? Esta acción no se puede deshacer.
              </p>
            </div>
          ) : ventas.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-900">
                Este producto contiene {ventas.length} venta{ventas.length !== 1 ? 's' : ''} asociada{ventas.length !== 1 ? 's' : ''}
              </p>
              <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {ventas.map((venta) => {
                  const admin = venta.administrador_nombre ?? 'Administrador';
                  return (
                    <div
                      key={venta.id}
                      className="px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-gray-500 shrink-0">
                          {formatFecha(venta.fecha)}
                        </span>
                        <span className="flex-1 min-w-0 truncate text-sm text-gray-700">
                          {admin} · {labelFormaPago(venta.forma_pago)}
                        </span>
                        <span className="font-display text-sm font-semibold text-gray-900 shrink-0">
                          {formatCurrency(venta.total)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500">
                  ¿Estás seguro de que querés eliminar "{product.nombre}"? Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              ¿Estás seguro de que querés eliminar "{product.nombre}"? Esta acción no se puede deshacer.
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-gray-100 px-5 py-4 sm:px-6">
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Eliminar
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default DeleteProductConfirmDialog;
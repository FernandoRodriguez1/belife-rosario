import { AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';
import Button from './Button';

function ConfirmDialog({ title = 'Confirmar acción', message, warning, confirmLabel = 'Eliminar', onConfirm, onCancel, loading = false }) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/40 p-4 sm:items-center"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="size-5 text-red-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 break-words text-sm text-gray-500">{message}</p>
            {warning && (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/10">
                {warning}
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  </div>,
  document.body
  );
}

export default ConfirmDialog;
import { useState } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

function CatalogModal({
  item = null,
  labelSingular,
  existingNames = [],
  onClose,
  onSave,
  submitError = '',
}) {
  const isEditing = Boolean(item);
  const [nombre, setNombre] = useState(item?.nombre ?? '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmed = nombre.trim();
    if (!trimmed) {
      setError(`El nombre de la ${labelSingular} es obligatorio.`);
      return;
    }
    if (existingNames.includes(trimmed.toLowerCase())) {
      setError(`Ya existe una ${labelSingular} con ese nombre.`);
      return;
    }

    setError('');
    onSave(isEditing ? { ...item, nombre: trimmed } : { nombre: trimmed });
  };

  const fieldClass = (hasError) =>
    `w-full rounded-full border bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
      hasError
        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
        : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500/20'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/40 p-4 sm:items-center"
    >
      <div
        className="my-8 w-full max-w-md rounded-3xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900">
              {isEditing ? `Editar ${labelSingular}` : `Nueva ${labelSingular}`}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {isEditing
                ? 'Modificá el nombre y guardá los cambios.'
                : 'Ingresá el nombre de la nueva.'}
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

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-6 sm:px-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700" htmlFor="nombre">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (error) setError('');
              }}
              placeholder={`${labelSingular[0].toUpperCase()}${labelSingular.slice(1)}...`}
              className={fieldClass(Boolean(error))}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-5">
            {submitError && (
              <p className="w-full rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 ring-1 ring-inset ring-red-600/10 sm:mr-auto sm:w-auto">
                {submitError}
              </p>
            )}
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Guardar cambios' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CatalogModal;
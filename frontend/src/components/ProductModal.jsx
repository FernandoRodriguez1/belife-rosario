import { useState } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import { categorias } from '../data/categorias';
import { marcas } from '../data/marcas';

const ESTADOS = ['activo', 'inactivo'];

function ProductModal({ product = null, onClose, onSave }) {
  const isEditing = Boolean(product);
  const [form, setForm] = useState(() =>
    product
      ? {
          codigo: product.codigo ?? '',
          nombre: product.nombre,
          categoria_id: product.categoria_id ?? '',
          marca_id: product.marca_id ?? '',
          precio_actual: String(product.precio_actual),
          stock: String(product.stock),
          estado: product.estado ?? 'activo',
        }
      : {
          codigo: '',
          nombre: '',
          categoria_id: '',
          marca_id: '',
          precio_actual: '',
          stock: '',
          estado: 'activo',
        }
  );
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.codigo.trim()) nextErrors.codigo = 'El código es obligatorio.';
    if (!form.nombre.trim()) nextErrors.nombre = 'El nombre es obligatorio.';
    if (!form.categoria_id) {
      nextErrors.categoria_id = 'La categoría es obligatoria.';
    }
    if (!form.precio_actual) {
      nextErrors.precio_actual = 'El precio es obligatorio.';
    } else if (Number(form.precio_actual) <= 0) {
      nextErrors.precio_actual = 'El precio debe ser mayor a 0.';
    }
    if (!form.stock) {
      nextErrors.stock = 'El stock es obligatorio.';
    } else if (Number(form.stock) < 0) {
      nextErrors.stock = 'El stock no puede ser negativo.';
    }

    return nextErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
      marca_id: form.marca_id ? Number(form.marca_id) : null,
      precio_actual: Number(form.precio_actual),
      stock: Number(form.stock),
      estado: form.estado,
    };

    onSave(isEditing ? { ...payload, id: product.id } : payload);
  };

  const fieldClass = (hasError) =>
    `w-full rounded-full border bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
      hasError
        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
        : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500/20'
    }`;

  const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

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
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900">
              {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {isEditing
                ? 'Modificá los datos y guardá los cambios.'
                : 'Completá los datos del nuevo producto.'}
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

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div>
            <label className={labelClass} htmlFor="codigo">
              Código <span className="text-red-500">*</span>
            </label>
            <input
              id="codigo"
              name="codigo"
              type="text"
              value={form.codigo}
              onChange={handleChange}
              placeholder="Ej: BEL-0001"
              className={fieldClass(Boolean(errors.codigo))}
            />
            {errors.codigo && (
              <p className="mt-1 text-xs text-red-600">{errors.codigo}</p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="nombre">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej: Miel Orgánica de Campo"
              className={fieldClass(Boolean(errors.nombre))}
            />
            {errors.nombre && (
              <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="categoria_id">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              id="categoria_id"
              name="categoria_id"
              value={form.categoria_id}
              onChange={handleChange}
              className={`${fieldClass(Boolean(errors.categoria_id))} cursor-pointer`}
            >
              <option value="">Seleccioná una categoría...</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            {errors.categoria_id && (
              <p className="mt-1 text-xs text-red-600">
                {errors.categoria_id}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="marca_id">
                Marca
              </label>
              <select
                id="marca_id"
                name="marca_id"
                value={form.marca_id}
                onChange={handleChange}
                className={`${fieldClass(false)} cursor-pointer`}
              >
                <option value="">Seleccioná una marca...</option>
                {marcas.map((marca) => (
                  <option key={marca.id} value={marca.id}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="estado">
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className={`${fieldClass(false)} cursor-pointer`}
              >
                {ESTADOS.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="precio_actual">
                Precio (ARS) <span className="text-red-500">*</span>
              </label>
              <input
                id="precio_actual"
                name="precio_actual"
                type="number"
                min="0"
                step="0.01"
                value={form.precio_actual}
                onChange={handleChange}
                placeholder="0.00"
                className={fieldClass(Boolean(errors.precio_actual))}
              />
              {errors.precio_actual && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.precio_actual}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass} htmlFor="stock">
                Stock (unidades) <span className="text-red-500">*</span>
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleChange}
                placeholder="0"
                className={fieldClass(Boolean(errors.stock))}
              />
              {errors.stock && (
                <p className="mt-1 text-xs text-red-600">{errors.stock}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Guardar cambios' : 'Guardar producto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;
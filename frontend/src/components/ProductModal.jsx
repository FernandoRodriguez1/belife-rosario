import { useState } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import { useCategorias } from '../hooks/useCategorias';
import { useMarcas } from '../hooks/useMarcas';

const ESTADOS = ['activo', 'inactivo'];

const validarNombre = (value) =>
  !value.trim() ? 'El nombre es obligatorio.' : '';
const validarCategoria = (value) =>
  !value ? 'La categoría es obligatoria.' : '';
const validarMarca = (value) => (!value ? 'La marca es obligatoria.' : '');
const validarPrecio = (value) => {
  if (!value) return 'El precio es obligatorio.';
  return Number(value) <= 0 ? 'El precio debe ser mayor a 0.' : '';
};
const validarStock = (value) => {
  if (!value) return 'El stock es obligatorio.';
  return Number(value) < 0 ? 'El stock no puede ser negativo.' : '';
};
const validarStockMinimo = (value) => {
  if (!value) return 'El stock mínimo es obligatorio.';
  return Number(value) < 0 ? 'El stock mínimo no puede ser negativo.' : '';
};

function ProductModal({ product = null, products = [], onClose, onSave, submitError = '' }) {
  const isEditing = Boolean(product);
  const { categorias } = useCategorias();
  const { marcas } = useMarcas();
  const [form, setForm] = useState(() =>
    product
      ? {
          codigo: product.codigo ?? '',
          nombre: product.nombre,
          categoria_id: product.categoria_id ?? '',
          marca_id: product.marca_id ?? '',
          precio_actual: String(product.precio_actual),
          stock: String(product.stock),
          stock_minimo: String(product.stock_minimo ?? 5),
          estado: product.estado ?? 'activo',
        }
      : {
          codigo: '',
          nombre: '',
          categoria_id: '',
          marca_id: '',
          precio_actual: '',
          stock: '',
          stock_minimo: '5',
          estado: 'activo',
        }
  );
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validarCodigo = (value) => {
    const codigo = value.trim();
    if (!codigo) return '';

    const duplicado = products.some(
      (p) =>
        p.id !== product?.id &&
        p.codigo &&
        p.codigo.trim().toLowerCase() === codigo.toLowerCase()
    );
    return duplicado ? 'Ya existe un producto con ese código.' : '';
  };

  const validate = () => {
    const nextErrors = {
      codigo: validarCodigo(form.codigo),
      nombre: validarNombre(form.nombre),
      categoria_id: validarCategoria(form.categoria_id),
      marca_id: validarMarca(form.marca_id),
      precio_actual: validarPrecio(form.precio_actual),
      stock: validarStock(form.stock),
      stock_minimo: validarStockMinimo(form.stock_minimo),
    };
    return Object.fromEntries(
      Object.entries(nextErrors).filter(([, message]) => message)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      codigo: form.codigo.trim() || null,
      nombre: form.nombre.trim(),
      categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
      marca_id: form.marca_id ? Number(form.marca_id) : null,
      precio_actual: Number(form.precio_actual),
      stock: Number(form.stock),
      stock_minimo: Number(form.stock_minimo),
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
              Código
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
                Marca <span className="text-red-500">*</span>
              </label>
              <select
                id="marca_id"
                name="marca_id"
                value={form.marca_id}
                onChange={handleChange}
                className={`${fieldClass(Boolean(errors.marca_id))} cursor-pointer`}
              >
                <option value="">Seleccioná una marca...</option>
                {marcas.map((marca) => (
                  <option key={marca.id} value={marca.id}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
              {errors.marca_id && (
                <p className="mt-1 text-xs text-red-600">{errors.marca_id}</p>
              )}
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
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="stock_minimo">
                Stock Mínimo (unidades) <span className="text-red-500">*</span>
              </label>
              <input
                id="stock_minimo"
                name="stock_minimo"
                type="number"
                min="0"
                step="1"
                value={form.stock_minimo}
                onChange={handleChange}
                placeholder="5"
                className={fieldClass(Boolean(errors.stock_minimo))}
              />
              {errors.stock_minimo && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.stock_minimo}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
            {submitError && (
              <p className="mr-auto rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 ring-1 ring-inset ring-red-600/10">
                {submitError}
              </p>
            )}
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
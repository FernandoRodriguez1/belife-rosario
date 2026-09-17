import { useState, useCallback } from 'react';
import {
  ESTADOS,
  UNIDADES,
  UNIDADES_PRECIO,
  ETIQUETAS_PRECIO,
} from '../../constants/productForm';
import {
  getStockDisplayMode,
  getDisplayStock,
  getDisplayStockMinimo,
  getDefaultStockMinimo,
  parseStockInput,
  parseStockMinimoInput,
  convertirStockEntreModos,
} from '../../utils/unidadPrecio';

const validarNombre = (value) =>
  !value.trim() ? 'El nombre es obligatorio.' : '';
const validarCategoria = (value) =>
  !value ? 'La categoría es obligatoria.' : '';
const validarMarca = (value) => (!value ? 'La marca es obligatoria.' : '');
const validarUnidadMedida = (value) =>
  !value ? 'La unidad de medida es obligatoria.' : '';
const validarUnidadPrecio = (value, unidadMedida) =>
  unidadMedida === 'Gramos' && !value
    ? 'La unidad de precio es obligatoria.'
    : '';
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

function ProductForm({
  product = null,
  products = [],
  categorias = [],
  marcas = [],
  onClose,
  onSave,
  submitError = '',
}) {
  const isEditing = Boolean(product);
  const [form, setForm] = useState(() => {
    if (product) {
      return {
        codigo: product.codigo ?? '',
        nombre: product.nombre,
        categoria_id: product.categoria_id ?? '',
        marca_id: product.marca_id ?? '',
        precio_actual: String(product.precio_actual),
        stock: getDisplayStock(product),
        stock_minimo: getDisplayStockMinimo(product),
        estado: product.estado ?? 'activo',
        unidad_medida: product.unidad_medida ?? 'Unidad',
        unidad_precio: product.unidad_precio ?? '',
      };
    }
    return {
      codigo: '',
      nombre: '',
      categoria_id: '',
      marca_id: '',
      precio_actual: '',
      stock: '',
      stock_minimo: String(getDefaultStockMinimo('Unidad', '')),
      estado: 'activo',
      unidad_medida: 'Unidad',
      unidad_precio: '',
    };
  });
  const [errors, setErrors] = useState({});
  const [stockMinimoTocado, setStockMinimoTocado] = useState(isEditing);

  const stockDisplayMode = getStockDisplayMode(form.unidad_medida, form.unidad_precio);

  const validarCodigo = useCallback((value) => {
    const codigo = value.trim();
    if (!codigo) return '';
    const duplicado = products.some(
      (p) =>
        p.id !== product?.id &&
        p.codigo &&
        p.codigo.trim().toLowerCase() === codigo.toLowerCase()
    );
    return duplicado ? 'Ya existe un producto con ese código.' : '';
  }, [products, product?.id]);

const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'stock_minimo') {
      setStockMinimoTocado(true);
      return;
    }

    if (name === 'unidad_precio') {
      const modoAnterior = getStockDisplayMode(form.unidad_medida, form.unidad_precio);
      const modoNuevo = getStockDisplayMode(form.unidad_medida, value);
      if (form.unidad_medida === 'Gramos' && modoAnterior !== modoNuevo) {
        setForm((prev) => ({
          ...prev,
          stock: convertirStockEntreModos(prev.stock, modoAnterior, modoNuevo),
          stock_minimo: convertirStockEntreModos(prev.stock_minimo, modoAnterior, modoNuevo),
        }));
      }
      return;
    }

    if (name === 'unidad_medida') {
      const modoAnterior = getStockDisplayMode(form.unidad_medida, form.unidad_precio);
      const modoNuevo = getStockDisplayMode(value, form.unidad_precio);
      setForm((prev) => {
        const next = { ...prev };
        if (!stockMinimoTocado) {
          next.stock_minimo = String(getDefaultStockMinimo(value, prev.unidad_precio));
        }
        // Si la unidad es "Unidad", la unidad de precio no aplica: se limpia.
        if (value === 'Unidad') {
          next.unidad_precio = '';
        }
        // Convertir stock si cambió el modo
        if (modoAnterior !== modoNuevo) {
          next.stock = convertirStockEntreModos(prev.stock, modoAnterior, modoNuevo);
          if (!stockMinimoTocado) {
            next.stock_minimo = convertirStockEntreModos(prev.stock_minimo, modoAnterior, modoNuevo);
          }
        }
        return next;
      });
    }
  }, [form.unidad_medida, form.unidad_precio, stockMinimoTocado]);

  const validate = useCallback(() => {
    const nextErrors = {
      codigo: validarCodigo(form.codigo),
      nombre: validarNombre(form.nombre),
      categoria_id: validarCategoria(form.categoria_id),
      marca_id: validarMarca(form.marca_id),
      precio_actual: validarPrecio(form.precio_actual),
      stock: validarStock(form.stock),
      stock_minimo: validarStockMinimo(form.stock_minimo),
      unidad_medida: validarUnidadMedida(form.unidad_medida),
      unidad_precio: validarUnidadPrecio(form.unidad_precio, form.unidad_medida),
    };
    return Object.fromEntries(
      Object.entries(nextErrors).filter(([, message]) => message)
    );
  }, [form, validarCodigo]);

  const handleSubmit = useCallback((e) => {
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
      stock: parseStockInput(form.stock, { unidad_medida: form.unidad_medida, unidad_precio: form.unidad_precio }),
      stock_minimo: parseStockMinimoInput(form.stock_minimo, { unidad_medida: form.unidad_medida, unidad_precio: form.unidad_precio }),
      estado: form.estado,
      unidad_medida: form.unidad_medida,
      unidad_precio:
        form.unidad_medida === 'Gramos' && form.unidad_precio
          ? form.unidad_precio
          : null,
    };

    onSave(isEditing ? { ...payload, id: product.id } : payload);
  }, [form, isEditing, product, validate, onSave]);

  const fieldClass = (hasError) =>
    `w-full rounded-full border bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
      hasError
        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
        : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500/20'
    }`;

  const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-6 sm:px-6">
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

        <div>
          <label className={labelClass} htmlFor="unidad_medida">
            Unidad de Medida <span className="text-red-500">*</span>
          </label>
          <select
            id="unidad_medida"
            name="unidad_medida"
            value={form.unidad_medida}
            onChange={handleChange}
            className={`${fieldClass(Boolean(errors.unidad_medida))} cursor-pointer`}
          >
            {UNIDADES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.unidad_medida && (
            <p className="mt-1 text-xs text-red-600">
              {errors.unidad_medida}
            </p>
          )}
        </div>

        {form.unidad_medida === 'Gramos' && (
          <div>
            <label className={labelClass} htmlFor="unidad_precio">
              Unidad de Precio <span className="text-red-500">*</span>
            </label>
            <select
              id="unidad_precio"
              name="unidad_precio"
              value={form.unidad_precio}
              onChange={handleChange}
              className={`${fieldClass(Boolean(errors.unidad_precio))} cursor-pointer`}
            >
              <option value="">Seleccioná la unidad de precio...</option>
              {UNIDADES_PRECIO.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.unidad_precio && (
              <p className="mt-1 text-xs text-red-600">
                {errors.unidad_precio}
              </p>
            )}
          </div>
        )}

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
              {ETIQUETAS_PRECIO[form.unidad_precio] ?? 'Precio (ARS)'}{' '}
              <span className="text-red-500">*</span>
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
              {stockDisplayMode === 'kilos' ? 'Stock (kg)' : stockDisplayMode === 'unidades' ? 'Stock (u.)' : 'Stock (g)'}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              step={stockDisplayMode === 'kilos' ? '0.01' : '1'}
              value={form.stock}
              onChange={handleChange}
              placeholder={stockDisplayMode === 'kilos' ? '0.0' : '0'}
              className={fieldClass(Boolean(errors.stock))}
            />
            {errors.stock && (
              <p className="mt-1 text-xs text-red-600">{errors.stock}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="stock_minimo">
              {stockDisplayMode === 'kilos' ? 'Stock Mínimo (kg)' : stockDisplayMode === 'unidades' ? 'Stock Mínimo (u.)' : 'Stock Mínimo (g)'}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="stock_minimo"
              name="stock_minimo"
              type="number"
              min="0"
              step={stockDisplayMode === 'kilos' ? '0.01' : '1'}
              value={form.stock_minimo}
              onChange={handleChange}
              placeholder={stockDisplayMode === 'kilos' ? '1' : stockDisplayMode === 'unidades' ? '5' : '500'}
              className={fieldClass(Boolean(errors.stock_minimo))}
            />
            {errors.stock_minimo && (
              <p className="mt-1 text-xs text-red-600">
                {errors.stock_minimo}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-gray-100 px-5 py-4 sm:px-6">
        {submitError && (
          <p className="w-full rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 ring-1 ring-inset ring-red-600/10 sm:mr-auto sm:w-auto">
            {submitError}
          </p>
        )}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-400 px-4 py-2 text-sm gap-2"
          onClick={onClose}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-visible:ring-brand-500 px-4 py-2 text-sm gap-2"
        >
          {isEditing ? 'Guardar cambios' : 'Guardar producto'}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;
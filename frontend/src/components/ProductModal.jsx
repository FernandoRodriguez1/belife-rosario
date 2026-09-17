import { useState } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import { useCategorias } from '../hooks/useCategorias';
import { useMarcas } from '../hooks/useMarcas';
import { obtenerStockMinimoPorUnidad } from '../utils/stockMinimoStorage';
import {
  esModoKilos,
  aKilos,
  aGramos,
  convertirEntreKilosYGramos,
} from '../utils/unidadPrecio'

const ESTADOS = ['activo', 'inactivo'];
const UNIDADES = [
  { value: 'Unidad', label: 'Unidad (u.)' },
  { value: 'Gramos', label: 'Gramos (g)' },
];
// Los valores coinciden con la serialización del enum UnidadPrecio del
// backend ("Por-Kilo" | "Por-100-Gramos"); solo aplica si la unidad es "Gramos".
const UNIDADES_PRECIO = [
  { value: 'Por-Kilo', label: 'Por Kilo' },
  { value: 'Por-100-Gramos', label: 'Cada 100 gramos' },
];
const ETIQUETAS_PRECIO = {
  'Por-Kilo': 'Precio por Kilo (ARS)',
  'Por-100-Gramos': 'Precio cada 100 Gramos (ARS)',
};

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
          // En modo "kilos" (Gramos + Por-Kilo) muestro el stock dividido por
          // 1000; el resto de los casos queda en su unidad natural (g / u.).
          stock: String(
            esModoKilos(product.unidad_medida, product.unidad_precio)
              ? aKilos(product.stock)
              : product.stock
          ),
          // Al editar, muestro el valor persistido (ya resuelto desde
          // localStorage en el producto normalizado) o el default.
          stock_minimo: String(
            esModoKilos(product.unidad_medida, product.unidad_precio)
              ? aKilos(product.stock_minimo ?? 500)
              : product.stock_minimo ?? 5
          ),
          estado: product.estado ?? 'activo',
          // default "Unidad": en un almacén/dietética la mayoría se vende por unidad.
          unidad_medida: product.unidad_medida ?? 'Unidad',
          // Viene del backend como string ("Por-Kilo" | "Por-100-Gramos") o null.
          unidad_precio: product.unidad_precio ?? '',
        }
      : {
          codigo: '',
          nombre: '',
          categoria_id: '',
          marca_id: '',
          precio_actual: '',
          stock: '',
          // Al crear, default según la unidad de medida seleccionada al abrir.
          stock_minimo: String(obtenerStockMinimoPorUnidad('Unidad')),
          estado: 'activo',
          unidad_medida: 'Unidad',
          unidad_precio: '',
        }
  );
  const [errors, setErrors] = useState({});
  // En edición el valor persistido no debe pisarse si cambia la unidad.
  // En creación: solo se auto-completa el default si el usuario todavía no
  // tocó el campo Stock Mínimo (sobreescribible en cualquier momento).
  const [stockMinimoTocado, setStockMinimoTocado] = useState(isEditing);

  // El modo "kilos" solo aplica cuando la unidad de medida es "Gramos" y la
  // unidad de precio elegida es "Por-Kilo".
  const modoKilos = esModoKilos(form.unidad_medida, form.unidad_precio);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'stock_minimo') {
      setStockMinimoTocado(true);
      return;
    }

    if (name === 'unidad_precio') {
      const antesKilos = form.unidad_precio === 'Por-Kilo';
      const ahoraKilos = value === 'Por-Kilo';
      // Solo se convierte en modo gramos y cuando cambia el modo: el valor
      // cargado en los inputs se pasa al nuevo formato en tiempo real para no
      // distorsionar el dato (g → kg al pasar a "Por-Kilo", kg → g al salir).
      if (form.unidad_medida === 'Gramos' && antesKilos !== ahoraKilos) {
        setForm((prev) => ({
          ...prev,
          stock: convertirEntreKilosYGramos(prev.stock, antesKilos),
          stock_minimo: convertirEntreKilosYGramos(
            prev.stock_minimo,
            antesKilos
          ),
        }));
      }
      return;
    }

    if (name === 'unidad_medida') {
      setForm((prev) => ({
        ...prev,
        ...(!stockMinimoTocado && {
          stock_minimo: String(obtenerStockMinimoPorUnidad(value)),
        }),
        // Si la unidad es "Unidad", la unidad de precio no aplica: se limpia.
        unidad_precio: value === 'Unidad' ? '' : prev.unidad_precio,
      }));
    }
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
      unidad_medida: validarUnidadMedida(form.unidad_medida),
      unidad_precio: validarUnidadPrecio(form.unidad_precio, form.unidad_medida),
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
      // En modo "kilos" el input está en kg: se multiplica por 1000 para que la
      // API siga recibiendo gramos (redondeado porque el backend es entero).
      stock: modoKilos ? aGramos(Number(form.stock)) : Number(form.stock),
      stock_minimo: modoKilos
        ? aGramos(Number(form.stock_minimo))
        : Number(form.stock_minimo),
      estado: form.estado,
      unidad_medida: form.unidad_medida,
      // Solo aplica para "Gramos": si es "Unidad" va null (el backend lo
      // espera nullable y su conversor solo acepta "Por-Kilo"/"Por-100-Gramos").
      unidad_precio:
        form.unidad_medida === 'Gramos' && form.unidad_precio
          ? form.unidad_precio
          : null,
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
    <div className="absolute inset-0 z-50 bg-gray-900/40">
      <div className="sticky top-0 flex h-screen max-h-full w-full items-center justify-center p-4">
      <div
        className="flex max-h-[min(90vh,100%)] w-full max-w-lg flex-col rounded-3xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
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

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
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
                {modoKilos ? 'Stock (kg)' : 'Stock (unidades)'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                step={modoKilos ? '0.01' : '1'}
                value={form.stock}
                onChange={handleChange}
                placeholder={modoKilos ? '0.0' : '0'}
                className={fieldClass(Boolean(errors.stock))}
              />
              {errors.stock && (
                <p className="mt-1 text-xs text-red-600">{errors.stock}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="stock_minimo">
                {modoKilos ? 'Stock Mínimo (kg)' : 'Stock Mínimo (unidades)'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                id="stock_minimo"
                name="stock_minimo"
                type="number"
                min="0"
                step={modoKilos ? '0.01' : '1'}
                value={form.stock_minimo}
                onChange={handleChange}
                placeholder={modoKilos ? '0.5' : '5'}
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
    </div>
  );
}

export default ProductModal;
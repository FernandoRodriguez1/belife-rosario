import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Minus, Plus, Search, ShoppingCart, Trash2, X } from 'lucide-react';
import Button from './Button';
import { formatCurrency } from '../utils/formatCurrency';
import { FORMA_PAGO_OPTIONS } from '../utils/formaPago';
import {
  esModoKilos,
  esModoCienGrados,
  aKilos,
  PASO_KILOGRAMOS,
  PASO_CIEN_GRAMOS,
} from '../utils/unidadPrecio';

const SUFIJOS_STOCK = { Gramos: 'g', Unidad: 'u.' };
const PER_UNIDAD = { Gramos: 'g', Unidad: 'u' };

const sufijoStock = (unidadMedida) => SUFIJOS_STOCK[unidadMedida] ?? 'u.';

function SaleModal({
  products,
  cart,
  cartTotal,
  cartItemCount,
  cartEmpty,
  cartError,
  onAddToCart,
  onIncrement,
  onDecrement,
  onSetQuantity,
  onRemove,
  onConfirm,
  onClose,
}) {
  const [query, setQuery] = useState('');
  const [formaPago, setFormaPago] = useState(0);
  const [draftCantidades, setDraftCantidades] = useState({});

  const clearDraft = (itemId) =>
    setDraftCantidades((prev) => {
      if (!(itemId in prev)) return prev;
      const next = { ...prev };
      delete next[itemId];
      return next;
    });

  const commitCantidad = (itemId, value) => {
    onSetQuantity(itemId, value);
    clearDraft(itemId);
  };

  const normalizedQuery = query.trim().toLowerCase();
  const results = normalizedQuery
    ? products
        .filter((p) => p.nombre.toLowerCase().includes(normalizedQuery))
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
    : [];
  const cartIds = new Set(cart.map((item) => item.id));

  const stepperButtonClass =
    'flex size-7 items-center justify-center text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-transparent';
  const side = 'rounded-l-full';
  const sideRight = 'rounded-r-full';

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/40 p-4 sm:items-center"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900">
              Nueva Venta
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Buscá productos y armá el carrito para registrar la venta.
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

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900">
                Seleccionar producto
              </h3>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="w-full rounded-full border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
                {normalizedQuery && results.length === 0 && (
                  <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-500">
                    No se encontraron productos para "{query.trim()}".
                  </p>
                )}

                {!normalizedQuery && (
                  <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-500">
                    Escribí el nombre de un producto para buscarlo.
                  </p>
                )}

                {results.map((product) => {
                  const inCart = cartIds.has(product.id);
                  const outOfStock = product.stock === 0;
                  const esInactivo = product.estado === 'inactivo';
                  return (
                    <div
                      key={product.id}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-150 ${
                        esInactivo
                          ? 'border-gray-100 bg-gray-50 opacity-60'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {product.nombre}
                          </p>
                          {esInactivo && (
                            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500 ring-1 ring-inset ring-gray-400/20">
                              Inactivo
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {formatCurrency(product.precio_actual)}
                          {esModoKilos(
                            product.unidad_medida,
                            product.unidad_precio
                          ) ? ' /kg' : esModoCienGrados(
                            product.unidad_medida,
                            product.unidad_precio
                          ) ? ' c/100g' : ''}{' '}
                          ·{' '}
                          <span
                            className={
                              outOfStock
                                ? 'font-medium text-red-600'
                                : 'text-gray-500'
                            }
                          >
                            {esModoKilos(
                              product.unidad_medida,
                              product.unidad_precio
                            )
                              ? `${aKilos(product.stock)} kg`
                              : `${product.stock} ${sufijoStock(product.unidad_medida)}`}{' '}
                            {esInactivo ? 'en stock' : 'disponibles'}
                          </span>
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={inCart || esInactivo ? 'secondary' : 'primary'}
                        disabled={inCart || outOfStock || esInactivo}
                        onClick={() => onAddToCart(product)}
                      >
                        <Plus className="size-3.5" />
                        {inCart
                          ? 'En carrito'
                          : esInactivo
                            ? 'Inactivo'
                            : outOfStock
                              ? 'Sin stock'
                              : 'Agregar'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900">
                Carrito
                {cart.length > 0 && (
                  <span className="ml-1 font-medium text-gray-400">
                    ({cartItemCount} items)
                  </span>
                )}
              </h3>

              {cartEmpty ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-10 text-center">
                  <ShoppingCart className="size-6 text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">
                    El carrito está vacío.
                  </p>
                  <p className="text-xs text-gray-400">
                    Buscá un producto para agregarlo a la venta.
                  </p>
                </div>
              ) : (
                <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {cart.map((item) => {
                    const modoKilos = esModoKilos(
                      item.unidad_medida,
                      item.unidad_precio
                    );
                    const modoCienGrados = esModoCienGrados(
                      item.unidad_medida,
                      item.unidad_precio
                    );
                    const esUnidad = item.unidad_medida === 'Unidad';
                    const minima = modoKilos ? PASO_KILOGRAMOS : modoCienGrados ? PASO_CIEN_GRAMOS : 1;
                    const paso = modoKilos
                      ? String(PASO_KILOGRAMOS)
                      : modoCienGrados
                        ? String(PASO_CIEN_GRAMOS)
                        : '1';
                    return (
                      <li
                        key={item.id}
                        className="rounded-xl border border-gray-200 px-3 py-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {item.nombre}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {modoKilos
                                ? `${formatCurrency(
                                    item.precio_actual
                                  )}/kg`
                                : modoCienGrados
                                  ? `${formatCurrency(item.precio_actual)} c/100g`
                                  : `${formatCurrency(
                                      item.precio_actual
                                    )} c/${
                                      PER_UNIDAD[item.unidad_medida] ?? 'u'
                                    }`}
                            </p>
                          </div>
                          <button
                            onClick={() => onRemove(item.id)}
                            title="Quitar del carrito"
                            className="rounded-lg p-1.5 text-gray-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-gray-300">
                            <button
                              onClick={() => {
                                clearDraft(item.id);
                                onDecrement(item.id);
                              }}
                              disabled={item.cantidad <= minima}
                              className={`${stepperButtonClass} ${side}`}
                              title="Disminuir cantidad"
                            >
                              <Minus className="size-4" />
                            </button>
                            <input
                              type="number"
                              min={minima}
                              step={paso}
                              inputMode={esUnidad ? 'numeric' : 'decimal'}
                              value={
                                draftCantidades[item.id] ??
                                String(item.cantidad)
                              }
                              onChange={(e) => {
                                let value = e.target.value;
                                // Para unidades: solo permitir dígitos (enteros)
                                if (esUnidad) {
                                  value = value.replace(/[^0-9]/g, '');
                                }
                                setDraftCantidades((prev) => ({
                                  ...prev,
                                  [item.id]: value,
                                }));
                              }}
                              onBlur={(e) =>
                                commitCantidad(item.id, e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter')
                                  e.currentTarget.blur();
                              }}
                              aria-label={`Cantidad de ${item.nombre}`}
                              className="w-12 bg-white text-center text-sm font-semibold text-gray-900 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              onClick={() => {
                                clearDraft(item.id);
                                onIncrement(item.id);
                              }}
                              className={`${stepperButtonClass} ${sideRight}`}
                              title="Aumentar cantidad"
                            >
                              <Plus className="size-4" />
                            </button>
                          </div>
                          <p className="font-display text-sm font-semibold text-gray-900">
                            {formatCurrency(item.subtotal)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {cartError && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 ring-1 ring-inset ring-red-600/10">
              {cartError}
            </p>
          )}

          <div className="mt-5 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
            <label
              htmlFor="forma_pago"
              className="text-sm font-semibold text-gray-900"
            >
              Forma de pago
            </label>
            <select
              id="forma_pago"
              value={formaPago}
              onChange={(e) => setFormaPago(Number(e.target.value))}
              className="cursor-pointer rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {FORMA_PAGO_OPTIONS.map(({ value, label }) => (
                <option key={label} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Total de la venta
            </p>
            <p className="font-display text-2xl font-bold text-gray-900">
              {formatCurrency(cartTotal)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={() => onConfirm(formaPago)} disabled={cartEmpty}>
              <ShoppingCart className="size-4" />
              Confirmar Venta
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default SaleModal;
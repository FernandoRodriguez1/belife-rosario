import { useState, useCallback, useMemo, useEffect } from 'react';
import { ventasService } from '../services/ventasService';
import {
  calcularSubtotal,
  calcularTotalCarrito,
  hayStockDisponible,
} from '../utils/saleCalculations';
import {
  esModoKilos,
  aKilos,
  aGramos,
  redondearKilos,
  GRAMOS_POR_KILO,
  PASO_KILOGRAMOS,
} from '../utils/unidadPrecio';

function normalizarDetalle(d) {
  return {
    producto_id: d.productoId,
    nombre: d.productoNombre,
    unidad_medida: d.unidadMedida ?? null,
    unidad_precio: d.unidadPrecio ?? null,
    cantidad: d.cantidad,
    precio_unitario: Number(d.precioUnitario),
    subtotal: Number(d.subtotal),
  };
}

function normalizarVenta(v) {
  const detalles = v.detalles ?? [];
  return {
    id: v.id,
    total: Number(v.monto),
    forma_pago: v.formaPago ?? null,
    fecha: v.fechaHora,
    cantidad_items:
      v.cantidadDetalles ??
      detalles.reduce((sum, d) => sum + (d.cantidad ?? 0), 0),
    items: detalles.map(normalizarDetalle),
  };
}

export function useSales(products, refreshProducts) {
  const [cart, setCart] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [cartError, setCartError] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshVentas = useCallback(async () => {
    try {
      const data = await ventasService.getAll();
      setVentas(data.map(normalizarVenta));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    ventasService
      .getAll()
      .then((data) => {
        if (!active) return;
        setVentas(data.map(normalizarVenta));
        setError('');
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const addToCart = useCallback(
    (product) => {
      const existing = cart.find((item) => item.id === product.id);
      // En modo kilos (Gramos + Por-Kilo) el carrito opera en KG (paso 0.1);
      // el resto de los productos en su unidad natural (gramos o unidades).
      const modoKilos = esModoKilos(product.unidad_medida, product.unidad_precio);
      const paso = modoKilos ? PASO_KILOGRAMOS : 1;
      const nextCantidad = existing
        ? modoKilos
          ? redondearKilos(existing.cantidad + paso)
          : existing.cantidad + paso
        : paso;
      // La validación de stock siempre compara en gramos (unidad del backend).
      const cantidadGramos = modoKilos ? aGramos(nextCantidad) : nextCantidad;

      if (!hayStockDisponible(product.stock, cantidadGramos)) {
        setCartError(
          `No hay stock suficiente de "${product.nombre}" para agregar más.`
        );
        return;
      }

      setCartError('');
      setCart(
        existing
          ? cart.map((item) =>
              item.id === product.id
                ? {
                    ...item,
                    cantidad: nextCantidad,
                    subtotal: calcularSubtotal(
                      item.precio_actual,
                      nextCantidad
                    ),
                  }
                : item
            )
          : [
              ...cart,
              {
                ...product,
                cantidad: nextCantidad,
                subtotal: calcularSubtotal(product.precio_actual, nextCantidad),
              },
            ]
      );
    },
    [cart]
  );

  const incrementQuantity = useCallback(
    (productId) => {
      const item = cart.find((i) => i.id === productId);
      if (!item) return;

      const modoKilos = esModoKilos(item.unidad_medida, item.unidad_precio);
      const paso = modoKilos ? PASO_KILOGRAMOS : 1;
      const nextCantidad = modoKilos
        ? redondearKilos(item.cantidad + paso)
        : item.cantidad + paso;
      const cantidadGramos = modoKilos ? aGramos(nextCantidad) : nextCantidad;

      if (!hayStockDisponible(item.stock, cantidadGramos)) {
        setCartError(
          `Stock insuficiente de "${item.nombre}": máximo ${
            modoKilos ? `${aKilos(item.stock)} kg` : `${item.stock} unidades`
          }.`
        );
        return;
      }

      setCartError('');
      setCart(
        cart.map((i) =>
          i.id === productId
            ? {
                ...i,
                cantidad: nextCantidad,
                subtotal: calcularSubtotal(i.precio_actual, nextCantidad),
              }
            : i
        )
      );
    },
    [cart]
  );

  const decrementQuantity = useCallback((productId) => {
    setCartError('');
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== productId) return item;

        const modoKilos = esModoKilos(item.unidad_medida, item.unidad_precio);
        const minima = modoKilos ? PASO_KILOGRAMOS : 1;
        if (item.cantidad <= minima) return item;

        const paso = modoKilos ? PASO_KILOGRAMOS : 1;
        const nextCantidad = modoKilos
          ? redondearKilos(item.cantidad - paso)
          : item.cantidad - paso;

        return {
          ...item,
          cantidad: nextCantidad,
          subtotal: calcularSubtotal(item.precio_actual, nextCantidad),
        };
      })
    );
  }, []);

  // Permite setear la cantidad directamente (input editable del carrito).
  // Valida contra el stock disponible y la cota mínima (0.1 kg en modo kilos,
  // 1 en el resto): si llega a 0 o a un valor inválido vacío, el ítem se quita
  // del carrito para no dejar un valor inconsistente.
  const setQuantity = useCallback(
    (productId, cantidad) => {
      const item = cart.find((i) => i.id === productId);
      if (!item) return;

      const modoKilos = esModoKilos(item.unidad_medida, item.unidad_precio);
      const minima = modoKilos ? PASO_KILOGRAMOS : 1;

      const numero = Number(cantidad);
      if (!Number.isFinite(numero)) {
        setCartError(
          `La cantidad de "${item.nombre}" debe ser un número válido.`
        );
        return;
      }

      if (numero < minima) {
        setCartError('');
        setCart(cart.filter((i) => i.id !== productId));
        return;
      }

      const cantidadFinal = modoKilos ? redondearKilos(numero) : numero;
      // Validación de stock SIEMPRE en gramos (unidad del backend): el modo
      // kilos carga en kg pero el stock del backend está en gramos.
      const cantidadGramos = modoKilos ? aGramos(cantidadFinal) : cantidadFinal;

      if (!hayStockDisponible(item.stock, cantidadGramos)) {
        setCartError(
          `Stock insuficiente de "${item.nombre}": máximo ${
            modoKilos ? `${aKilos(item.stock)} kg` : `${item.stock} unidades`
          }.`
        );
        return;
      }

      setCartError('');
      setCart(
        cart.map((i) =>
          i.id === productId
            ? {
                ...i,
                cantidad: cantidadFinal,
                subtotal: calcularSubtotal(i.precio_actual, cantidadFinal),
              }
            : i
        )
      );
    },
    [cart]
  );

  const removeFromCart = useCallback(
    (productId) => {
      setCartError('');
      setCart(cart.filter((item) => item.id !== productId));
    },
    [cart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setCartError('');
  }, []);

  const confirmSale = useCallback(
    async (formaPago) => {
      if (cart.length === 0 || isConfirming) return false;

      for (const item of cart) {
        const product = products.find((p) => p.id === item.id);
        const modoKilos = esModoKilos(item.unidad_medida, item.unidad_precio);
        // Validación de stock SIEMPRE en gramos (unidad del backend).
        const cantidadGramos = modoKilos ? aGramos(item.cantidad) : item.cantidad;
        if (!product || !hayStockDisponible(product.stock, cantidadGramos)) {
          setCartError(
            `Stock insuficiente de "${item.nombre}". Revisá el carrito antes de confirmar.`
          );
          return false;
        }
      }

      // PAYLOAD POST /api/ventas (según CreateVentaDto/CreateDetalleVentaDto del
      // backend): { formaPago, detalles: [{ productoId, cantidad,
      // precioUnitario }] }. El backend calcula Subtotal = Cantidad *
      // PrecioUnitario y descuenta el stock EN GRAMOS (Cantidad es int). Por
      // eso en modo kilos la cantidad se envía en gramos (kg * 1000) y el
      // PrecioUnitario prorrateado por gramo (precio por kilo / 1000): así el
      // Subtotal del servidor coincide con el del carrito. formaPago es el
      // número del enum (Efectivo=0, Debito=1, Credito=2, Transferencia=3,
      // Otro=4).
      const detalles = cart.map((item) => {
        const modoKilos = esModoKilos(item.unidad_medida, item.unidad_precio);
        return {
          productoId: item.id,
          cantidad: modoKilos ? aGramos(item.cantidad) : item.cantidad,
          precioUnitario: modoKilos
            ? item.precio_actual / GRAMOS_POR_KILO
            : item.precio_actual,
        };
      });

      setIsConfirming(true);
      try {
        await ventasService.create({ formaPago, detalles });
        setCart([]);
        setCartError('');
        await refreshVentas();
        await refreshProducts();
        return true;
      } catch (err) {
        setCartError(err.message);
        return false;
      } finally {
        setIsConfirming(false);
      }
    },
    [cart, products, isConfirming, refreshVentas, refreshProducts]
  );

  const cartTotal = useMemo(() => calcularTotalCarrito(cart), [cart]);
  const cartItemCount = cart.length;
  const cartEmpty = cart.length === 0;

  // DELETE /api/ventas/{id}: el backend NO devuelve el stock de los productos
  // vendidos. Solo se remueve la venta del estado local (sin recargar todo el
  // historial). Si falla, el error se propaga para que el modal lo muestre.
  const eliminarVenta = useCallback(async (id) => {
    await ventasService.remove(id);
    setVentas((prev) => prev.filter((v) => v.id !== id));
  }, []);

  return {
    cart,
    cartTotal,
    cartItemCount,
    cartEmpty,
    cartError,
    ventas,
    isLoading,
    error,
    refreshVentas,
    eliminarVenta,
    addToCart,
    incrementQuantity,
    decrementQuantity,
    setQuantity,
    removeFromCart,
    clearCart,
    confirmSale,
  };
}

export default useSales;
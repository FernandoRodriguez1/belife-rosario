import { useState, useCallback, useMemo, useEffect } from 'react';
import { ventasService } from '../services/ventasService';
import {
  calcularSubtotal,
  calcularTotalCarrito,
  calcularCantidadItems,
  hayStockDisponible,
} from '../utils/saleCalculations';

function normalizarDetalle(d) {
  return {
    producto_id: d.productoId,
    nombre: d.productoNombre,
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
      const nextCantidad = (existing ? existing.cantidad : 0) + 1;

      if (!hayStockDisponible(product.stock, nextCantidad)) {
        setCartError(
          `No hay stock suficiente de "${product.nombre}" para agregar más unidades.`
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
                cantidad: 1,
                subtotal: calcularSubtotal(product.precio_actual, 1),
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

      const nextCantidad = item.cantidad + 1;
      if (!hayStockDisponible(item.stock, nextCantidad)) {
        setCartError(
          `Stock insuficiente de "${item.nombre}": máximo ${item.stock} unidades.`
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

  const decrementQuantity = useCallback(
    (productId) => {
      setCartError('');
      setCart(
        cart.map((item) =>
          item.id === productId && item.cantidad > 1
            ? {
                ...item,
                cantidad: item.cantidad - 1,
                subtotal: calcularSubtotal(item.precio_actual, item.cantidad - 1),
              }
            : item
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
        if (!product || !hayStockDisponible(product.stock, item.cantidad)) {
          setCartError(
            `Stock insuficiente de "${item.nombre}". Revisá el carrito antes de confirmar.`
          );
          return false;
        }
      }

      // PAYLOAD POST /api/ventas (según CreateVentaDto/CreateDetalleVentaDto del
      // backend): { formaPago, detalles: [{ productoId, cantidad,
      // precioUnitario }] }. El stock se descuenta en el servidor. formaPago es
      // el número del enum (Efectivo=0, Debito=1, Credito=2, Transferencia=3,
      // Otro=4).
      const detalles = cart.map((item) => ({
        productoId: item.id,
        cantidad: item.cantidad,
        precioUnitario: item.precio_actual,
      }));

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
  const cartItemCount = useMemo(() => calcularCantidadItems(cart), [cart]);
  const cartEmpty = cart.length === 0;

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
    addToCart,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    clearCart,
    confirmSale,
  };
}

export default useSales;
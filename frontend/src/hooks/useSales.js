import { useState, useCallback, useMemo } from 'react';
import { initialVentas } from '../data/ventas';
import { useAuth } from './useAuth';
import {
  calcularSubtotal,
  calcularTotalCarrito,
  calcularCantidadItems,
  hayStockDisponible,
} from '../utils/saleCalculations';

export function useSales(products, deductStock) {
  const { currentUser } = useAuth();
  const [cart, setCart] = useState([]);
  const [ventas, setVentas] = useState(initialVentas);
  const [cartError, setCartError] = useState('');

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

  const confirmSale = useCallback(() => {
    if (cart.length === 0) return false;

    for (const item of cart) {
      const product = products.find((p) => p.id === item.id);
      if (!product || !hayStockDisponible(product.stock, item.cantidad)) {
        setCartError(
          `Stock insuficiente de "${item.nombre}". Revisá el carrito antes de confirmar.`
        );
        return false;
      }
    }

    const id = Math.max(0, ...ventas.map((v) => v.id)) + 1;

    const items = cart.map((item) => ({
      producto_id: item.id,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio_unitario: item.precio_actual,
      subtotal: calcularSubtotal(item.precio_actual, item.cantidad),
    }));

    const venta = {
      id,
      administrador_id: currentUser?.id ?? null,
      fecha: new Date().toISOString(),
      items,
      total: calcularTotalCarrito(cart),
    };

    setVentas((prev) => [venta, ...prev]);
    cart.forEach((item) => deductStock(item.id, item.cantidad));
    setCart([]);
    setCartError('');
    return true;
  }, [cart, products, ventas, deductStock, currentUser]);

  const cartTotal = useMemo(() => calcularTotalCarrito(cart), [cart]);
  const cartItemCount = useMemo(() => calcularCantidadItems(cart), [cart]);
  const cartEmpty = cart.length === 0;

  const ventasConDetalle = useMemo(
    () =>
      ventas.map((venta) => ({
        ...venta,
        cantidad_items: calcularCantidadItems(venta.items),
      })),
    [ventas]
  );

  return {
    cart,
    cartTotal,
    cartItemCount,
    cartEmpty,
    cartError,
    ventas: ventasConDetalle,
    addToCart,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    clearCart,
    confirmSale,
  };
}
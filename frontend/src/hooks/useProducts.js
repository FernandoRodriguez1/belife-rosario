import { useState, useMemo, useCallback } from 'react';
import { initialProducts } from '../data/products';
import { filtrarStockBajo } from '../utils/stockAlerts';

export function useProducts() {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const addProduct = useCallback((product) => {
    setProducts((prev) => [
      ...prev,
      { ...product, id: Math.max(0, ...prev.map((p) => p.id)) + 1 },
    ]);
  }, []);

  const updateProduct = useCallback((product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? product : p))
    );
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const deductStock = useCallback((id, quantity) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock - quantity) } : p
      )
    );
  }, []);

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const inventoryValue = products.reduce(
    (sum, p) => sum + p.precio_actual * p.stock,
    0
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    let visible = normalizedQuery
      ? products.filter((p) =>
          p.nombre.toLowerCase().includes(normalizedQuery)
        )
      : products;

    if (onlyLowStock) {
      visible = filtrarStockBajo(visible);
    }

    return [...visible].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.precio_actual - b.precio_actual;
        case 'stock':
          return a.stock - b.stock;
        case 'name':
        default:
          return a.nombre.localeCompare(b.nombre);
      }
    });
  }, [products, query, sortBy, onlyLowStock]);

  return {
    products: filteredProducts,
    allProducts: products,
    totalProducts,
    totalStock,
    inventoryValue,
    addProduct,
    updateProduct,
    deleteProduct,
    deductStock,
    query,
    setQuery,
    sortBy,
    setSortBy,
    onlyLowStock,
    setOnlyLowStock,
  };
}
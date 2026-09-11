import { useState, useMemo, useCallback } from 'react';
import { initialProducts } from '../data/products';

export function useProducts() {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

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

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const inventoryValue = products.reduce(
    (sum, p) => sum + p.precio_actual * p.stock,
    0
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = normalizedQuery
      ? products.filter((p) =>
          p.nombre.toLowerCase().includes(normalizedQuery)
        )
      : products;

    return [...filtered].sort((a, b) => {
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
  }, [products, query, sortBy]);

  return {
    products: filteredProducts,
    totalProducts,
    totalStock,
    inventoryValue,
    addProduct,
    updateProduct,
    deleteProduct,
    query,
    setQuery,
    sortBy,
    setSortBy,
  };
}
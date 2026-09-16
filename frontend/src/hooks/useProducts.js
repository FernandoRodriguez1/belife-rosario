import { useState, useMemo, useCallback, useEffect } from 'react';
import { productosService } from '../services/productosService';
import { filtrarStockBajo } from '../utils/stockAlerts';

// El backend no expone "stock_minimo" (no existe en el esquema de producto).
// Se deja en null: los cálculos de stock bajo usan el default (5) y el
// ProductModal muestra el placeholder al editar.
function normalizarProducto(p) {
  return {
    id: p.id,
    codigo: p.codigo ?? '',
    nombre: p.nombre,
    categoria_id: p.categoriaId,
    categoria_nombre: p.categoriaNombre,
    marca_id: p.marcaId,
    marca_nombre: p.marcaNombre,
    precio_actual: Number(p.precioActual),
    stock: Number(p.stock),
    stock_minimo: null,
    estado: p.estado ? 'activo' : 'inactivo',
  };
}

function normalizarProductoParaBackend(product) {
  const estadoBooleano =
    typeof product.estado === 'boolean'
      ? product.estado
      : product.estado === 'activo';

  return {
    codigo: product.codigo ?? null,
    nombre: product.nombre,
    categoriaId: Number(product.categoria_id),
    marcaId: Number(product.marca_id),
    precioActual: Number(product.precio_actual),
    stock: Number(product.stock),
    estado: estadoBooleano,
  };
}

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const refreshProducts = useCallback(async () => {
    try {
      const data = await productosService.getAll();
      setProducts(data.map(normalizarProducto));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    productosService
      .getAll()
      .then((data) => {
        if (!active) return;
        setProducts(data.map(normalizarProducto));
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

  const addProduct = useCallback(
    async (product) => {
      await productosService.create(normalizarProductoParaBackend(product));
      await refreshProducts();
    },
    [refreshProducts]
  );

  const updateProduct = useCallback(
    async (product) => {
      await productosService.update(product.id, normalizarProductoParaBackend(product));
      await refreshProducts();
    },
    [refreshProducts]
  );

  const deleteProduct = useCallback(
    async (id) => {
      await productosService.remove(id);
      await refreshProducts();
    },
    [refreshProducts]
  );

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
    isLoading,
    error,
    refreshProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    query,
    setQuery,
    sortBy,
    setSortBy,
    onlyLowStock,
    setOnlyLowStock,
  };
}

export default useProducts;
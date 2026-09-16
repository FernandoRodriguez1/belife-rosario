import { useState, useMemo, useCallback, useEffect } from 'react';
import { productosService } from '../services/productosService';
import { filtrarStockBajo } from '../utils/stockAlerts';
import {
  guardarStockMinimo,
  obtenerStockMinimo,
  eliminarStockMinimo,
} from '../utils/stockMinimoStorage';

// El backend no expone "stock_minimo" (no existe en su esquema). El valor se
// resuelve desde localStorage (ver utils/stockMinimoStorage.js) con un default
// según la unidad de medida: 5 si es "Unidad", 500 si es "Gramos".
function normalizarProducto(p) {
  const unidadMedida = p.unidadMedida ?? 'Gramos';
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
    stock_minimo: obtenerStockMinimo(p.id, unidadMedida),
    estado: p.estado ? 'activo' : 'inactivo',
    // unidadMedida viaja como string ("Gramos" | "Unidad"). Los productos
    // creados antes de este campo se guardaron con el default "Gramos".
    unidad_medida: unidadMedida,
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
    // El backend rechaza null: normalizamos a "Unidad" o "Gramos".
    unidadMedida: product.unidad_medida === 'Unidad' ? 'Unidad' : 'Gramos',
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
      const creado = await productosService.create(
        normalizarProductoParaBackend(product)
      );
      // El id real recién se conoce tras el POST exitoso (el backend devuelve
      // el producto creado con su id); recién ahí persisto el stock mínimo.
      if (creado?.id) guardarStockMinimo(creado.id, product.stock_minimo);
      await refreshProducts();
    },
    [refreshProducts]
  );

  const updateProduct = useCallback(
    async (product) => {
      await productosService.update(
        product.id,
        normalizarProductoParaBackend(product)
      );
      guardarStockMinimo(product.id, product.stock_minimo);
      await refreshProducts();
    },
    [refreshProducts]
  );

  const deleteProduct = useCallback(
    async (id) => {
      await productosService.remove(id);
      eliminarStockMinimo(id);
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
import { useState, useMemo, useCallback, useEffect } from 'react';
import { productosService } from '../services/productosService';
import { filtrarStockBajo } from '../utils/stockAlerts';
import {
  guardarStockMinimo,
  obtenerStockMinimo,
  eliminarStockMinimo,
} from '../utils/stockMinimoStorage';
import { stockEnUnidadDePrecio } from '../utils/unidadPrecio';

// El backend no expone "stock_minimo" (no existe en su esquema). El valor se
// resuelve desde localStorage (ver utils/stockMinimoStorage.js) con un default
// según la unidad de medida y unidad de precio:
// - Unidad: 5
// - Gramos + Por-Kilo: 1000 (1kg)
// - Gramos + Por-100-Gramos / sin precio: 500
function normalizarProducto(p) {
  const unidadMedida = p.unidadMedida ?? 'Gramos';
  const unidadPrecio = p.unidadPrecio ?? null;
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
    stock_minimo: obtenerStockMinimo(p.id, unidadMedida, unidadPrecio),
    estado: p.estado ? 'activo' : 'inactivo',
    // unidadMedida viaja como string ("Gramos" | "Unidad"). Los productos
    // creados antes de este campo se guardaron con el default "Gramos".
    unidad_medida: unidadMedida,
    // unidadPrecio viaja como string ("Por-Kilo" | "Por-100-Gramos") o null
    // cuando la unidad de medida es "Unidad" (no aplica).
    unidad_precio: unidadPrecio,
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
    // stock/stock_minimo viajan SIEMPRE en gramos (o unidades): la conversión
    // a kilos del formulario (unidad_precio = "Por-Kilo") es solo de
    // presentación y el modal ya envía convertido (ver utils/unidadPrecio.js).
    stock: Number(product.stock),
    estado: estadoBooleano,
    // El backend rechaza null: normalizamos a "Unidad" o "Gramos".
    unidadMedida: product.unidad_medida === 'Unidad' ? 'Unidad' : 'Gramos',
    // El conversor del backend solo acepta "Por-Kilo" | "Por-100-Gramos"
    // (o null, que es el caso cuando la unidad de medida es "Unidad").
    unidadPrecio: product.unidad_precio || null,
  };
}

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  // Orden combinado en una sola variable: campo + dirección ("name-asc",
  // "price-desc", "stock-asc", etc.), tal como lo emite el selector único.
  const [sort, setSort] = useState('name-asc');
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
  // El precio está expresado por unidad de precio (por kilo / cada 100 g):
  // el stock (en gramos) se convierte a esa unidad antes de multiplicar, para
  // no inflar el valor (ej: $1.000/kg × 4000g = $4.000, no $4.000.000).
  const inventoryValue = products.reduce(
    (sum, p) => sum + p.precio_actual * stockEnUnidadDePrecio(p.stock, p.unidad_precio),
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

    const [sortField, sortOrder] = sort.split('-');
    const sortFactor = sortOrder === 'desc' ? -1 : 1;

    // La dirección se aplica de forma consistente a los 3 campos: Nombre
    // (A-Z/Z-A), Precio y Stock (menor-mayor/mayor-menor).
    return [...visible].sort((a, b) => {
      switch (sortField) {
        case 'price':
          return (a.precio_actual - b.precio_actual) * sortFactor;
        case 'stock':
          return (a.stock - b.stock) * sortFactor;
        case 'name':
        default:
          return a.nombre.localeCompare(b.nombre) * sortFactor;
      }
    });
  }, [products, query, sort, onlyLowStock]);

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
    sort,
    setSort,
    onlyLowStock,
    setOnlyLowStock,
  };
}

export default useProducts;
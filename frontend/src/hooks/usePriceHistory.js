import { useState, useCallback, useEffect } from 'react';
import { historialPreciosService } from '../services/historialPreciosService';
import { useAuth } from './useAuth';

function normalizarHistorial(h) {
  return {
    id: h.id,
    producto_id: h.productoId,
    producto_nombre: h.productoNombre,
    precio_anterior: Number(h.precioAnterior),
    precio_nuevo: Number(h.precioNuevo),
    fecha: h.fecha,
    administrador_id: h.administradorId,
    administrador_nombre: h.administradorNombre,
  };
}

export function usePriceHistory() {
  const { currentUser } = useAuth();
  const [historial, setHistorial] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshHistorial = useCallback(async () => {
    try {
      const data = await historialPreciosService.getAll();
      setHistorial(data.map(normalizarHistorial));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    historialPreciosService
      .getAll()
      .then((data) => {
        if (!active) return;
        setHistorial(data.map(normalizarHistorial));
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

  // El backend toma PrecioAnterior del precio actual del producto y actualiza
  // PrecioActual con precioNuevo. No se envía precio_anterior.
  const addPriceChange = useCallback(
    async ({ producto_id, precio_nuevo }) => {
      await historialPreciosService.create({
        productoId: producto_id,
        precioNuevo: Number(precio_nuevo),
        administradorId: currentUser?.id ?? null,
      });
      await refreshHistorial();
    },
    [currentUser, refreshHistorial]
  );

  const getHistoryForProduct = useCallback(
    (producto_id) =>
      historial
        .filter((h) => h.producto_id === producto_id)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
    [historial]
  );

  return {
    addPriceChange,
    getHistoryForProduct,
    isLoading,
    error,
    refreshHistorial,
  };
}

export default usePriceHistory;
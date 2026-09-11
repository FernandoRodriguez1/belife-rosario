import { useState, useCallback } from 'react';
import { initialHistorial } from '../data/historialPrecios';
import { useAuth } from './useAuth';

export function usePriceHistory() {
  const { currentUser } = useAuth();
  const [historial, setHistorial] = useState(initialHistorial);

  const addPriceChange = useCallback(
    ({ producto_id, precio_anterior, precio_nuevo }) => {
      setHistorial((prev) => {
        const nextId = Math.max(0, ...prev.map((h) => h.id)) + 1;
        return [
          ...prev,
          {
            id: nextId,
            producto_id,
            administrador_id: currentUser?.id ?? null,
            precio_anterior,
            precio_nuevo,
            fecha: new Date().toISOString(),
          },
        ];
      });
    },
    [currentUser]
  );

  const getHistoryForProduct = useCallback(
    (producto_id) =>
      historial
        .filter((h) => h.producto_id === producto_id)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
    [historial]
  );

  return { addPriceChange, getHistoryForProduct };
}
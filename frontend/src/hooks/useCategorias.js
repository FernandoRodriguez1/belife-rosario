import { useCallback, useEffect, useState } from 'react';
import { categoriasService } from '../services/categoriasService';

export function useCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    categoriasService
      .getAll()
      .then((data) => {
        if (!active) return;
        setCategorias(data);
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

  const refresh = useCallback(async () => {
    try {
      const data = await categoriasService.getAll();
      setCategorias(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { categorias, isLoading, error, refresh };
}

export default useCategorias;
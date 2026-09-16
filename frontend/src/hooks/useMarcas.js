import { useCallback, useEffect, useState } from 'react';
import { marcasService } from '../services/marcasService';

export function useMarcas() {
  const [marcas, setMarcas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    marcasService
      .getAll()
      .then((data) => {
        if (!active) return;
        setMarcas(data);
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
      const data = await marcasService.getAll();
      setMarcas(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { marcas, isLoading, error, refresh };
}

export default useMarcas;
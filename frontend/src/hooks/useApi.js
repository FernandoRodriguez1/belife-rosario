import { useCallback, useEffect, useRef, useState } from 'react';

export function useApi(service) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const activeRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!activeRef.current) return;
    try {
      const result = await service.getAll();
      if (!activeRef.current) return;
      setData(result);
      setError('');
    } catch (err) {
      if (!activeRef.current) return;
      setError(err.message);
    } finally {
      if (activeRef.current) setIsLoading(false);
    }
  }, [service]);

  useEffect(() => {
    activeRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    return () => {
      activeRef.current = false;
    };
  }, [fetchData]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchData();
  }, [fetchData]);

  const create = useCallback(async (payload) => {
    const created = await service.create(payload);
    await refresh();
    return created;
  }, [service, refresh]);

  const update = useCallback(async (id, payload) => {
    await service.update(id, payload);
    await refresh();
  }, [service, refresh]);

  const remove = useCallback(async (id) => {
    await service.remove(id);
    await refresh();
  }, [service, refresh]);

  return {
    data,
    isLoading,
    error,
    refresh,
    create,
    update,
    remove,
  };
}

export default useApi;
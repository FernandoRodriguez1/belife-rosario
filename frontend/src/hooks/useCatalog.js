import { useMemo, useCallback, useState } from 'react';
import { useApi } from './useApi';

export function useCatalog(service, labelSingular) {
  const api = useApi(service);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalError, setModalError] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const existingNames = useMemo(() => {
    const id = editingItem?.id;
    return api.data
      .filter((item) => item.id !== id)
      .map((item) => item.nombre.toLowerCase());
  }, [api.data, editingItem]);

  const openNew = useCallback(() => {
    setEditingItem(null);
    setModalError('');
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((item) => {
    setEditingItem(item);
    setModalError('');
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(async (payload) => {
    try {
      if (editingItem) {
        await api.update(payload.id, payload);
      } else {
        await api.create(payload);
      }
      setModalError('');
      setModalOpen(false);
      setEditingItem(null);
      await api.refresh();
    } catch (err) {
      setModalError(err.message);
    }
  }, [api, editingItem]);

  const handleConfirmDelete = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await api.remove(itemToDelete.id);
      setDeleteError('');
      setItemToDelete(null);
      await api.refresh();
    } catch (err) {
      setDeleteError(err.message);
      setItemToDelete(null);
    }
  }, [api, itemToDelete]);

  const bannerError = api.error || deleteError;

  return {
    ...api,
    modalOpen,
    setModalOpen,
    editingItem,
    setEditingItem,
    modalError,
    setModalError,
    itemToDelete,
    setItemToDelete,
    deleteError,
    setDeleteError,
    existingNames,
    openNew,
    openEdit,
    handleSave,
    handleConfirmDelete,
    bannerError,
    labelSingular,
  };
}

export default useCatalog;
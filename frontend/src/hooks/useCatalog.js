import { useMemo, useCallback, useState } from 'react';
import { useApi } from './useApi';
import { useToast } from './useToast';

export function useCatalog(service, labelSingular) {
  const api = useApi(service);
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalError, setModalError] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (editingItem) {
        await api.update(payload.id, payload);
        toast.success(`La ${labelSingular} ha sido modificada correctamente`);
      } else {
        await api.create(payload);
        toast.success(`La ${labelSingular} se creó correctamente`);
      }
      setModalError('');
      setModalOpen(false);
      setEditingItem(null);
      await api.refresh();
    } catch (err) {
      setModalError(err.message);
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  }, [api, editingItem, isSaving, labelSingular, toast]);

  const handleConfirmDelete = useCallback(async () => {
    if (!itemToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await api.remove(itemToDelete.id);
      setDeleteError('');
      setItemToDelete(null);
      await api.refresh();
      toast.success(`La ${labelSingular} se ha eliminado correctamente`);
    } catch (err) {
      setDeleteError(err.message);
      setItemToDelete(null);
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  }, [api, itemToDelete, isDeleting, labelSingular, toast]);

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
    isSaving,
    isDeleting,
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
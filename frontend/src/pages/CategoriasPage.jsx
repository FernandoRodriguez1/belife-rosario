import { useMemo, useState } from 'react';
import { Layers, Plus } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import Button from '../components/Button';
import CatalogTable from '../components/CatalogTable';
import CatalogModal from '../components/CatalogModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useCategorias } from '../hooks/useCategorias';
import { categoriasService } from '../services/categoriasService';

function CategoriasPage() {
  const { categorias, isLoading, error, refresh } = useCategorias();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalError, setModalError] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const existingNames = useMemo(() => {
    const id = editingItem?.id;
    return categorias
      .filter((c) => c.id !== id)
      .map((c) => c.nombre.toLowerCase());
  }, [categorias, editingItem]);

  const openNew = () => {
    setEditingItem(null);
    setModalError('');
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setModalError('');
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    try {
      if (editingItem) {
        await categoriasService.update(payload.id, payload);
      } else {
        await categoriasService.create(payload);
      }
      setModalError('');
      setModalOpen(false);
      setEditingItem(null);
      await refresh();
    } catch (err) {
      setModalError(err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await categoriasService.remove(itemToDelete.id);
      setDeleteError('');
      setItemToDelete(null);
      await refresh();
    } catch (err) {
      setDeleteError(err.message);
      setItemToDelete(null);
    }
  };

  const bannerError = error || deleteError;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Categorías
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestioná las categorías del catálogo de Belife Rosario.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 font-display text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-500/20">
              <Layers className="size-4" />
              {categorias.length} categorías
            </span>
            <Button onClick={openNew}>
              <Plus className="size-4" />
              Nueva Categoría
            </Button>
          </div>
        </div>

        {bannerError && (
          <p className="w-full rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 ring-1 ring-inset ring-red-600/10">
            {bannerError}
          </p>
        )}

        {isLoading && categorias.length === 0 ? (
          <p className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500 shadow-sm">
            Cargando categorías...
          </p>
        ) : error && categorias.length === 0 ? (
          <p className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500 shadow-sm">
            No se pudieron cargar las categorías. Revisá tu conexión e intentá de
            nuevo.
          </p>
        ) : (
          <CatalogTable
            icon={Layers}
            items={categorias}
            emptyMessage="Aún no hay categorías. Creá la primera."
            onEdit={openEdit}
            onDelete={setItemToDelete}
          />
        )}
      </div>

      {modalOpen && (
        <CatalogModal
          key={editingItem ? editingItem.id : 'new'}
          item={editingItem}
          labelSingular="categoría"
          existingNames={existingNames}
          submitError={modalError}
          onClose={() => {
            setModalOpen(false);
            setEditingItem(null);
            setModalError('');
          }}
          onSave={handleSave}
        />
      )}

      {itemToDelete && (
        <ConfirmDialog
          title="Eliminar categoría"
          message={`¿Estás seguro de que querés eliminar "${itemToDelete.nombre}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={handleConfirmDelete}
          onCancel={() => setItemToDelete(null)}
        />
      )}
    </AdminLayout>
  );
}

export default CategoriasPage;
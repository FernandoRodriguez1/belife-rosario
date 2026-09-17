import { useMemo, useState } from 'react';
import { Plus, Tag } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import Button from '../components/Button';
import CatalogTable from '../components/CatalogTable';
import CatalogModal from '../components/CatalogModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useMarcas } from '../hooks/useMarcas';
import { marcasService } from '../services/marcasService';

function MarcasPage() {
  const { marcas, isLoading, error, refresh } = useMarcas();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalError, setModalError] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const existingNames = useMemo(() => {
    const id = editingItem?.id;
    return marcas
      .filter((m) => m.id !== id)
      .map((m) => m.nombre.toLowerCase());
  }, [marcas, editingItem]);

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
        await marcasService.update(payload.id, payload);
      } else {
        await marcasService.create(payload);
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
      await marcasService.remove(itemToDelete.id);
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
      <div className="min-h-[32rem] space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Marcas
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestioná las marcas del catálogo de Belife Rosario.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 font-display text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-500/20">
              <Tag className="size-4" />
              {marcas.length} marcas
            </span>
            <Button onClick={openNew}>
              <Plus className="size-4" />
              Nueva Marca
            </Button>
          </div>
        </div>

        {bannerError && (
          <p className="w-full rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 ring-1 ring-inset ring-red-600/10">
            {bannerError}
          </p>
        )}

        {isLoading && marcas.length === 0 ? (
          <p className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500 shadow-sm">
            Cargando marcas...
          </p>
        ) : error && marcas.length === 0 ? (
          <p className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500 shadow-sm">
            No se pudieron cargar las marcas. Revisá tu conexión e intentá de
            nuevo.
          </p>
        ) : (
          <CatalogTable
            icon={Tag}
            items={marcas}
            emptyMessage="Aún no hay marcas. Creá la primera."
            onEdit={openEdit}
            onDelete={setItemToDelete}
          />
        )}
      </div>

      {modalOpen && (
        <CatalogModal
          key={editingItem ? editingItem.id : 'new'}
          item={editingItem}
          labelSingular="marca"
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
          title="Eliminar marca"
          message={`¿Estás seguro de que querés eliminar "${itemToDelete.nombre}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={handleConfirmDelete}
          onCancel={() => setItemToDelete(null)}
        />
      )}
    </AdminLayout>
  );
}

export default MarcasPage;
import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import Button from '../components/Button';
import CatalogTable from '../components/CatalogTable';
import CatalogModal from '../components/CatalogModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useCatalog } from '../hooks/useCatalog';

function CatalogPage({ title, icon: Icon, labelSingular, service, emptyMessage, productLabel }) {
  const {
    data: items,
    isLoading,
    error,
    modalOpen,
    setModalOpen,
    editingItem,
    setEditingItem,
    modalError,
    setModalError,
    itemToDelete,
    setItemToDelete,
    existingNames,
    openNew,
    openEdit,
    handleSave,
    handleConfirmDelete,
    bannerError,
  } = useCatalog(service, labelSingular);

  const displayEmptyMessage = useMemo(() => {
    if (typeof emptyMessage === 'function') {
      return emptyMessage(items.length);
    }
    return emptyMessage;
  }, [emptyMessage, items.length]);

  return (
    <AdminLayout>
      <div className="min-h-[32rem] space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestioná las {labelSingular}s del catálogo de Belife Rosario.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 font-display text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-500/20">
              <Icon className="size-4" />
              {items.length} {labelSingular}{items.length !== 1 ? 's' : ''}
            </span>
            <Button onClick={openNew}>
              <Plus className="size-4" />
              Nueva {labelSingular[0].toUpperCase() + labelSingular.slice(1)}
            </Button>
          </div>
        </div>

        {bannerError && (
          <p className="w-full rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 ring-1 ring-inset ring-red-600/10">
            {bannerError}
          </p>
        )}

        {isLoading && items.length === 0 ? (
          <p className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500 shadow-sm">
            Cargando {labelSingular}s...
          </p>
        ) : error && items.length === 0 ? (
          <p className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500 shadow-sm">
            No se pudieron cargar las {labelSingular}s. Revisá tu conexión e intentá de
            nuevo.
          </p>
        ) : (
          <CatalogTable
            icon={Icon}
            items={items}
            emptyMessage={displayEmptyMessage}
            productLabel={productLabel}
            onEdit={openEdit}
            onDelete={setItemToDelete}
          />
        )}
      </div>

      {modalOpen && (
        <CatalogModal
          key={editingItem ? editingItem.id : 'new'}
          item={editingItem}
          labelSingular={labelSingular}
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
          title={`Eliminar ${labelSingular}`}
          message={`¿Estás seguro de que querés eliminar "${itemToDelete.nombre}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={handleConfirmDelete}
          onCancel={() => setItemToDelete(null)}
        />
      )}
    </AdminLayout>
  );
}

export default CatalogPage;
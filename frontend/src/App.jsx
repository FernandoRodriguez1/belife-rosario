import { useState } from 'react';
import { Package } from 'lucide-react';
import AdminLayout from './layouts/AdminLayout';
import StatsCards from './components/StatsCards';
import SearchBar from './components/SearchBar';
import ProductTable from './components/ProductTable';
import ProductModal from './components/ProductModal';
import ConfirmDialog from './components/ConfirmDialog';
import PriceHistoryModal from './components/PriceHistoryModal';
import { useProducts } from './hooks/useProducts';
import { usePriceHistory } from './hooks/usePriceHistory';

function App() {
  const {
    products,
    totalProducts,
    totalStock,
    inventoryValue,
    addProduct,
    updateProduct,
    deleteProduct,
    query,
    setQuery,
    sortBy,
    setSortBy,
  } = useProducts();
  const { addPriceChange, getHistoryForProduct } = usePriceHistory();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [historyProduct, setHistoryProduct] = useState(null);

  const openNewProduct = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleSave = (payload) => {
    if (editingProduct) {
      if (payload.precio_actual !== editingProduct.precio_actual) {
        addPriceChange({
          producto_id: payload.id,
          precio_anterior: editingProduct.precio_actual,
          precio_nuevo: payload.precio_actual,
        });
      }
      updateProduct(payload);
    } else {
      addProduct(payload);
    }
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900">
              Productos
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestioná el catálogo de Belife Rosario.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 font-display text-sm font-semibold text-brand-700 ring-1 ring-inset ring-brand-600/20">
            <Package className="size-4" />
            {totalProducts} productos
          </span>
        </div>

        <StatsCards
          totalProducts={totalProducts}
          totalStock={totalStock}
          inventoryValue={inventoryValue}
        />

        <SearchBar
          query={query}
          onQueryChange={setQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onNewProduct={openNewProduct}
        />

        <ProductTable
          products={products}
          onEdit={openEditProduct}
          onDelete={setProductToDelete}
          onHistory={setHistoryProduct}
        />
      </div>

      {modalOpen && (
        <ProductModal
          key={editingProduct ? editingProduct.id : 'new'}
          product={editingProduct}
          onClose={() => {
            setModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSave}
        />
      )}

      {historyProduct && (
        <PriceHistoryModal
          product={historyProduct}
          history={getHistoryForProduct(historyProduct.id)}
          onClose={() => setHistoryProduct(null)}
        />
      )}

      {productToDelete && (
        <ConfirmDialog
          title="Eliminar producto"
          message={`¿Estás seguro de que querés eliminar "${productToDelete.nombre}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={handleConfirmDelete}
          onCancel={() => setProductToDelete(null)}
        />
      )}
    </AdminLayout>
  );
}

export default App;
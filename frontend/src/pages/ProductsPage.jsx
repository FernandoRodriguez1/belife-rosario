import { useState } from 'react';
import { History, Package } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import StatsCards from '../components/StatsCards';
import SearchBar from '../components/SearchBar';
import ProductTable from '../components/ProductTable';
import ProductModal from '../components/ProductModal';
import ConfirmDialog from '../components/ConfirmDialog';
import PriceHistoryModal from '../components/PriceHistoryModal';
import SaleModal from '../components/SaleModal';
import SalesHistoryModal from '../components/SalesHistoryModal';
import Button from '../components/Button';
import { useProducts } from '../hooks/useProducts';
import { usePriceHistory } from '../hooks/usePriceHistory';
import { useSales } from '../hooks/useSales';

function ProductsPage() {
  const {
    products,
    allProducts,
    totalProducts,
    totalStock,
    inventoryValue,
    isLoading: productsLoading,
    error: productsError,
    refreshProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    query,
    setQuery,
    sort,
    setSort,
    onlyLowStock,
    setOnlyLowStock,
  } = useProducts();
  const {
    addPriceChange,
    getHistoryForProduct,
    isLoading: historyLoading,
    error: historyError,
  } = usePriceHistory();
  const sales = useSales(allProducts, refreshProducts);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalError, setModalError] = useState('');
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [historyProduct, setHistoryProduct] = useState(null);
  const [saleOpen, setSaleOpen] = useState(false);
  const [salesHistoryOpen, setSalesHistoryOpen] = useState(false);

  const openNewProduct = () => {
    setEditingProduct(null);
    setModalError('');
    setModalOpen(true);
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setModalError('');
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    try {
      if (editingProduct) {
        const priceChanged =
          payload.precio_actual !== editingProduct.precio_actual;
        // El backend registra PrecioAnterior desde el precio actual del
        // producto, por eso el historial se debe registrar ANTES del PUT.
        if (priceChanged) {
          await addPriceChange({
            producto_id: editingProduct.id,
            precio_nuevo: payload.precio_actual,
          });
        }
        await updateProduct(payload);
      } else {
        await addProduct(payload);
      }
      setModalError('');
      setModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      setModalError(err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
      setDeleteError('');
      setProductToDelete(null);
    } catch (err) {
      setDeleteError(err.message);
      setProductToDelete(null);
    }
  };

  const bannerError = productsError || deleteError;

  return (
    <AdminLayout>
      <div className="min-h-[44rem] space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Productos
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestioná el catálogo de Belife Rosario.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={() => setSalesHistoryOpen(true)}>
              <History className="size-4" />
              Historial de Ventas
            </Button>
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 font-display text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-500/20">
              <Package className="size-4" />
              {totalProducts} productos
            </span>
          </div>
        </div>

        {bannerError && (
          <p className="w-full rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 ring-1 ring-inset ring-red-600/10">
            {bannerError}
          </p>
        )}

        <StatsCards
          totalProducts={totalProducts}
          totalStock={totalStock}
          inventoryValue={inventoryValue}
          products={allProducts}
          onlyLowStock={onlyLowStock}
          onLowStockClick={() => setOnlyLowStock((prev) => !prev)}
        />

        <SearchBar
          query={query}
          onQueryChange={setQuery}
          sort={sort}
          onSortChange={setSort}
          onNewProduct={openNewProduct}
          onNewSale={() => setSaleOpen(true)}
          onlyLowStock={onlyLowStock}
          onToggleLowStock={() => setOnlyLowStock((prev) => !prev)}
        />

        {productsLoading && allProducts.length === 0 ? (
          <p className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500 shadow-sm">
            Cargando productos...
          </p>
        ) : productsError && allProducts.length === 0 ? (
          <p className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500 shadow-sm">
            No se pudieron cargar los productos. Revisá tu conexión e intentá de
            nuevo.
          </p>
        ) : (
          <ProductTable
            products={products}
            onEdit={openEditProduct}
            onDelete={setProductToDelete}
            onHistory={setHistoryProduct}
          />
        )}
      </div>

      {salesHistoryOpen && (
        <SalesHistoryModal
          ventas={sales.ventas}
          isLoading={sales.isLoading}
          error={sales.error}
          onDelete={sales.eliminarVenta}
          onClose={() => setSalesHistoryOpen(false)}
        />
      )}

      {saleOpen && (
        <SaleModal
          products={allProducts}
          cart={sales.cart}
          cartTotal={sales.cartTotal}
          cartItemCount={sales.cartItemCount}
          cartEmpty={sales.cartEmpty}
          cartError={sales.cartError}
          onAddToCart={sales.addToCart}
          onIncrement={sales.incrementQuantity}
          onDecrement={sales.decrementQuantity}
          onSetQuantity={sales.setQuantity}
          onRemove={sales.removeFromCart}
          onConfirm={async (formaPago) => {
            if (await sales.confirmSale(formaPago)) setSaleOpen(false);
          }}
          onClose={() => {
            sales.clearCart();
            setSaleOpen(false);
          }}
        />
      )}

      {modalOpen && (
        <ProductModal
          key={editingProduct ? editingProduct.id : 'new'}
          product={editingProduct}
          products={allProducts}
          submitError={modalError}
          onClose={() => {
            setModalOpen(false);
            setEditingProduct(null);
            setModalError('');
          }}
          onSave={handleSave}
        />
      )}

      {historyProduct && (
        <PriceHistoryModal
          product={historyProduct}
          history={getHistoryForProduct(historyProduct.id)}
          isLoading={historyLoading}
          error={historyError}
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

export default ProductsPage;
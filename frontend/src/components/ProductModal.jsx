import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import ProductForm from './forms/ProductForm';

function ProductModal({ product = null, products = [], categorias = [], marcas = [], onClose, onSave, submitError = '', isSubmitting = false }) {
  const isEditing = Boolean(product);

  return createPortal(
    <div className="fixed inset-0 z-50 bg-gray-900/40">
      <div className="sticky top-0 flex h-screen max-h-full w-full items-center justify-center p-4">
        <div
          className="flex max-h-[min(90vh,100%)] w-full max-w-lg flex-col rounded-3xl bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900">
                {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">
                {isEditing
                  ? 'Modificá los datos y guardá los cambios.'
                  : 'Completá los datos del nuevo producto.'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600"
              title="Cerrar"
            >
              <X className="size-5" />
            </button>
          </div>

          <ProductForm
            product={product}
            products={products}
            categorias={categorias}
            marcas={marcas}
            onClose={onClose}
            onSave={onSave}
            submitError={submitError}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ProductModal;
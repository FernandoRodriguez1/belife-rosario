import {
  AlertTriangle,
  ArrowDownWideNarrow,
  Plus,
  Search,
  ShoppingCart,
} from 'lucide-react';
import Button from './Button';

function SearchBar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  onNewProduct,
  onNewSale,
  onlyLowStock,
  onToggleLowStock,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:flex-nowrap">
      <div className="relative sm:w-full lg:w-auto lg:flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar producto por nombre..."
          className="w-full rounded-full border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button
          variant={onlyLowStock ? 'primary' : 'secondary'}
          onClick={onToggleLowStock}
          className="w-full sm:w-auto"
        >
          <AlertTriangle className="size-4" />
          Ver solo stock bajo
        </Button>
        <div className="relative w-full sm:w-auto">
          <ArrowDownWideNarrow className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full cursor-pointer rounded-full border border-gray-300 bg-white py-2 pl-9 pr-8 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="name-asc">Nombre (A-Z)</option>
            <option value="name-desc">Nombre (Z-A)</option>
            <option value="price-asc">Precio (menor a mayor)</option>
            <option value="price-desc">Precio (mayor a menor)</option>
            <option value="stock-asc">Stock (menor a mayor)</option>
            <option value="stock-desc">Stock (mayor a menor)</option>
          </select>
        </div>
        <Button
          variant="secondary"
          onClick={onNewSale}
          className="w-full sm:w-auto"
        >
          <ShoppingCart className="size-4" />
          Nueva Venta
        </Button>
        <Button onClick={onNewProduct} className="w-full sm:w-auto">
          <Plus className="size-4" />
          Nuevo Producto
        </Button>
      </div>
    </div>
  );
}

export default SearchBar;
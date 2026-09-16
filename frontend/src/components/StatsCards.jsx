import { AlertTriangle, Boxes, Package, Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { contarProductosStockBajo } from '../utils/stockAlerts';
import { calcularStockPorUnidad } from '../utils/stockStats';

const cards = [
  {
    label: 'Productos',
    key: 'products',
    icon: Package,
    iconBg: 'bg-green-100 text-green-600',
    accent: 'bg-green-500',
  },
  {
    label: 'Stock Total',
    key: 'stock',
    icon: Boxes,
    iconBg: 'bg-blue-100 text-blue-600',
    accent: 'bg-blue-500',
  },
  {
    label: 'Valor Inventario',
    key: 'value',
    icon: Wallet,
    iconBg: 'bg-amber-100 text-amber-600',
    accent: 'bg-amber-500',
  },
  {
    label: 'Stock Bajo',
    key: 'lowStock',
    icon: AlertTriangle,
    iconBg: 'bg-red-100 text-red-600',
    accent: 'bg-red-500',
    clickable: true,
  },
];

function StatsCards({
  totalProducts,
  totalStock,
  inventoryValue,
  products,
  onlyLowStock,
  onLowStockClick,
}) {
  const lowStockCount = contarProductosStockBajo(products ?? []);
  const { unidades, gramos, hayUnidades, hayGramos } = calcularStockPorUnidad(
    products ?? []
  );
  const values = {
    products: String(totalProducts),
    stock: String(totalStock),
    value: formatCurrency(inventoryValue),
    lowStock: String(lowStockCount),
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isClickable = Boolean(card.clickable);
        const isActive = isClickable && onlyLowStock;
        return (
          <button
            key={card.key}
            type="button"
            disabled={!isClickable}
            onClick={isClickable ? onLowStockClick : undefined}
            className={`relative overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition-all duration-150 sm:p-5 ${
              isClickable
                ? 'cursor-pointer hover:shadow-md'
                : 'cursor-default'
            } ${
              isActive
                ? 'border-red-400 ring-2 ring-red-500/30'
                : 'border-gray-200'
            }`}
          >
            <span className={`absolute inset-x-0 top-0 h-1 ${card.accent}`} />
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-11 sm:rounded-2xl ${card.iconBg}`}
              >
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">
                  {card.label}
                </p>
                {card.key === 'stock' ? (
                  hayUnidades || hayGramos ? (
                    <div className="mt-0.5">
                      <p className="truncate font-display text-xl font-bold text-gray-900 sm:text-2xl">
                        {hayUnidades ? `${unidades} u.` : `${gramos} g`}
                      </p>
                      {hayUnidades && hayGramos && (
                        <p className="mt-0.5 text-xs font-medium text-gray-500 sm:text-sm">
                          {gramos} g
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-0.5 truncate font-display text-xl font-bold text-gray-900 sm:text-2xl">
                      0
                    </p>
                  )
                ) : (
                  <p className="mt-0.5 truncate font-display text-xl font-bold text-gray-900 sm:text-2xl">
                    {values[card.key]}
                  </p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default StatsCards;
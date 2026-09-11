import { Package, Boxes, Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

const cards = [
  {
    label: 'Productos',
    key: 'products',
    icon: Package,
    iconBg: 'bg-brand-100 text-brand-700',
    accent: 'bg-brand-500',
  },
  {
    label: 'Stock Total',
    key: 'stock',
    icon: Boxes,
    iconBg: 'bg-rose-100 text-rose-600',
    accent: 'bg-rose-400',
  },
  {
    label: 'Valor Inventario',
    key: 'value',
    icon: Wallet,
    iconBg: 'bg-amber-100 text-amber-600',
    accent: 'bg-amber-400',
  },
];

function StatsCards({ totalProducts, totalStock, inventoryValue }) {
  const values = {
    products: String(totalProducts),
    stock: String(totalStock),
    value: formatCurrency(inventoryValue),
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow duration-150 hover:shadow-md"
          >
            <span className={`absolute inset-x-0 top-0 h-1 ${card.accent}`} />
            <div className="flex items-center gap-4">
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${card.iconBg}`}
              >
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className="mt-0.5 truncate font-display text-2xl font-bold text-gray-900">
                  {values[card.key]}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsCards;
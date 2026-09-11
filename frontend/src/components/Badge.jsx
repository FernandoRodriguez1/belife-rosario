const categoryStyles = {
  'Mieles': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'Aceites': 'bg-stone-100 text-stone-600 ring-stone-500/20',
  'Frutos Secos': 'bg-orange-50 text-orange-700 ring-orange-600/20',
  'Tés': 'bg-rose-50 text-rose-700 ring-rose-600/20',
  'Cereales': 'bg-brand-50 text-brand-700 ring-brand-600/20',
  'Cacao': 'bg-rose-100 text-rose-800 ring-rose-700/20',
  'Semillas': 'bg-brand-50 text-brand-800 ring-brand-700/20',
  'Condimentos': 'bg-stone-100 text-stone-700 ring-stone-600/20',
  'Bienestar': 'bg-brand-100 text-brand-800 ring-brand-700/20',
};

function getCategoryStyle(category) {
  return categoryStyles[category] ?? 'bg-gray-50 text-gray-700 ring-gray-600/20';
}

function Badge({ children, category }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getCategoryStyle(category)}`}
    >
      {children}
    </span>
  );
}

export default Badge;
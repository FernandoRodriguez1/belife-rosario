const variants = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-visible:ring-brand-500',
  secondary:
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  ghost:
    'bg-transparent text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-400',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2',
};

import Spinner from './Spinner';

function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled,
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

export default Button;
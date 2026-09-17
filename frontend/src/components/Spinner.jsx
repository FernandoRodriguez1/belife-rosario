import { Loader2 } from 'lucide-react';

const sizes = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-6',
};

function Spinner({ size = 'md', className = '' }) {
  const dimension = sizes[size] ?? sizes.md;
  return (
    <Loader2
      className={`${dimension} animate-spin ${className}`}
      aria-hidden="true"
    />
  );
}

export default Spinner;

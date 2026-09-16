export const FORMA_PAGO_OPTIONS = [
  { value: 0, label: 'Efectivo' },
  { value: 1, label: 'Débito' },
  { value: 2, label: 'Crédito' },
  { value: 3, label: 'Transferencia' },
  { value: 4, label: 'Otro' },
];

const FORMA_PAGO_LABELS = {
  0: 'Efectivo',
  1: 'Débito',
  2: 'Crédito',
  3: 'Transferencia',
  4: 'Otro',
};

export function labelFormaPago(value) {
  if (value === null || value === undefined || value === '') {
    return 'No especificada';
  }
  return FORMA_PAGO_LABELS[Number(value)] ?? 'No especificada';
}
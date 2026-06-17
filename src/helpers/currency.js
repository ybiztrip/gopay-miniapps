export default function currencyFormatter(amount, currencyCode = 'IDR') {
  if (typeof amount !== 'number') return amount;

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
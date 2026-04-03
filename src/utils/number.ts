export function formatNumber(
  amount: number,
  {
    minimumFractionDigits,
    maximumFractionDigits,
  }: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {},
): string {
  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: minimumFractionDigits ?? 3,
    maximumFractionDigits: maximumFractionDigits ?? 3,
  })}`;
}

export function formatCurrency(
  amount: number,
  locale: string = 'en-US',
  currency: string = 'USD',
  minimumFractionDigits = 0,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
  }).format(amount);
}

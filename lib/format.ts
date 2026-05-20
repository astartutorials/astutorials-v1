export function formatDay(date: string | null): string {
  if (!date) return 'Date TBD';
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

export function formatPrice(price: number): string {
  return `₦${price.toLocaleString()}`;
}

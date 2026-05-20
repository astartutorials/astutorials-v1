import { formatDay, formatPrice } from '@/lib/format';

describe('formatPrice', () => {
  it('formats a round number', () => {
    expect(formatPrice(5000)).toBe('₦5,000');
  });

  it('formats a number with thousands separator', () => {
    expect(formatPrice(10000)).toBe('₦10,000');
  });

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('₦0');
  });

  it('formats a small number', () => {
    expect(formatPrice(500)).toBe('₦500');
  });
});

describe('formatDay', () => {
  it('returns "Date TBD" for null', () => {
    expect(formatDay(null)).toBe('Date TBD');
  });

  it('returns a formatted date string for a valid date', () => {
    // Use a fixed date to avoid test flakiness
    const result = formatDay('2025-05-21');
    expect(result).toContain('21');
    expect(result).toContain('May');
    // Should include the weekday
    expect(result).toMatch(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/);
  });
});

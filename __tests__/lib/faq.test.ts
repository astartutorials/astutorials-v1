import { ALL_FAQS, HOME_FAQS } from '@/lib/faq';

describe('FAQ content', () => {
  it('shows a short list on the homepage', () => {
    expect(HOME_FAQS.length).toBeGreaterThanOrEqual(4);
    expect(HOME_FAQS.length).toBeLessThanOrEqual(6);
  });

  it('quotes the current plan prices and commissions', () => {
    const text = ALL_FAQS.map((f) => f.answer).join(' ');
    expect(text).toContain('₦100,000');
    expect(text).toContain('₦300,000');
    expect(text).toContain('₦5,000');
    expect(text).toContain('₦15,000');
  });

  // No refund policy beyond "no refunds" (Uche, 2026-11-12). The old answer
  // promised a "First Session Guarantee" nobody had agreed to.
  it('makes no refund promise', () => {
    const refund = ALL_FAQS.find((f) => /refund/i.test(f.question));
    expect(refund?.answer).toMatch(/non-refundable/);
    expect(refund?.answer).toMatch(/duplicate payment/);
    expect(ALL_FAQS.map((f) => f.answer).join(' ')).not.toMatch(/guarantee/i);
  });

  it('has no duplicate questions', () => {
    const qs = ALL_FAQS.map((f) => f.question);
    expect(new Set(qs).size).toBe(qs.length);
  });
});

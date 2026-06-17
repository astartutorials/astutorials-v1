import { effectiveStatus } from '@/app/admin/(dashboard)/tutorials/page';

const PAST = '2000-01-01';
const FUTURE = '2999-01-01';
const TODAY = new Date().toISOString().split('T')[0];

describe('effectiveStatus', () => {
  it('treats a past-dated active tutorial as completed', () => {
    expect(effectiveStatus({ status: 'active', date: PAST })).toBe('completed');
  });

  it('keeps a future-dated active tutorial active', () => {
    expect(effectiveStatus({ status: 'active', date: FUTURE })).toBe('active');
  });

  it('keeps a tutorial dated today active (not yet past)', () => {
    expect(effectiveStatus({ status: 'active', date: TODAY })).toBe('active');
  });

  it('keeps an active tutorial with no date active', () => {
    expect(effectiveStatus({ status: 'active', date: null })).toBe('active');
  });

  it('does not auto-complete a past-dated draft', () => {
    expect(effectiveStatus({ status: 'draft', date: PAST })).toBe('draft');
  });

  it('leaves an already-completed tutorial completed', () => {
    expect(effectiveStatus({ status: 'completed', date: PAST })).toBe('completed');
  });
});

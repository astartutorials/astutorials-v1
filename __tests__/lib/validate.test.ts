import { validateBookingForm } from '@/lib/validate';

const validForm = {
  fullName: 'Ada Okonkwo',
  email: 'ada@example.com',
  phone: '08012345678',
};

describe('validateBookingForm', () => {
  it('returns no errors for a valid form', () => {
    expect(validateBookingForm(validForm)).toEqual({});
  });

  it('requires fullName', () => {
    const errors = validateBookingForm({ ...validForm, fullName: '' });
    expect(errors.fullName).toBe('Required');
  });

  it('treats whitespace-only fullName as empty', () => {
    const errors = validateBookingForm({ ...validForm, fullName: '   ' });
    expect(errors.fullName).toBe('Required');
  });

  it('requires email', () => {
    const errors = validateBookingForm({ ...validForm, email: '' });
    expect(errors.email).toBe('Valid email required');
  });

  it('rejects an email without @', () => {
    const errors = validateBookingForm({ ...validForm, email: 'notanemail' });
    expect(errors.email).toBe('Valid email required');
  });

  it('requires phone', () => {
    const errors = validateBookingForm({ ...validForm, phone: '' });
    expect(errors.phone).toBe('Required');
  });

  it('returns multiple errors when several fields are missing', () => {
    const errors = validateBookingForm({ fullName: '', email: '', phone: '' });
    expect(errors.fullName).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.phone).toBeDefined();
  });

  it('does not add errors for fields that are valid', () => {
    const errors = validateBookingForm({ ...validForm, phone: '' });
    expect(errors.fullName).toBeUndefined();
    expect(errors.email).toBeUndefined();
  });
});

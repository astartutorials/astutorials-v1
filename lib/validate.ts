export interface BookingFormValues {
  fullName: string;
  email: string;
  phone: string;
}

export interface BookingFormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
}

export function validateBookingForm(form: BookingFormValues): BookingFormErrors {
  const errors: BookingFormErrors = {};
  if (!form.fullName.trim()) errors.fullName = 'Required';
  if (!form.email.trim() || !form.email.includes('@')) errors.email = 'Valid email required';
  if (!form.phone.trim()) errors.phone = 'Required';
  return errors;
}

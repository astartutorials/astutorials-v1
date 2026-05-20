import { NextRequest } from 'next/server';

// Mock Supabase before importing the route (it creates the client at module scope)
const mockInsert = jest.fn().mockResolvedValue({ error: null });
const mockMaybeSingle = jest.fn().mockResolvedValue({ data: null }); // no existing booking by default
const mockSingle = jest.fn().mockResolvedValue({ data: null });       // tutorial lookup for email
const mockEq = jest.fn(() => ({ maybeSingle: mockMaybeSingle, single: mockSingle }));
const mockSelectChain = jest.fn(() => ({ eq: mockEq }));
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({ insert: mockInsert, select: mockSelectChain })),
  })),
}));

// Mock email helpers — they should never make real network calls in tests
jest.mock('@/lib/email', () => ({
  sendGroupBookingConfirmation: jest.fn(),
  sendPrivateBookingReceipt: jest.fn(),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';
process.env.PAYSTACK_SECRET_KEY = 'sk_test_dummy';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';

import { GET } from '@/app/api/paystack/verify/route';
import { sendGroupBookingConfirmation, sendPrivateBookingReceipt } from '@/lib/email';

function makeRequest(reference?: string) {
  const url = reference
    ? `http://localhost:3000/api/paystack/verify?reference=${reference}`
    : 'http://localhost:3000/api/paystack/verify';
  return new NextRequest(url);
}

function mockPaystackSuccess(metadata: object, extraData: object = {}) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      status: true,
      data: {
        status: 'success',
        amount: 507500, // kobo — ₦5,075
        metadata,
        customer: { email: 'student@example.com', first_name: 'Ada' },
        ...extraData,
      },
    }),
  });
}

describe('GET /api/paystack/verify', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
    mockInsert.mockClear();
    mockMaybeSingle.mockReset().mockResolvedValue({ data: null });
    mockSingle.mockReset().mockResolvedValue({ data: null });
    mockEq.mockClear();
    mockSelectChain.mockClear();
  });

  it('redirects to /tutorials when no reference is provided', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/tutorials');
  });

  it('redirects to booking-failed when Paystack payment status is not success', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: true,
        data: { status: 'failed', metadata: {} },
      }),
    });
    const res = await GET(makeRequest('ref_failed'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('booking-failed');
  });

  it('redirects to booking-failed when Paystack API call fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ status: false }),
    });
    const res = await GET(makeRequest('ref_error'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('booking-failed');
  });

  describe('private tutorial payment', () => {
    it('redirects to WhatsApp with the student name and phone in the message', async () => {
      mockPaystackSuccess({
        type: 'private',
        full_name: 'Ada Okonkwo',
        phone: '08012345678',
      });

      const res = await GET(makeRequest('ref_private'));
      expect(res.status).toBe(307);

      const location = res.headers.get('location')!;
      expect(location).toContain('api.whatsapp.com');
      expect(decodeURIComponent(location)).toContain('Ada Okonkwo');
      expect(decodeURIComponent(location)).toContain('08012345678');
    });

    it('includes notes in the WhatsApp message when provided', async () => {
      mockPaystackSuccess({
        type: 'private',
        full_name: 'Test Student',
        phone: '08000000000',
        notes: 'Need help with integration',
      });

      const res = await GET(makeRequest('ref_private_notes'));
      const location = decodeURIComponent(res.headers.get('location')!);
      expect(location).toContain('Need help with integration');
    });

    it('inserts a booking row with null tutorial_id', async () => {
      mockPaystackSuccess({ type: 'private', full_name: 'Ada Okonkwo', phone: '08012345678' });
      await GET(makeRequest('ref_private_db'));
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          tutorial_id: null,
          full_name: 'Ada Okonkwo',
          payment_status: 'paid',
          payment_reference: 'ref_private_db',
        })
      );
    });

    it('sends a receipt email to the student', async () => {
      mockPaystackSuccess({ type: 'private', full_name: 'Ada Okonkwo', phone: '080' });
      await GET(makeRequest('ref_private_email'));
      expect(sendPrivateBookingReceipt).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'student@example.com', fullName: 'Ada Okonkwo' })
      );
    });
  });

  describe('group tutorial payment', () => {
    it('redirects to booking-success page', async () => {
      mockPaystackSuccess({ tutorial_id: 'tut-1', full_name: 'Ada Okonkwo', phone: '08012345678' });

      const res = await GET(makeRequest('ref_group'));
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('booking-success');
    });

    it('inserts a booking record with all fields including amount_paid', async () => {
      mockPaystackSuccess({
        tutorial_id: 'tut-abc',
        full_name: 'Ada Okonkwo',
        phone: '08012345678',
        notes: 'Please confirm slot',
      });

      await GET(makeRequest('ref_group_insert'));

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          tutorial_id: 'tut-abc',
          full_name: 'Ada Okonkwo',
          email: 'student@example.com',
          phone: '08012345678',
          notes: 'Please confirm slot',
          amount_paid: 5075,
          payment_status: 'paid',
          payment_reference: 'ref_group_insert',
        })
      );
    });

    it('includes the reference in the success redirect URL', async () => {
      mockPaystackSuccess({ tutorial_id: 'tut-1' });

      const res = await GET(makeRequest('ref_abc123'));
      const location = res.headers.get('location')!;
      expect(location).toContain('ref=ref_abc123');
    });

    it('sends a confirmation email when tutorial details are found', async () => {
      mockPaystackSuccess({ tutorial_id: 'tut-1', full_name: 'Ada Okonkwo' });
      mockSingle.mockResolvedValueOnce({
        data: { title: 'Calculus', date: '2026-06-01', time: '10:00 AM' },
      });

      await GET(makeRequest('ref_email_test'));
      expect(sendGroupBookingConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'student@example.com',
          fullName: 'Ada Okonkwo',
          tutorialTitle: 'Calculus',
          amountPaid: 5075,
        })
      );
    });

    it('skips insert and still redirects to booking-success when booking already exists', async () => {
      mockPaystackSuccess({ tutorial_id: 'tut-1', full_name: 'Ada', phone: '080' });
      mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'existing-booking' } });

      const res = await GET(makeRequest('ref_duplicate'));
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('booking-success');
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('redirects to booking-failed when DB insert fails', async () => {
      mockPaystackSuccess({ tutorial_id: 'tut-1', full_name: 'Ada', phone: '080' });
      mockInsert.mockResolvedValueOnce({ error: { message: 'DB write error' } });

      const res = await GET(makeRequest('ref_db_fail'));
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('booking-failed');
    });
  });
});

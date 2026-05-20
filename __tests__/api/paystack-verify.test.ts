import { NextRequest } from 'next/server';

// Mock Supabase before importing the route (it creates the client at module scope)
const mockInsert = jest.fn().mockResolvedValue({ error: null });
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({ insert: mockInsert })),
  })),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';
process.env.PAYSTACK_SECRET_KEY = 'sk_test_dummy';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';

import { GET } from '@/app/api/paystack/verify/route';

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

    it('does NOT insert a booking into the database', async () => {
      mockPaystackSuccess({ type: 'private', full_name: 'Ada', phone: '080' });
      await GET(makeRequest('ref_private_nodb'));
      expect(mockInsert).not.toHaveBeenCalled();
    });
  });

  describe('group tutorial payment', () => {
    it('redirects to booking-success page', async () => {
      mockPaystackSuccess({ tutorial_id: 'tut-1', full_name: 'Ada Okonkwo', phone: '08012345678' });

      const res = await GET(makeRequest('ref_group'));
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('booking-success');
    });

    it('inserts a booking record with all fields', async () => {
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
  });
});

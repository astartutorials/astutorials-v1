import { NextRequest } from 'next/server';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: jest.fn(), rpc: jest.fn().mockResolvedValue({}) })),
}));

jest.mock('@/lib/audit', () => ({ logAuditEvent: jest.fn().mockResolvedValue(undefined) }));

const mockRecord = jest.fn();
const mockFetchTx = jest.fn();
jest.mock('@/lib/record-booking', () => ({
  recordBookingFromTransaction: (...args: unknown[]) => mockRecord(...args),
  fetchSuccessfulTransactions: (...args: unknown[]) => mockFetchTx(...args),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';
process.env.CRON_SECRET = 'test-cron-secret';
process.env.PAYSTACK_SECRET_KEY = 'sk_test_dummy';

import { createClient } from '@supabase/supabase-js';
import { logAuditEvent } from '@/lib/audit';
import { GET } from '@/app/api/cron/reconcile-payments/route';

// createClient runs once at module scope — capture that client's from()
let serviceFrom: jest.Mock;
beforeAll(() => {
  serviceFrom = (createClient as jest.Mock).mock.results[0].value.from as jest.Mock;
});

/** Stubs the existence lookup the dry-run path makes. */
function mockExistingBooking(existing: { id: string } | null) {
  serviceFrom.mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        maybeSingle: jest.fn().mockResolvedValue({ data: existing }),
      }),
    }),
  });
}

function makeRequest(authHeader?: string, query = '') {
  return new NextRequest(`http://localhost:3000/api/cron/reconcile-payments${query}`, {
    headers: authHeader ? { authorization: authHeader } : {},
  });
}

const TX = {
  reference: 'ref_missing',
  amount: 500000,
  status: 'success',
  customer: { email: 'ada@example.com' },
  metadata: { type: 'preclinicals', full_name: 'Ada Obi', phone: '08012345678' },
};

describe('GET /api/cron/reconcile-payments', () => {
  beforeEach(() => {
    mockRecord.mockReset();
    mockFetchTx.mockReset().mockResolvedValue([]);
    serviceFrom.mockReset();
    jest.mocked(logAuditEvent).mockClear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it('rejects a request without the cron secret', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    expect(mockFetchTx).not.toHaveBeenCalled();
  });

  it('rejects a request with the wrong cron secret', async () => {
    const res = await GET(makeRequest('Bearer nope'));
    expect(res.status).toBe(401);
  });

  it('reports nothing to do when every payment is already recorded', async () => {
    mockFetchTx.mockResolvedValue([TX]);
    mockRecord.mockResolvedValue({ outcome: 'already_recorded', reference: TX.reference });

    const res = await GET(makeRequest('Bearer test-cron-secret'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.recovered).toBe(0);
    expect(body.alreadyRecorded).toBe(1);
    expect(logAuditEvent).not.toHaveBeenCalled();
  });

  it('recovers a payment that was never recorded and audits it', async () => {
    mockFetchTx.mockResolvedValue([TX]);
    mockRecord.mockResolvedValue({ outcome: 'inserted', reference: TX.reference });

    const res = await GET(makeRequest('Bearer test-cron-secret'));
    const body = await res.json();

    expect(body.recovered).toBe(1);
    expect(body.recoveredReferences).toEqual(['ref_missing']);
    expect(logAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'booking.reconciled', targetLabel: 'ref_missing' })
    );
  });

  it('reports failures without aborting the remaining transactions', async () => {
    mockFetchTx.mockResolvedValue([TX, { ...TX, reference: 'ref_ok' }]);
    mockRecord
      .mockResolvedValueOnce({ outcome: 'insert_failed', reference: 'ref_missing', error: 'boom' })
      .mockResolvedValueOnce({ outcome: 'inserted', reference: 'ref_ok' });

    const body = await (await GET(makeRequest('Bearer test-cron-secret'))).json();

    expect(body.failed).toEqual([{ reference: 'ref_missing', error: 'boom' }]);
    expect(body.recovered).toBe(1);
    expect(body.recoveredReferences).toEqual(['ref_ok']);
  });

  it('clamps an oversized lookback window', async () => {
    await GET(makeRequest('Bearer test-cron-secret', '?days=9999'));

    const from = mockFetchTx.mock.calls[0][1] as Date;
    const daysAgo = (Date.now() - from.getTime()) / (24 * 60 * 60 * 1000);
    expect(daysAgo).toBeLessThanOrEqual(91);
    expect(daysAgo).toBeGreaterThan(89);
  });

  it('returns 502 when Paystack cannot be listed', async () => {
    mockFetchTx.mockRejectedValue(new Error('Paystack transaction list failed: 401'));

    const res = await GET(makeRequest('Bearer test-cron-secret'));
    expect(res.status).toBe(502);
    expect((await res.json()).error).toContain('401');
  });

  it('writes nothing in dry-run mode but still reports what it would recover', async () => {
    mockFetchTx.mockResolvedValue([TX]);
    mockExistingBooking(null); // no booking row for this reference

    const res = await GET(makeRequest('Bearer test-cron-secret', '?dryRun=1'));
    const body = await res.json();

    expect(body.dryRun).toBe(true);
    expect(body.recovered).toBe(1);
    expect(body.recoveredReferences).toEqual(['ref_missing']);
    expect(mockRecord).not.toHaveBeenCalled();
    expect(logAuditEvent).not.toHaveBeenCalled();
  });

  it('counts an already-recorded payment as such in dry-run mode', async () => {
    mockFetchTx.mockResolvedValue([TX]);
    mockExistingBooking({ id: 'booking-1' });

    const body = await (await GET(makeRequest('Bearer test-cron-secret', '?dryRun=1'))).json();

    expect(body.recovered).toBe(0);
    expect(body.alreadyRecorded).toBe(1);
  });
});

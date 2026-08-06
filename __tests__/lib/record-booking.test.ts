// jest.mock is hoisted above const declarations, so the fns are created inside
// the factory and read back through the mocked module.
jest.mock('@/lib/email', () => ({
  sendGroupBookingConfirmation: jest.fn().mockResolvedValue(undefined),
  sendPrivateBookingReceipt: jest.fn().mockResolvedValue(undefined),
  sendPreClinicalsReceipt: jest.fn().mockResolvedValue(undefined),
  sendNewBookingNotification: jest.fn().mockResolvedValue(undefined),
}));

import * as email from '@/lib/email';
import { recordBookingFromTransaction, fetchSuccessfulTransactions } from '@/lib/record-booking';

const mockEmails = email as unknown as Record<string, jest.Mock>;

const TUTORIAL = { title: 'Anatomy', date: '2026-09-01', time: '10:00', org_id: 'org-1' };

/** Minimal Supabase stand-in: one bookings lookup, one insert, one tutorials read. */
function makeSupabase(opts: {
  existingBooking?: { id: string } | null;
  insertError?: { message: string } | null;
  tutorial?: typeof TUTORIAL | null;
} = {}) {
  const insert = jest.fn().mockResolvedValue({ error: opts.insertError ?? null });
  const rpc = jest.fn().mockResolvedValue({});

  const supabase = {
    insert,
    rpc,
    from: jest.fn((table: string) => {
      if (table === 'bookings') {
        return {
          insert,
          select: () => ({
            eq: () => ({ maybeSingle: async () => ({ data: opts.existingBooking ?? null }) }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({ single: async () => ({ data: opts.tutorial ?? null }) }),
        }),
      };
    }),
  };
  return supabase as never as Parameters<typeof recordBookingFromTransaction>[0] & {
    insert: jest.Mock;
    rpc: jest.Mock;
  };
}

const PRECLINICALS_TX = {
  reference: 'ref_pre',
  amount: 6_000_000, // kobo
  status: 'success',
  customer: { email: 'ada@example.com', first_name: 'Ada', phone: '0800' },
  metadata: { type: 'preclinicals', full_name: 'Ada Obi', phone: '08103363907', course: 'Pre-Clinicals' },
};

describe('recordBookingFromTransaction', () => {
  beforeEach(() => {
    // The module namespace carries non-function keys (__esModule), so clear
    // only the jest mocks.
    Object.values(mockEmails).forEach((m) => {
      if (typeof m === 'function' && 'mockClear' in m) m.mockClear();
    });
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('inserts a booking and converts kobo to naira', async () => {
    const sb = makeSupabase();
    const result = await recordBookingFromTransaction(sb, PRECLINICALS_TX);

    expect(result.outcome).toBe('inserted');
    expect(sb.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_reference: 'ref_pre',
        amount_paid: 60000,
        payment_status: 'paid',
        full_name: 'Ada Obi',
        phone: '08103363907',
        tutorial_id: null,
      })
    );
  });

  // Idempotency is what makes the reconciler safe to re-run over a window that
  // overlaps bookings the callback and webhook already wrote.
  it('does not insert twice for a reference already recorded', async () => {
    const sb = makeSupabase({ existingBooking: { id: 'b1' } });
    const result = await recordBookingFromTransaction(sb, PRECLINICALS_TX);

    expect(result.outcome).toBe('already_recorded');
    expect(sb.insert).not.toHaveBeenCalled();
    expect(mockEmails.sendPreClinicalsReceipt).not.toHaveBeenCalled();
  });

  it('reports an insert failure instead of throwing', async () => {
    const sb = makeSupabase({ insertError: { message: 'duplicate key' } });
    const result = await recordBookingFromTransaction(sb, PRECLINICALS_TX);

    expect(result).toEqual({
      outcome: 'insert_failed',
      reference: 'ref_pre',
      error: 'duplicate key',
    });
    expect(mockEmails.sendPreClinicalsReceipt).not.toHaveBeenCalled();
  });

  it('sends the pre-clinicals receipt and the admin notification', async () => {
    await recordBookingFromTransaction(makeSupabase(), PRECLINICALS_TX);

    expect(mockEmails.sendPreClinicalsReceipt).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'ada@example.com', amountPaid: 60000 })
    );
    expect(mockEmails.sendNewBookingNotification).toHaveBeenCalledWith(
      expect.objectContaining({ bookingType: 'preclinicals' })
    );
  });

  it('sends the private receipt and never touches seat counts for a private booking', async () => {
    const sb = makeSupabase();
    await recordBookingFromTransaction(sb, {
      ...PRECLINICALS_TX,
      reference: 'ref_priv',
      metadata: { type: 'private', full_name: 'Ada Obi', tutorial_id: 'tut-1' },
    });

    expect(mockEmails.sendPrivateBookingReceipt).toHaveBeenCalled();
    // tutorial_id must be dropped for private bookings, and no seat is consumed.
    expect(sb.insert).toHaveBeenCalledWith(expect.objectContaining({ tutorial_id: null }));
    expect(sb.rpc).not.toHaveBeenCalled();
  });

  it('increments seats and inherits org from the tutorial for a group booking', async () => {
    const sb = makeSupabase({ tutorial: TUTORIAL });
    await recordBookingFromTransaction(sb, {
      ...PRECLINICALS_TX,
      reference: 'ref_grp',
      metadata: { full_name: 'Ada Obi', tutorial_id: 'tut-1' },
    });

    expect(sb.insert).toHaveBeenCalledWith(
      expect.objectContaining({ tutorial_id: 'tut-1', org_id: 'org-1' })
    );
    expect(sb.rpc).toHaveBeenCalledWith('increment_seats_booked', { tid: 'tut-1' });
    expect(mockEmails.sendGroupBookingConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ tutorialTitle: 'Anatomy' })
    );
  });

  it('falls back to the Paystack customer name when metadata carries none', async () => {
    const sb = makeSupabase();
    await recordBookingFromTransaction(sb, {
      ...PRECLINICALS_TX,
      reference: 'ref_noname',
      metadata: { type: 'preclinicals' },
    });

    expect(sb.insert).toHaveBeenCalledWith(expect.objectContaining({ full_name: 'Ada' }));
  });

  it('records the booking without emails when asked', async () => {
    const sb = makeSupabase();
    const result = await recordBookingFromTransaction(sb, PRECLINICALS_TX, { sendEmails: false });

    expect(result.outcome).toBe('inserted');
    expect(mockEmails.sendNewBookingNotification).not.toHaveBeenCalled();
  });
});

describe('fetchSuccessfulTransactions', () => {
  beforeEach(() => (global.fetch as jest.Mock).mockReset());

  it('requests only successful transactions since the given date', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ reference: 'a' }], meta: { pageCount: 1 } }),
    });

    const from = new Date('2026-08-01T00:00:00Z');
    const rows = await fetchSuccessfulTransactions('sk_test_x', from);

    expect(rows).toHaveLength(1);
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('status=success');
    expect(url).toContain(encodeURIComponent(from.toISOString()));
  });

  it('walks every page', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ reference: 'a' }], meta: { pageCount: 2 } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ reference: 'b' }], meta: { pageCount: 2 } }),
      });

    const rows = await fetchSuccessfulTransactions('sk_test_x', new Date());
    expect(rows.map((r) => r.reference)).toEqual(['a', 'b']);
  });

  // Must throw rather than return [] — an empty list would look like
  // "nothing to reconcile" and quietly skip real unrecorded payments.
  it('throws when Paystack rejects the request', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'Invalid key',
    });

    await expect(fetchSuccessfulTransactions('bad', new Date())).rejects.toThrow(/401/);
  });

  it('stops at the page cap so a bad window cannot loop forever', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ reference: 'x' }], meta: { pageCount: 9999 } }),
    });

    await fetchSuccessfulTransactions('sk_test_x', new Date(), 3);
    expect((global.fetch as jest.Mock).mock.calls).toHaveLength(3);
  });
});

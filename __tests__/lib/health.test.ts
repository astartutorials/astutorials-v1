const mockLogAuditEvent = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/audit', () => ({ logAuditEvent: (...a: unknown[]) => mockLogAuditEvent(...a) }));

import { collectHealthIssues, recordHeartbeat, MONITORED_JOBS } from '@/lib/health';

const NOW = new Date('2026-08-06T12:00:00Z');
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3600_000).toISOString();

/**
 * Stubs the two shapes collectHealthIssues queries: a heartbeat lookup per job
 * (keyed by target_label) and one booking.reconciled range query.
 */
function makeSupabase(heartbeats: Record<string, string | null>, reconciled: unknown[] = []) {
  return {
    from: jest.fn(() => {
      let action = '';
      let label = '';
      const chain: Record<string, unknown> = {
        select: () => chain,
        eq: (col: string, val: string) => {
          if (col === 'action') action = val;
          if (col === 'target_label') label = val;
          return chain;
        },
        order: () => chain,
        limit: () => chain,
        maybeSingle: async () => {
          const at = heartbeats[label];
          return { data: at ? { created_at: at } : null };
        },
        gte: async () => ({ data: action === 'booking.reconciled' ? reconciled : [] }),
      };
      return chain;
    }),
  } as never;
}

const allFresh = Object.fromEntries(Object.keys(MONITORED_JOBS).map((j) => [j, hoursAgo(1)]));

describe('recordHeartbeat', () => {
  beforeEach(() => mockLogAuditEvent.mockClear());

  it('writes a system.heartbeat audit entry tagged with the job name', async () => {
    await recordHeartbeat('reconcile-payments', { recovered: 2 });

    expect(mockLogAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'system.heartbeat',
        targetLabel: 'reconcile-payments',
        details: { recovered: 2 },
      })
    );
  });
});

describe('collectHealthIssues', () => {
  it('reports nothing when every job is fresh and no payment was rescued', async () => {
    const issues = await collectHealthIssues(makeSupabase(allFresh), NOW);
    expect(issues).toEqual([]);
  });

  it('flags a job that has never checked in as critical', async () => {
    const issues = await collectHealthIssues(
      makeSupabase({ ...allFresh, 'expire-tutorials': null }),
      NOW
    );

    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe('critical');
    expect(issues[0].title).toContain('has never run');
  });

  it('flags a job that has gone stale past its threshold', async () => {
    const issues = await collectHealthIssues(
      makeSupabase({ ...allFresh, 'reconcile-payments': hoursAgo(72) }),
      NOW
    );

    expect(issues).toHaveLength(1);
    expect(issues[0].title).toContain('has stopped running');
    expect(issues[0].detail).toContain('72h ago');
  });

  it('respects the webhook’s longer threshold', async () => {
    // 48h of webhook silence is normal on a low-volume site; 8 days is not.
    const quiet = await collectHealthIssues(
      makeSupabase({ ...allFresh, 'paystack-webhook': hoursAgo(48) }),
      NOW
    );
    expect(quiet).toEqual([]);

    const tooQuiet = await collectHealthIssues(
      makeSupabase({ ...allFresh, 'paystack-webhook': hoursAgo(24 * 8) }),
      NOW
    );
    expect(tooQuiet).toHaveLength(1);
    expect(tooQuiet[0].title).toContain('Paystack webhook');
  });

  it('warns about payments the reconciler had to rescue', async () => {
    const issues = await collectHealthIssues(
      makeSupabase(allFresh, [{ target_label: 'cqh9oknuid' }, { target_label: 'abc123' }]),
      NOW
    );

    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe('warning');
    expect(issues[0].title).toContain('2 payment(s)');
    expect(issues[0].detail).toContain('cqh9oknuid');
  });

  it('reports every problem at once rather than stopping at the first', async () => {
    const issues = await collectHealthIssues(
      makeSupabase({ ...allFresh, 'expire-tutorials': null, 'reconcile-payments': hoursAgo(99) }, [
        { target_label: 'ref1' },
      ]),
      NOW
    );

    expect(issues).toHaveLength(3);
    expect(issues.filter((i) => i.severity === 'critical')).toHaveLength(2);
  });
});

'use client';

import { useEffect, useState, useCallback } from 'react';
import { ClipboardList, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface AuditLog {
  id: string;
  actor_id: string;
  actor_email: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  target_label: string | null;
  org_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  organisations?: { name: string } | null;
}

const ACTION_STYLES: Record<string, string> = {
  'admin.login':         'bg-slate-100 text-slate-700',
  'user.registered':     'bg-blue-100 text-blue-700',
  'invite.sent':         'bg-purple-100 text-purple-700',
  'invite.accepted':     'bg-green-100 text-green-700',
  'invite.deleted':      'bg-red-100 text-red-700',
  'tutorial.created':    'bg-teal-100 text-teal-700',
  'tutorial.updated':    'bg-amber-100 text-amber-700',
  'tutorial.deleted':    'bg-red-100 text-red-700',
  'org.created':         'bg-teal-100 text-teal-700',
  'org.updated':         'bg-amber-100 text-amber-700',
  'org.deleted':         'bg-red-100 text-red-700',
  'member.role_changed': 'bg-orange-100 text-orange-700',
  'member.removed':      'bg-red-100 text-red-700',
};

const ACTION_LABELS: Record<string, string> = {
  'admin.login':         'Login',
  'user.registered':     'User registered',
  'invite.sent':         'Invite sent',
  'invite.accepted':     'Invite accepted',
  'invite.deleted':      'Invite deleted',
  'tutorial.created':    'Tutorial created',
  'tutorial.updated':    'Tutorial updated',
  'tutorial.deleted':    'Tutorial deleted',
  'org.created':         'Org created',
  'org.updated':         'Org updated',
  'org.deleted':         'Org deleted',
  'member.role_changed': 'Role changed',
  'member.removed':      'Member removed',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/audit-logs?page=${p}`);
      if (!res.ok) throw new Error('Failed to load audit logs');
      const json = await res.json();
      setLogs(json.logs);
      setPage(json.page);
      setPages(json.pages);
      setTotal(json.total);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList size={22} className="text-[#D93025]" />
            Activity Log
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {total.toLocaleString()} event{total !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <button
          onClick={() => fetchLogs(page)}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading…</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No events yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="pt-0.5 shrink-0 w-36">
                  <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${ACTION_STYLES[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                    {ACTION_LABELS[log.action] ?? log.action}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900 leading-snug">
                    <span className="font-semibold">
                      {(log.details?.name as string) ?? log.actor_email}
                    </span>
                    {(log.details?.name as string) && (
                      <span className="text-gray-400 text-xs ml-1.5">({log.actor_email})</span>
                    )}
                    {log.target_label && (
                      <> <span className="text-gray-400 mx-1">→</span> <span className="text-gray-700">{log.target_label}</span></>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5">
                    {log.organisations?.name && (
                      <span className="text-[11px] text-gray-400">{log.organisations.name}</span>
                    )}
                    {log.details && Object.keys(log.details).filter(k => k !== 'name').length > 0 && (
                      <span className="text-[11px] text-gray-400">
                        {Object.entries(log.details)
                          .filter(([k]) => !['name', 'updated_at'].includes(k))
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' · ')}
                      </span>
                    )}
                  </div>
                </div>
                <time className="shrink-0 text-xs text-gray-400 pt-0.5 whitespace-nowrap">
                  {formatDate(log.created_at)}
                </time>
              </div>
            ))}
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => fetchLogs(page - 1)}
              disabled={page <= 1 || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => fetchLogs(page + 1)}
              disabled={page >= pages || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

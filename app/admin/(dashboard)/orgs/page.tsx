'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, PlusCircle, MapPin, Users, GraduationCap, Loader2, X, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";

type Org = {
  id: string;
  name: string;
  type: 'university' | 'secondary' | 'primary';
  location: string | null;
  created_at: string;
};

const TYPE_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  university: { label: 'University', bg: 'bg-blue-50',   text: 'text-blue-700' },
  secondary:  { label: 'Secondary', bg: 'bg-purple-50', text: 'text-purple-700' },
  primary:    { label: 'Primary',   bg: 'bg-emerald-50', text: 'text-emerald-700' },
};

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D93025] focus:ring-2 focus:ring-red-500/10 outline-none transition-all text-gray-800 bg-white text-sm";
const selectClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D93025] focus:ring-2 focus:ring-red-500/10 outline-none transition-all text-gray-800 bg-white text-sm cursor-pointer";

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

export default function OrgsPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [form, setForm] = useState({ name: '', type: 'university', location: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => { fetchOrgs(); }, []);

  async function fetchOrgs() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orgs');
      const data = await res.json();
      setOrgs(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) { setFormError('Organisation name is required.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error ?? 'Failed to create organisation.'); return; }
      setOrgs(prev => [...prev, data]);
      setShowModal(false);
      setForm({ name: '', type: 'university', location: '' });
      showToast('Organisation created.', 'success');
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1120]">Organisations</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all institutions on the platform.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D93025] text-white font-semibold rounded-xl shadow-sm hover:bg-red-700 transition-all text-sm self-start"
        >
          <PlusCircle size={16} />
          New Organisation
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      ) : orgs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
          <Building2 size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No organisations yet.</p>
          <button onClick={() => setShowModal(true)} className="mt-4 text-sm text-[#D93025] font-semibold hover:underline">
            Create your first one →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgs.map(org => {
            const style = TYPE_STYLES[org.type] ?? TYPE_STYLES.university;
            return (
              <button
                key={org.id}
                onClick={() => router.push(`/admin/orgs/${org.id}`)}
                className="bg-white rounded-2xl border border-gray-100 p-6 text-left hover:border-gray-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.text}`}>
                    <Building2 size={10} />
                    {style.label}
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors mt-0.5" />
                </div>

                <h3 className="font-bold text-[#0B1120] text-base leading-tight mb-1">{org.name}</h3>

                {org.location && (
                  <p className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                    <MapPin size={11} />
                    {org.location}
                  </p>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Users size={12} />
                    <span>
                      {new Date(org.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                  <Building2 size={18} className="text-[#D93025]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">New Organisation</h3>
                  <p className="text-xs text-gray-500">Add a new institution to the platform</p>
                </div>
              </div>
              <button onClick={() => { setShowModal(false); setFormError(''); }} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Organisation Name</label>
                <input
                  type="text"
                  placeholder="e.g. University of Lagos"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className={inputClass}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className={selectClass}>
                  <option value="university">University</option>
                  <option value="secondary">Secondary School</option>
                  <option value="primary">Primary School</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Location <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g. Lagos, Nigeria"
                  value={form.location}
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  className={inputClass}
                />
              </div>
              {formError && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{formError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowModal(false); setFormError(''); }} className="flex-1 px-5 py-2.5 border border-gray-200 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D93025] text-white font-semibold rounded-xl shadow-sm hover:bg-red-700 transition-all text-sm disabled:opacity-60">
                  {saving ? <><Loader2 size={15} className="animate-spin" /> Creating…</> : 'Create Organisation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

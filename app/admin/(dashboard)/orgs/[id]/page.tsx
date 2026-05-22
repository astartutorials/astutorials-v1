'use client';

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Building2, MapPin, GraduationCap, Users, Pencil, Trash2,
  UserPlus, X, Loader2, CheckCircle2, AlertCircle, Save, ShieldCheck,
} from "lucide-react";

type OrgMember = {
  userId: string;
  role: string;
  name: string;
  email: string;
  joinedAt: string;
};

type OrgDetail = {
  id: string;
  name: string;
  type: 'university' | 'secondary' | 'primary';
  location: string | null;
  created_at: string;
};

const ROLE_LABELS: Record<string, string> = {
  org_admin: 'Org Admin',
  tutor_manager: 'Tutor Manager',
  tutor: 'Tutor',
  viewer: 'Viewer',
};

const ROLE_COLORS: Record<string, string> = {
  org_admin:     'bg-blue-50 text-blue-700',
  tutor_manager: 'bg-purple-50 text-purple-700',
  tutor:         'bg-emerald-50 text-emerald-700',
  viewer:        'bg-gray-100 text-gray-600',
};

const TYPE_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  university: { label: 'University', bg: 'bg-blue-50',    text: 'text-blue-700' },
  secondary:  { label: 'Secondary',  bg: 'bg-purple-50',  text: 'text-purple-700' },
  primary:    { label: 'Primary',    bg: 'bg-emerald-50', text: 'text-emerald-700' },
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

export default function OrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [org, setOrg] = useState<OrgDetail | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [tutorialCount, setTutorialCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Edit org state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', type: 'university', location: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Add user state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'tutor_manager' });
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState('');

  // Role change state
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [removingUser, setRemovingUser] = useState<string | null>(null);

  useEffect(() => { fetchDetail(); }, [id]);

  async function fetchDetail() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orgs/${id}`);
      const data = await res.json();
      if (!res.ok) { router.push('/admin/orgs'); return; }
      setOrg(data.org);
      setMembers(data.members ?? []);
      setTutorialCount(data.tutorialCount ?? 0);
      setEditForm({ name: data.org.name, type: data.org.type, location: data.org.location ?? '' });
    } finally {
      setLoading(false);
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    setEditError('');
    if (!editForm.name.trim()) { setEditError('Name is required.'); return; }
    setEditSaving(true);
    try {
      const res = await fetch(`/api/admin/orgs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) { setEditError(data.error ?? 'Failed to update.'); return; }
      setOrg(data);
      setShowEditModal(false);
      showToast('Organisation updated.', 'success');
    } finally {
      setEditSaving(false);
    }
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setAddError('');
    setAddSaving(true);
    try {
      const res = await fetch('/api/admin/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addForm, orgId: id }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error ?? 'Failed to add user.'); return; }
      setShowAddModal(false);
      setAddForm({ name: '', email: '', password: '', role: 'tutor_manager' });
      showToast('User added to organisation.', 'success');
      fetchDetail();
    } finally {
      setAddSaving(false);
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setChangingRole(userId);
    try {
      const res = await fetch(`/api/admin/orgs/${id}/members`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) { showToast('Failed to update role.', 'error'); return; }
      setMembers(prev => prev.map(m => m.userId === userId ? { ...m, role: newRole } : m));
      showToast('Role updated.', 'success');
    } finally {
      setChangingRole(null);
    }
  }

  async function handleRemoveMember(userId: string, name: string) {
    if (!confirm(`Remove ${name} from this organisation?`)) return;
    setRemovingUser(userId);
    try {
      const res = await fetch(`/api/admin/orgs/${id}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) { showToast('Failed to remove member.', 'error'); return; }
      setMembers(prev => prev.filter(m => m.userId !== userId));
      showToast(`${name} removed.`, 'success');
    } finally {
      setRemovingUser(null);
    }
  }

  async function handleDeleteOrg() {
    if (!confirm(`Delete "${org?.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/orgs/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { showToast(data.error, 'error'); return; }
    router.push('/admin/orgs');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (!org) return null;

  const style = TYPE_STYLES[org.type] ?? TYPE_STYLES.university;

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Back + header */}
      <button onClick={() => router.push('/admin/orgs')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-5">
        <ArrowLeft size={16} />
        Back to Organisations
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
              <Building2 size={22} className="text-gray-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-xl font-bold text-[#0B1120]">{org.name}</h1>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.text}`}>
                  {style.label}
                </span>
              </div>
              {org.location && (
                <p className="flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin size={13} />
                  {org.location}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setShowEditModal(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all">
              <Pencil size={14} />
              Edit
            </button>
            <button onClick={handleDeleteOrg} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-100 text-red-600 text-sm font-semibold hover:bg-red-50 transition-all">
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <Users size={15} className="text-gray-400" />
            <span className="font-bold text-[#0B1120]">{members.length}</span>
            <span className="text-gray-500">members</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap size={15} className="text-gray-400" />
            <span className="font-bold text-[#0B1120]">{tutorialCount}</span>
            <span className="text-gray-500">tutorials</span>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Members</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B1120] text-white text-sm font-semibold rounded-xl hover:bg-[#1a2740] transition-all"
          >
            <UserPlus size={14} />
            Add User
          </button>
        </div>

        {members.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            No members yet.
            <button onClick={() => setShowAddModal(true)} className="ml-1 text-[#D93025] font-semibold hover:underline">Add one →</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <div className="col-span-4">Name</div>
              <div className="col-span-4">Email</div>
              <div className="col-span-3">Role</div>
              <div className="col-span-1" />
            </div>
            {members.map(member => (
              <div key={member.userId} className="grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-gray-50/60 transition-colors">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#D93025]/10 text-[#D93025] flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-semibold text-sm text-[#0B1120] truncate">{member.name}</span>
                </div>
                <div className="col-span-4 text-sm text-gray-500 truncate">{member.email}</div>
                <div className="col-span-3">
                  {changingRole === member.userId ? (
                    <Loader2 size={14} className="animate-spin text-gray-400" />
                  ) : (
                    <select
                      value={member.role}
                      onChange={e => handleRoleChange(member.userId, e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:border-[#D93025] cursor-pointer"
                    >
                      <option value="org_admin">Org Admin</option>
                      <option value="tutor_manager">Tutor Manager</option>
                      <option value="tutor">Tutor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  )}
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => handleRemoveMember(member.userId, member.name)}
                    disabled={removingUser === member.userId}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                    title="Remove from org"
                  >
                    {removingUser === member.userId
                      ? <Loader2 size={14} className="animate-spin" />
                      : <X size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit org modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">Edit Organisation</h3>
              <button onClick={() => { setShowEditModal(false); setEditError(''); }} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className={inputClass} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Type</label>
                <select value={editForm.type} onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))} className={selectClass}>
                  <option value="university">University</option>
                  <option value="secondary">Secondary School</option>
                  <option value="primary">Primary School</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Location</label>
                <input type="text" value={editForm.location} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} className={inputClass} />
              </div>
              {editError && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{editError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowEditModal(false); setEditError(''); }} className="flex-1 px-5 py-2.5 border border-gray-200 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
                <button type="submit" disabled={editSaving} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D93025] text-white font-semibold rounded-xl text-sm disabled:opacity-60">
                  {editSaving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add user modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <UserPlus size={18} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Add User</h3>
                  <p className="text-xs text-gray-500">Create a new account in {org.name}</p>
                </div>
              </div>
              <button onClick={() => { setShowAddModal(false); setAddError(''); }} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Full Name</label>
                <input type="text" placeholder="Enter full name" value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} className={inputClass} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Email Address</label>
                <input type="email" placeholder="Enter email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} className={inputClass} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Password</label>
                <input type="password" placeholder="At least 8 characters" value={addForm.password} onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))} className={inputClass} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Role</label>
                <select value={addForm.role} onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))} className={selectClass}>
                  <option value="org_admin">Org Admin</option>
                  <option value="tutor_manager">Tutor Manager</option>
                  <option value="tutor">Tutor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              {addError && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{addError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowAddModal(false); setAddError(''); }} className="flex-1 px-5 py-2.5 border border-gray-200 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
                <button type="submit" disabled={addSaving} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D93025] text-white font-semibold rounded-xl text-sm disabled:opacity-60">
                  {addSaving ? <><Loader2 size={15} className="animate-spin" /> Adding…</> : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

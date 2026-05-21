'use client';

import { useState, useEffect } from "react";
import { Search, Plus, MoreVertical, Trash2, Loader2, Briefcase, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AddCareerRoleModal, { CareerFull } from "@/components/careers/admin/AddCareerRoleModal";

function statusPill(status: string) {
  if (status === "active") return "bg-emerald-50 text-emerald-700";
  if (status === "draft") return "bg-amber-50 text-amber-700";
  return "bg-gray-100 text-gray-500";
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function JobRow({
  job,
  onDelete,
  onEdit,
  onStatusChange,
}: {
  job: CareerFull;
  onDelete: (id: string) => void;
  onEdit: (job: CareerFull) => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  async function handleDelete() {
    setShowMenu(false);
    if (!confirm("Delete this role? This cannot be undone.")) return;
    setDeleting(true);
    await fetch(`/api/admin/careers/${job.id}`, { method: "DELETE" });
    onDelete(job.id);
  }

  async function handleToggleStatus() {
    setShowMenu(false);
    const newStatus = job.status === "active" ? "draft" : "active";
    setTogglingStatus(true);
    await fetch(`/api/admin/careers/${job.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    onStatusChange(job.id, newStatus);
    setTogglingStatus(false);
  }

  const busy = deleting || togglingStatus;

  return (
    <div className="grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-gray-50/60 transition-colors relative">
      <div className="col-span-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
          <Briefcase size={18} className="text-[#D93025]" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-[#0B1120] text-sm truncate">{job.title}</p>
          <p className="text-xs text-gray-400">{job.job_id ?? "—"}</p>
        </div>
      </div>

      <div className="col-span-2 text-sm text-gray-700 font-medium">{job.category}</div>
      <div className="col-span-2 text-sm text-gray-600">{job.location}</div>
      <div className="col-span-1 text-xs text-gray-500">{job.type}</div>
      <div className="col-span-1 text-xs text-gray-400">{formatDate(job.created_at)}</div>

      <div className="col-span-1">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusPill(job.status)}`}>
          {job.status}
        </span>
      </div>

      <div className="col-span-1 flex justify-end relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={busy}
          className={`p-2 rounded-full transition-colors ${showMenu ? "bg-gray-100 text-[#0B1120]" : "text-gray-400 hover:text-gray-600"}`}
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <MoreVertical size={16} />}
        </button>

        <AnimatePresence>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-20 overflow-hidden"
              >
                <button
                  onClick={() => { setShowMenu(false); onEdit(job); }}
                  className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <Edit size={15} />
                  Edit Role
                </button>
                <button
                  onClick={handleToggleStatus}
                  className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  {job.status === "active" ? <ToggleLeft size={15} /> : <ToggleRight size={15} />}
                  {job.status === "active" ? "Set as Draft" : "Set as Active"}
                </button>
                <div className="h-px bg-gray-100 my-1" />
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <Trash2 size={15} />
                  Delete Role
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function AdminCareersPage() {
  const [careers, setCareers] = useState<CareerFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<CareerFull | undefined>(undefined);

  useEffect(() => {
    fetchCareers();
  }, []);

  async function fetchCareers() {
    setLoading(true);
    const res = await fetch("/api/admin/careers");
    const data = await res.json();
    setCareers(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function handleDelete(id: string) {
    setCareers((prev) => prev.filter((c) => c.id !== id));
  }

  function handleStatusChange(id: string, status: string) {
    setCareers((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  }

  function handleEdit(job: CareerFull) {
    setEditingJob(job);
    setIsModalOpen(true);
  }

  function handleModalClose() {
    setIsModalOpen(false);
    setEditingJob(undefined);
  }

  function handleSaved() {
    handleModalClose();
    fetchCareers();
  }

  const filtered = careers.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.job_id ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1120]">Career Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage job openings and listings.</p>
        </div>
        <button
          onClick={() => { setEditingJob(undefined); setIsModalOpen(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D93025] text-white font-semibold rounded-xl shadow-sm hover:bg-red-700 transition-all text-sm self-start"
        >
          <Plus size={16} />
          Add Role
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search roles, departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D93025] focus:ring-2 focus:ring-red-500/10 outline-none transition-all text-[#0B1120] bg-white text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <div className="col-span-4">Role</div>
              <div className="col-span-2">Department</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-1">Posted</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Loading careers...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400">
                {careers.length === 0 ? "No career roles added yet." : "No roles match your search."}
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-sm text-gray-500">
          Showing <span className="font-bold text-[#0B1120]">{filtered.length}</span> of{" "}
          <span className="font-bold text-[#0B1120]">{careers.length}</span> roles
        </div>
      </div>

      <AddCareerRoleModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onCreated={handleSaved}
        editJob={editingJob}
      />
    </div>
  );
}

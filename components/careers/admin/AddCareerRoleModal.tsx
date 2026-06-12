"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Link as LinkIcon, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export type CareerFull = {
  id: string;
  job_id: string | null;
  title: string;
  category: string;
  type: string;
  location: string;
  status: string;
  created_at: string;
  description?: string | null;
  responsibilities?: string | null;
  requirements?: string | null;
  application_link?: string | null;
};

interface AddCareerRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
  editJob?: CareerFull;
}

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D93025] focus:ring-2 focus:ring-red-500/10 outline-none transition-all text-gray-800 bg-white text-sm";

const EMPTY_FORM = {
  roleTitle: "",
  department: "",
  jobType: "Full-time",
  location: "",
  description: "",
  responsibilities: "",
  requirements: "",
  applicationLink: "",
  status: "active",
};

export default function AddCareerRoleModal({
  isOpen,
  onClose,
  onCreated,
  editJob,
}: AddCareerRoleModalProps) {
  const isEditing = !!editJob;

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editJob) {
      setFormData({
        roleTitle: editJob.title,
        department: editJob.category,
        jobType: editJob.type,
        location: editJob.location,
        description: editJob.description ?? "",
        responsibilities: editJob.responsibilities ?? "",
        requirements: editJob.requirements ?? "",
        applicationLink: editJob.application_link ?? "",
        status: editJob.status,
      });
    } else {
      setFormData(EMPTY_FORM);
    }
    setError("");
  }, [editJob, isOpen]);

  const set = (key: string, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const url = isEditing
        ? `/api/admin/careers/${editJob!.id}`
        : "/api/admin/careers";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.message ?? "Failed to save role.");
        return;
      }
      setFormData(EMPTY_FORM);
      if (onCreated) { onCreated(); } else { onClose(); }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
            <div className="min-h-full flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ type: "spring", damping: 26, stiffness: 320 }}
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {isEditing ? "Edit Role" : "Add New Role"}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isEditing
                        ? "Update the details for this job listing."
                        : "Create a new job listing visible on the careers page."}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Role Title</label>
                      <input
                        type="text"
                        value={formData.roleTitle}
                        onChange={(e) => set("roleTitle", e.target.value)}
                        placeholder="e.g. Senior Product Designer"
                        className={inputClass}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Department</label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => set("department", e.target.value)}
                        placeholder="e.g. Product & Design"
                        className={inputClass}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Job Type</label>
                      <select
                        value={formData.jobType}
                        onChange={(e) => set("jobType", e.target.value)}
                        className={`${inputClass} appearance-none cursor-pointer`}
                        required
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => set("location", e.target.value)}
                        placeholder="e.g. Remote"
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => set("status", e.target.value)}
                      className={`${inputClass} appearance-none cursor-pointer`}
                    >
                      <option value="active">Active — visible on careers page</option>
                      <option value="draft">Draft — hidden from public</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">About Role</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => set("description", e.target.value)}
                      rows={3}
                      placeholder="Overview of the role and team..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Key Responsibilities</label>
                      <textarea
                        value={formData.responsibilities}
                        onChange={(e) => set("responsibilities", e.target.value)}
                        rows={5}
                        placeholder="List the main duties (one per line)..."
                        className={`${inputClass} resize-none`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Requirements</label>
                      <textarea
                        value={formData.requirements}
                        onChange={(e) => set("requirements", e.target.value)}
                        rows={5}
                        placeholder="Skills, experience, qualities..."
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">
                      Application Redirect Link
                      <span className="ml-2 text-[10px] font-bold text-[#D93025] bg-red-50 px-2 py-0.5 rounded uppercase tracking-wide">
                        Required
                      </span>
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input
                        type="url"
                        value={formData.applicationLink}
                        onChange={(e) => set("applicationLink", e.target.value)}
                        placeholder="https://forms.google.com/..."
                        className={`${inputClass} pl-10`}
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">{error}</p>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D93025] text-white font-semibold rounded-xl shadow-sm hover:bg-red-700 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <><Loader2 size={15} className="animate-spin" /> Saving...</>
                      ) : isEditing ? (
                        "Save Changes"
                      ) : (
                        "Publish Role"
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

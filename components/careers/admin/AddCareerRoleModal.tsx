"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Link as LinkIcon, FileText } from "lucide-react";
import { useState } from "react";

interface AddCareerRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddCareerRoleModal({ isOpen, onClose }: AddCareerRoleModalProps) {
    const [formData, setFormData] = useState({
        roleTitle: "",
        department: "",
        jobType: "Full-time",
        location: "",
        description: "",
        responsibilities: "",
        requirements: "",
        applicationLink: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission here
        console.log("Creating new role:", formData);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="min-h-full flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="bg-gradient-to-r from-[#2d4a7c] to-[#3d5a8c] text-white px-6 sm:px-8 py-6">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold">Add New Role</h2>
                                            </div>
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="text-white/80 hover:text-white transition-colors p-1"
                                            aria-label="Close modal"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Role Title */}
                                        <div>
                                            <label htmlFor="roleTitle" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Role Title
                                            </label>
                                            <input
                                                type="text"
                                                id="roleTitle"
                                                value={formData.roleTitle}
                                                onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                                                placeholder="e.g. Senior Product Designer"
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-700 placeholder:text-gray-400"
                                                required
                                            />
                                        </div>

                                        {/* Department */}
                                        <div>
                                            <label htmlFor="department" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Department
                                            </label>
                                            <input
                                                type="text"
                                                id="department"
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                placeholder="e.g. Product & Design"
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-700 placeholder:text-gray-400"
                                                required
                                            />
                                        </div>

                                        {/* Job Type */}
                                        <div>
                                            <label htmlFor="jobType" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Job Type
                                            </label>
                                            <select
                                                id="jobType"
                                                value={formData.jobType}
                                                onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-700 appearance-none bg-white cursor-pointer"
                                                required
                                            >
                                                <option value="Full-time">Full-time</option>
                                                <option value="Part-time">Part-time</option>
                                                <option value="Contract">Contract</option>
                                                <option value="Internship">Internship</option>
                                            </select>
                                        </div>

                                        {/* Location */}
                                        <div>
                                            <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Location
                                            </label>
                                            <input
                                                type="text"
                                                id="location"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                placeholder="e.g. Remote"
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-700 placeholder:text-gray-400"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="mt-6">
                                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                                           About Role
                                        </label>
                                        <textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={4}
                                            placeholder="Overview of the role and team..."
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-700 placeholder:text-gray-400 resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                        {/* Key Responsibilities */}
                                        <div>
                                            <label htmlFor="responsibilities" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Key Responsibilities
                                            </label>
                                            <textarea
                                                id="responsibilities"
                                                value={formData.responsibilities}
                                                onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                                                rows={6}
                                                placeholder="List the main duties (one per line)..."
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-700 placeholder:text-gray-400 resize-none"
                                            />
                                        </div>

                                        {/* Requirements */}
                                        <div>
                                            <label htmlFor="requirements" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Requirements
                                            </label>
                                            <textarea
                                                id="requirements"
                                                value={formData.requirements}
                                                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                                rows={6}
                                                placeholder="Skills, experience, qualities..."
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-700 placeholder:text-gray-400 resize-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Application Redirect Link */}
                                    <div className="mt-6">
                                        <label htmlFor="applicationLink" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Application Redirect Link
                                            <span className="ml-2 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">Required</span>
                                        </label>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="url"
                                                id="applicationLink"
                                                value={formData.applicationLink}
                                                onChange={(e) => setFormData({ ...formData, applicationLink: e.target.value })}
                                                placeholder="https://forms.google.com/..."
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-700 placeholder:text-gray-400"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Footer Buttons */}
                                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="w-full sm:w-auto px-6 py-2.5 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="w-full sm:w-auto px-6 py-2.5 bg-[var(--astar-red)] text-white font-semibold hover:bg-[#c8102e] rounded-lg transition-colors"
                                        >
                                            Publish Role
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

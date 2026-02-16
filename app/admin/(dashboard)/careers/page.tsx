'use client';

import { useState } from "react";
import { Search, Plus, Bell, Code, Palette, Megaphone, Headphones, BarChart3, MoreVertical } from "lucide-react";
import AddCareerRoleModal from "@/components/admin/AddCareerRoleModal";

const jobRoles = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    jobId: "#DEV-204",
    department: "Engineering",
    location: "Remote (US)",
    postedDate: "Oct 24, 2023",
    status: "Active",
    statusColor: "bg-green-100 text-green-700",
    icon: Code,
    iconColor: "bg-blue-100 text-blue-600"
  },
  {
    id: 2,
    title: "Product Designer",
    jobId: "#DES-101",
    department: "Product",
    location: "New York, NY",
    postedDate: "Oct 22, 2023",
    status: "Active",
    statusColor: "bg-green-100 text-green-700",
    icon: Palette,
    iconColor: "bg-purple-100 text-purple-600"
  },
  {
    id: 3,
    title: "Marketing Intern",
    jobId: "#MKT-003",
    department: "Marketing",
    location: "London, UK",
    postedDate: "-",
    status: "Draft",
    statusColor: "bg-gray-100 text-gray-700",
    icon: Megaphone,
    iconColor: "bg-orange-100 text-orange-600"
  },
  {
    id: 4,
    title: "Customer Success Manager",
    jobId: "#CS-301",
    department: "Customer Support",
    location: "Remote (EU)",
    postedDate: "Oct 15, 2023",
    status: "Active",
    statusColor: "bg-green-100 text-green-700",
    icon: Headphones,
    iconColor: "bg-teal-100 text-teal-600"
  },
  {
    id: 5,
    title: "Data Scientist",
    jobId: "#DS-552",
    department: "Analytics",
    location: "San Francisco, CA",
    postedDate: "Oct 10, 2023",
    status: "Active",
    statusColor: "bg-green-100 text-green-700",
    icon: BarChart3,
    iconColor: "bg-indigo-100 text-indigo-600"
  }
];

export default function AdminCareersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter jobs based on search
  const filteredJobs = jobRoles.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.jobId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Career Management</h1>
          <p className="text-gray-500 text-sm md:text-base">Manage job openings, review applications, and update listings.</p>
        </div>
        <div className="flex items-center gap-4 self-end md:self-auto">
          <button className="p-2 text-gray-400 hover:text-gray-600 relative">
            <Bell size={24} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="w-10 h-10 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-sm">
            AD
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-8">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search roles, departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-700"
          />
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--astar-red)] text-white font-bold shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all w-full md:w-auto"
        >
          <Plus size={20} />
          Add New Role
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <div className="col-span-3">Role Title</div>
              <div className="col-span-2">Department</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-2">Posted Date</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-50">
              {filteredJobs.map((job) => (
                <div key={job.id} className="grid grid-cols-12 gap-4 px-8 py-5 items-center hover:bg-gray-50/50 transition-colors group">
                  {/* Role Title */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${job.iconColor} flex-shrink-0`}>
                      <job.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{job.title}</h4>
                      <p className="text-xs text-gray-500">ID: {job.jobId}</p>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="col-span-2 text-sm text-gray-700 font-medium">
                    {job.department}
                  </div>

                  {/* Location */}
                  <div className="col-span-2 text-sm text-gray-600">
                    {job.location}
                  </div>

                  {/* Posted Date */}
                  <div className="col-span-2 text-sm text-gray-600">
                    {job.postedDate}
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${job.statusColor}`}>
                      {job.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-end">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
          <span>Showing <span className="font-bold text-gray-900">1</span> to <span className="font-bold text-gray-900">5</span> of <span className="font-bold text-gray-900">12</span> results</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-bold text-gray-600 disabled:opacity-50 transition-colors">Previous</button>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-bold text-gray-600 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AddCareerRoleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

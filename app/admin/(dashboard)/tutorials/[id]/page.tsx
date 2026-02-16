'use client';

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search, Download, ChevronLeft } from "lucide-react";

// Mock data - replace with actual API call
const mockStudents = [
  {
    id: 1,
    name: "John Smith",
    initials: "JS",
    initialsColor: "bg-blue-100 text-blue-600",
    phone: "+1 (555) 123-4567",
    paymentStatus: "Paid",
    paymentColor: "bg-green-100 text-green-700",
    registrationDate: "Oct 20, 2023",
    attended: false
  },
  {
    id: 2,
    name: "Emma Johnson",
    initials: "EJ",
    initialsColor: "bg-purple-100 text-purple-600",
    phone: "+1 (555) 987-6543",
    paymentStatus: "Paid",
    paymentColor: "bg-green-100 text-green-700",
    registrationDate: "Oct 21, 2023",
    attended: true
  },
  {
    id: 3,
    name: "Michael Williams",
    initials: "MW",
    initialsColor: "bg-pink-100 text-pink-600",
    phone: "+1 (555) 456-7890",
    paymentStatus: "Pending",
    paymentColor: "bg-yellow-100 text-yellow-700",
    registrationDate: "Oct 22, 2023",
    attended: false
  },
  {
    id: 4,
    name: "Sarah Brown",
    initials: "SB",
    initialsColor: "bg-indigo-100 text-indigo-600",
    phone: "+1 (555) 234-5678",
    paymentStatus: "Paid",
    paymentColor: "bg-green-100 text-green-700",
    registrationDate: "Oct 22, 2023",
    attended: true
  },
  {
    id: 5,
    name: "David Jones",
    initials: "DJ",
    initialsColor: "bg-teal-100 text-teal-600",
    phone: "+1 (555) 876-5432",
    paymentStatus: "Paid",
    paymentColor: "bg-green-100 text-green-700",
    registrationDate: "Oct 23, 2023",
    attended: false
  }
];

const tutorialData = {
  id: 1,
  code: "MAT101",
  title: "Calculus Review",
  date: "Friday, Oct 24th",
  time: "2:00 PM - 4:00 PM",
  booked: 24,
  capacity: 30
};

export default function TutorialAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState(mockStudents);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 5;

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.phone.includes(searchQuery)
  );

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);
  const totalStudents = filteredStudents.length;

  // Toggle attendance
  const toggleAttendance = (studentId: number) => {
    setStudents(students.map(s => 
      s.id === studentId ? { ...s, attended: !s.attended } : s
    ));
  };

  // Export function
  const handleExport = () => {
    // Implement export logic here
    console.log("Exporting attendance data...");
  };

  return (
    <div>
      {/* Breadcrumb & Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <button 
            onClick={() => router.push('/admin/tutorials')}
            className="hover:text-gray-700 transition-colors flex items-center gap-1"
          >
            <ChevronLeft size={16} />
            Tutorials
          </button>
          <span>/</span>
          <span className="text-gray-700 font-medium">Attendance</span>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {tutorialData.code} - {tutorialData.title}
            </h1>
            <p className="text-gray-500 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {tutorialData.date} • {tutorialData.time}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-[var(--astar-red)] text-white font-semibold rounded-lg hover:bg-[#c8102e] transition-colors"
            >
              <Download size={16} />
              Export for Tutor
            </button>
            <div className="w-10 h-10 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-sm">
              AD
            </div>
          </div>
        </div>
      </div>

      {/* Student Attendance Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Card Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">Student Attendance List</h2>
            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
              {tutorialData.booked}/{tutorialData.capacity} Booked
            </span>
          </div>
          
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none transition-all text-sm placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 sm:px-8 py-3 bg-gray-50 border-b border-gray-100">
              <div className="col-span-1 flex items-center">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
              </div>
              <div className="col-span-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</div>
              <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</div>
              <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Status</div>
              <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Registration Date</div>
              <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Attended</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {currentStudents.map((student) => (
                <div key={student.id} className="grid grid-cols-12 gap-4 px-6 sm:px-8 py-4 items-center hover:bg-gray-50/50 transition-colors">
                  {/* Checkbox */}
                  <div className="col-span-1">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                  </div>

                  {/* Student Name */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${student.initialsColor}`}>
                      {student.initials}
                    </div>
                    <span className="font-medium text-gray-900 text-sm">{student.name}</span>
                  </div>

                  {/* Phone */}
                  <div className="col-span-2 text-sm text-gray-600">
                    {student.phone}
                  </div>

                  {/* Payment Status */}
                  <div className="col-span-2">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${student.paymentColor}`}>
                      {student.paymentStatus}
                    </span>
                  </div>

                  {/* Registration Date */}
                  <div className="col-span-2 text-sm text-gray-600">
                    {student.registrationDate}
                  </div>

                  {/* Attendance Toggle */}
                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => toggleAttendance(student.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        student.attended ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          student.attended ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 sm:px-8 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-600">
          <span>
            Showing <span className="font-bold text-gray-900">{startIndex + 1}</span> to{' '}
            <span className="font-bold text-gray-900">{Math.min(endIndex, totalStudents)}</span> of{' '}
            <span className="font-bold text-gray-900">{totalStudents}</span> results
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

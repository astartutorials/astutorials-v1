'use client';

import { Bell, TrendingUp, Users, GraduationCap, DollarSign, Star, Calendar, MessageSquare, Briefcase } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  // Mock data - replace with actual API calls
  const stats = {
    totalRevenue: 450000,
    revenueGrowth: 12.5,
    totalStudents: 156,
    studentGrowth: 8.2,
    activeTutorials: 24,
    upcomingTutorials: 8,
    avgRating: 4.8,
    pendingPayments: 3
  };

  const upcomingTutorials = [
    { id: 1, code: "CALC-101", title: "Advanced Calculus", date: "Oct 25", time: "2:00 PM", students: 28 },
    { id: 2, code: "LAW-202", title: "Legal Studies 101", date: "Oct 25", time: "4:30 PM", students: 15 },
    { id: 3, code: "BUS-303", title: "Corporate Strategy", date: "Oct 26", time: "10:00 AM", students: 22 },
  ];

  const recentFeedback = [
    { student: "Sarah Jenkins", tutorial: "Advanced Calculus", rating: 5, time: "2 hours ago" },
    { student: "Michael Ross", tutorial: "Legal Studies", rating: 4, time: "Yesterday" },
    { student: "Jessica Pearson", tutorial: "Corporate Strategy", rating: 5, time: "2 days ago" },
  ];

  const quickActions = [
    { name: "Create Tutorial", href: "/admin/create-tutorial", icon: GraduationCap, color: "bg-blue-100 text-blue-600" },
    { name: "Add Career Role", href: "/admin/careers", icon: Briefcase, color: "bg-purple-100 text-purple-600" },
    { name: "View Payments", href: "/admin/payments", icon: DollarSign, color: "bg-green-100 text-green-600" },
    { name: "Manage Settings", href: "/admin/settings", icon: Bell, color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-gray-500 text-sm md:text-base">Welcome back! Here's what's happening today.</p>
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

      {/* Key Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8c] rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">+{stats.revenueGrowth}%</span>
          </div>
          <h3 className="text-3xl font-bold mb-1">₦{stats.totalRevenue.toLocaleString()}</h3>
          <p className="text-white/80 text-sm">Total Revenue</p>
        </div>

        {/* Total Students */}
        <div className="bg-gradient-to-br from-[#475569] to-[#64748b] rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">+{stats.studentGrowth}%</span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.totalStudents}</h3>
          <p className="text-white/80 text-sm">Total Students</p>
        </div>

        {/* Active Tutorials */}
        <div className="bg-gradient-to-br from-[#4f46e5] to-[#6366f1] rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <GraduationCap size={24} />
            </div>
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">{stats.upcomingTutorials} upcoming</span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.activeTutorials}</h3>
          <p className="text-white/80 text-sm">Active Tutorials</p>
        </div>

        {/* Average Rating */}
        <div className="bg-gradient-to-br from-[#059669] to-[#10b981] rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Star size={24} />
            </div>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={12} className="fill-white" />
              ))}
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.avgRating.toFixed(1)}</h3>
          <p className="text-white/80 text-sm">Average Rating</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.color} mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{action.name}</h3>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tutorials */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={20} className="text-[var(--astar-red)]" />
              Upcoming Tutorials
            </h2>
            <Link href="/admin/tutorials" className="text-sm font-semibold text-[var(--astar-red)] hover:underline">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingTutorials.map((tutorial) => (
              <div key={tutorial.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-400">{tutorial.code}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="text-xs text-gray-500">{tutorial.students} students</span>
                    </div>
                    <h3 className="font-bold text-gray-900">{tutorial.title}</h3>
                  </div>
                  <span className="text-xs font-semibold text-[var(--astar-red)] bg-red-50 px-2 py-1 rounded-full">
                    {tutorial.date}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{tutorial.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare size={20} className="text-[var(--astar-red)]" />
              Recent Feedback
            </h2>
            <Link href="/admin/feedback" className="text-sm font-semibold text-[var(--astar-red)] hover:underline">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentFeedback.map((feedback, index) => (
              <div key={index} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{feedback.student}</h3>
                    <p className="text-sm text-gray-600">{feedback.tutorial}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < feedback.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-400">{feedback.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

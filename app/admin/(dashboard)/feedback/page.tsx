'use client';

import { useState } from "react";
import { Search, Bell, Star } from "lucide-react";

const feedbackData = [
  {
    id: 1,
    studentName: "Sarah Jenkins",
    studentInitials: "SJ",
    initialsColor: "bg-blue-100 text-blue-600",
    tutorialName: "Advanced Calculus Review",
    sessionType: "Group",
    rating: 5.0,
    feedback: "The session was incredibly helpful. The breakdown of complex limit problems really clicked for me this time. I wish we had spent a bit more time on integration techniques, but overall excellent value.",
    timestamp: "2 hours ago",
    replied: false
  },
  {
    id: 2,
    studentName: "Michael Ross",
    studentInitials: "MR",
    initialsColor: "bg-green-100 text-green-600",
    tutorialName: "Legal Studies 101: Contracts",
    sessionType: "Group",
    rating: 4.0,
    feedback: "Great content and the tutor clearly knows their stuff. However, the pacing was a bit fast for a group of 20 people. Some questions were skipped over to save time.",
    timestamp: "Yesterday",
    replied: false
  },
  {
    id: 3,
    studentName: "Jessica Pearson",
    studentInitials: "JP",
    initialsColor: "bg-yellow-100 text-yellow-600",
    tutorialName: "Corporate Strategy",
    sessionType: "Group",
    rating: 5.0,
    feedback: "Impeccable delivery. The case studies selected were highly relevant. No complaints.",
    timestamp: "2 days ago",
    replied: false
  }
];

export default function AdminFeedbackPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"group" | "private">("group");

  // Filter feedback based on search
  const filteredFeedback = feedbackData.filter(item =>
    item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tutorialName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} size={16} className="fill-red-500 text-red-500" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={16} className="fill-red-500 text-red-500 opacity-50" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} className="text-gray-300" />);
    }

    return stars;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Session Feedback</h1>
          <p className="text-gray-500 text-sm md:text-base">Manage and view student reviews for tutorials.</p>
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

      {/* Search and Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by student or tutorial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-700"
          />
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => setActiveTab("group")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              activeTab === "group"
                ? "bg-white text-[var(--astar-red)] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Group Sessions
          </button>
          <button
            onClick={() => setActiveTab("private")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              activeTab === "private"
                ? "bg-white text-[var(--astar-red)] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Private Sessions
          </button>
        </div>
      </div>

      {/* Feedback Cards */}
      <div className="space-y-4">
        {filteredFeedback.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${item.initialsColor}`}>
                  {item.studentInitials}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{item.studentName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-gray-600">{item.tutorialName}</p>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                      {item.sessionType}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-400">{item.timestamp}</span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-0.5">
                {renderStars(item.rating)}
              </div>
              <span className="text-sm font-bold text-gray-900">{item.rating.toFixed(1)}</span>
            </div>

            {/* Feedback Text */}
            <p className="text-gray-700 leading-relaxed mb-4">
              "{item.feedback}"
            </p>

            {/* Reply Button */}
            <div className="flex justify-end">
              <button className="text-sm font-semibold text-[var(--astar-navy)] hover:text-[var(--astar-red)] transition-colors flex items-center gap-1">
                Reply to {item.studentName.split(' ')[0]} →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (when no results) */}
      {filteredFeedback.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">No feedback found matching your search.</p>
        </div>
      )}
    </div>
  );
}

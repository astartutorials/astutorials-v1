'use client';

import { useState } from "react";
import { Search, Bell, Download, TrendingUp, Clock, XCircle, CheckCircle, CreditCard, Smartphone } from "lucide-react";

const transactions = [
  {
    id: 1,
    studentName: "Sarah Jenkins",
    studentInitials: "SJ",
    initialsColor: "bg-blue-100 text-blue-600",
    tutorial: "Advanced Calculus Review",
    amount: 15000,
    method: "Card",
    methodIcon: CreditCard,
    status: "Paid",
    statusColor: "bg-green-100 text-green-700",
    date: "Oct 24, 2023",
    time: "2:30 PM"
  },
  {
    id: 2,
    studentName: "Michael Ross",
    studentInitials: "MR",
    initialsColor: "bg-green-100 text-green-600",
    tutorial: "Legal Studies 101",
    amount: 15000,
    method: "PayPal",
    methodIcon: Smartphone,
    status: "Paid",
    statusColor: "bg-green-100 text-green-700",
    date: "Oct 23, 2023",
    time: "11:15 AM"
  },
  {
    id: 3,
    studentName: "Jessica Pearson",
    studentInitials: "JP",
    initialsColor: "bg-yellow-100 text-yellow-600",
    tutorial: "Corporate Strategy",
    amount: 15000,
    method: "Card",
    methodIcon: CreditCard,
    status: "Pending",
    statusColor: "bg-yellow-100 text-yellow-700",
    date: "Oct 22, 2023",
    time: "9:00 AM"
  },
  {
    id: 4,
    studentName: "David Chen",
    studentInitials: "DC",
    initialsColor: "bg-purple-100 text-purple-600",
    tutorial: "Data Structures",
    amount: 15000,
    method: "Transfer",
    methodIcon: CreditCard,
    status: "Failed",
    statusColor: "bg-red-100 text-red-700",
    date: "Oct 21, 2023",
    time: "4:45 PM"
  },
  {
    id: 5,
    studentName: "Emily Watson",
    studentInitials: "EW",
    initialsColor: "bg-pink-100 text-pink-600",
    tutorial: "Marketing Fundamentals",
    amount: 15000,
    method: "Card",
    methodIcon: CreditCard,
    status: "Paid",
    statusColor: "bg-green-100 text-green-700",
    date: "Oct 20, 2023",
    time: "1:20 PM"
  }
];

export default function AdminPaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "failed">("all");

  // Calculate statistics
  const stats = {
    totalRevenue: transactions.filter(t => t.status === "Paid").reduce((sum, t) => sum + t.amount, 0),
    pendingPayments: transactions.filter(t => t.status === "Pending").length,
    completedTransactions: transactions.filter(t => t.status === "Paid").length,
    failedPayments: transactions.filter(t => t.status === "Failed").length
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.tutorial.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || transaction.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Payments Overview</h1>
          <p className="text-gray-500 text-sm md:text-base">Track tutorial payments and manage transactions.</p>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12.5%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(stats.totalRevenue)}</h3>
          <p className="text-sm text-gray-500">Total Revenue</p>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.pendingPayments}</h3>
          <p className="text-sm text-gray-500">Pending Payments</p>
        </div>

        {/* Completed Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-blue-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.completedTransactions}</h3>
          <p className="text-sm text-gray-500">Completed</p>
        </div>

        {/* Failed Payments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.failedPayments}</h3>
          <p className="text-sm text-gray-500">Failed</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search student or tutorial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-700"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-blue-500 outline-none transition-all text-gray-700 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--astar-red)] text-white font-bold shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all">
          <Download size={20} />
          Export
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <div className="col-span-3">Student</div>
              <div className="col-span-3">Tutorial</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-1">Method</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1">Status</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-50">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="grid grid-cols-12 gap-4 px-8 py-5 items-center hover:bg-gray-50/50 transition-colors">
                  {/* Student */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${transaction.initialsColor}`}>
                      {transaction.studentInitials}
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">{transaction.studentName}</span>
                  </div>

                  {/* Tutorial */}
                  <div className="col-span-3 text-sm text-gray-700">
                    {transaction.tutorial}
                  </div>

                  {/* Amount */}
                  <div className="col-span-2 text-sm font-bold text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </div>

                  {/* Method */}
                  <div className="col-span-1">
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <transaction.methodIcon size={14} />
                      {transaction.method}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 text-sm text-gray-600">
                    <div>{transaction.date}</div>
                    <div className="text-xs text-gray-400">{transaction.time}</div>
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${transaction.statusColor}`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
          <span>Showing <span className="font-bold text-gray-900">1</span> to <span className="font-bold text-gray-900">5</span> of <span className="font-bold text-gray-900">24</span> transactions</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-bold text-gray-600 disabled:opacity-50 transition-colors">Previous</button>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-bold text-gray-600 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

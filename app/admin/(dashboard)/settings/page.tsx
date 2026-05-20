'use client';

import { useState } from "react";
import {
  User,
  GraduationCap,
  BellRing,
  CreditCard,
  Shield,
  Save,
  Activity,
  Lock,
  UserPlus,
  X,
} from "lucide-react";

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D93025] focus:ring-2 focus:ring-red-500/10 outline-none transition-all text-gray-800 bg-white text-sm";

const selectClass =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D93025] focus:ring-2 focus:ring-red-500/10 outline-none transition-all text-gray-800 bg-white text-sm cursor-pointer";

type TabId = "profile" | "tutorials" | "notifications" | "payments" | "security";

const tabs: { id: TabId; name: string; icon: typeof User }[] = [
  { id: "profile", name: "Profile", icon: User },
  { id: "tutorials", name: "Tutorials", icon: GraduationCap },
  { id: "notifications", name: "Notifications", icon: BellRing },
  { id: "payments", name: "Payments", icon: CreditCard },
  { id: "security", name: "Security", icon: Shield },
];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
        checked ? "bg-[#0B1120]" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

const activityLogs = [
  { user: "Admin User", action: "Login", ip: "192.168.1.1", time: "2 hours ago", status: "success" },
  { user: "Admin User", action: "Updated Tutorial", ip: "192.168.1.1", time: "3 hours ago", status: "success" },
  { user: "Admin User", action: "Created Career Role", ip: "192.168.1.1", time: "5 hours ago", status: "success" },
  { user: "Super Admin", action: "Login Attempt", ip: "10.0.0.25", time: "Yesterday", status: "failed" },
  { user: "Admin User", action: "Changed Settings", ip: "192.168.1.1", time: "2 days ago", status: "success" },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const [formData, setFormData] = useState({
    adminName: "Admin User",
    email: "admin@astar-tutorials.com",
    phone: "+234 123 456 7890",
    groupPrice: "15000",
    privatePrice: "25000",
    sessionDuration: "120",
    maxStudents: "30",
    bookingDeadline: "24",
    emailNotifications: true,
    smsNotifications: false,
    newBookings: true,
    cancellations: true,
    feedbackAlerts: true,
    digestFrequency: "real-time",
    paymentGateway: "flutterwave",
    currency: "NGN",
    taxRate: "0",
  });

  const set = (key: string, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => console.log("Saving settings:", formData);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage your admin preferences and system configuration.
        </p>
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-1.5 mb-6 flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-[#0B1120] text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <tab.icon size={16} />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Settings panel */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
        {/* Profile */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-0.5">Profile Settings</h2>
              <p className="text-sm text-gray-500">Update your admin profile information.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={formData.adminName}
                  onChange={(e) => set("adminName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Password</label>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all text-left text-sm text-gray-600 bg-white"
                >
                  Change Password →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tutorials */}
        {activeTab === "tutorials" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-0.5">Tutorial Settings</h2>
              <p className="text-sm text-gray-500">Configure default tutorial pricing and parameters.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Group Tutorial Price (₦)</label>
                <input
                  type="number"
                  value={formData.groupPrice}
                  onChange={(e) => set("groupPrice", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Private Tutorial Price (₦)</label>
                <input
                  type="number"
                  value={formData.privatePrice}
                  onChange={(e) => set("privatePrice", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Default Session Duration</label>
                <select
                  value={formData.sessionDuration}
                  onChange={(e) => set("sessionDuration", e.target.value)}
                  className={selectClass}
                >
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                  <option value="180">180 minutes</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Max Students per Group</label>
                <input
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => set("maxStudents", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Booking Deadline (hours before)</label>
                <input
                  type="number"
                  value={formData.bookingDeadline}
                  onChange={(e) => set("bookingDeadline", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-0.5">Notification Preferences</h2>
              <p className="text-sm text-gray-500">Manage how you receive notifications.</p>
            </div>

            <div className="space-y-3">
              {[
                {
                  key: "emailNotifications",
                  title: "Email Notifications",
                  desc: "Receive notifications via email",
                  val: formData.emailNotifications,
                },
                {
                  key: "smsNotifications",
                  title: "SMS Notifications",
                  desc: "Receive notifications via SMS",
                  val: formData.smsNotifications,
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                  <Toggle
                    checked={item.val}
                    onChange={(v) => set(item.key, v)}
                  />
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Alert Types</h3>
              <div className="space-y-2.5">
                {[
                  { key: "newBookings", label: "New bookings", val: formData.newBookings },
                  { key: "cancellations", label: "Cancellations", val: formData.cancellations },
                  { key: "feedbackAlerts", label: "Student feedback", val: formData.feedbackAlerts },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.val}
                      onChange={(e) => set(item.key, e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 accent-[#D93025]"
                    />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Digest Frequency</label>
              <select
                value={formData.digestFrequency}
                onChange={(e) => set("digestFrequency", e.target.value)}
                className={selectClass}
              >
                <option value="real-time">Real-time</option>
                <option value="daily">Daily digest</option>
                <option value="weekly">Weekly digest</option>
              </select>
            </div>
          </div>
        )}

        {/* Payments */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-0.5">Payment Configuration</h2>
              <p className="text-sm text-gray-500">Configure payment gateway and preferences.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Payment Gateway</label>
                <select
                  value={formData.paymentGateway}
                  onChange={(e) => set("paymentGateway", e.target.value)}
                  className={selectClass}
                >
                  <option value="flutterwave">Flutterwave</option>
                  <option value="paystack">Paystack</option>
                  <option value="stripe">Stripe</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => set("currency", e.target.value)}
                  className={selectClass}
                >
                  <option value="NGN">Nigerian Naira (₦)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Tax / VAT Rate (%)</label>
                <input
                  type="number"
                  value={formData.taxRate}
                  onChange={(e) => set("taxRate", e.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">API Key</label>
                <input
                  type="password"
                  value="••••••••••••••••"
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-0.5">
                Security &amp; Admin Management
              </h2>
              <p className="text-sm text-gray-500">
                Manage admin users, passwords, and view activity logs.
              </p>
            </div>

            {/* Action cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl hover:shadow-md transition-all group text-left"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform flex-shrink-0">
                  <Lock size={18} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Change Password</p>
                  <p className="text-xs text-gray-500 mt-0.5">Update your admin password</p>
                </div>
              </button>

              <button
                onClick={() => setShowRegisterModal(true)}
                className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl hover:shadow-md transition-all group text-left"
              >
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform flex-shrink-0">
                  <UserPlus size={18} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Register New Admin</p>
                  <p className="text-xs text-gray-500 mt-0.5">Add a new admin user</p>
                </div>
              </button>
            </div>

            {/* Activity log */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Activity size={18} className="text-[#D93025]" />
                <h3 className="font-bold text-gray-900 text-sm">Recent Activity Logs</h3>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">User</th>
                        <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Action</th>
                        <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">IP Address</th>
                        <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Time</th>
                        <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {activityLogs.map((log, i) => (
                        <tr key={i} className="hover:bg-gray-50/50">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600">
                                {log.user
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              <span className="text-sm text-gray-800 font-medium">
                                {log.user}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-sm text-gray-600">{log.action}</td>
                          <td className="px-5 py-3 text-xs text-gray-500 font-mono">{log.ip}</td>
                          <td className="px-5 py-3 text-xs text-gray-500">{log.time}</td>
                          <td className="px-5 py-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                log.status === "success"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky save footer */}
      <div className="fixed bottom-0 left-0 lg:left-60 right-0 bg-white border-t border-gray-100 py-4 px-8 z-30 flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D93025] text-white font-semibold rounded-xl shadow-sm hover:bg-red-700 transition-all text-sm"
        >
          <Save size={16} />
          Save Changes
        </button>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Lock size={18} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Change Password</h3>
                  <p className="text-xs text-gray-500">Update your admin password</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {["Current Password", "New Password", "Confirm New Password"].map(
                (label) => (
                  <div key={label} className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">{label}</label>
                    <input
                      type="password"
                      placeholder={`Enter ${label.toLowerCase()}`}
                      className={inputClass}
                    />
                  </div>
                )
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
              >
                Cancel
              </button>
              <button className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D93025] text-white font-semibold rounded-xl shadow-sm hover:bg-red-700 transition-all text-sm">
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Admin Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <UserPlus size={18} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Register New Admin</h3>
                  <p className="text-xs text-gray-500">Add a new administrator to the system</p>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Full Name</label>
                <input type="text" placeholder="Enter admin name" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Email Address</label>
                <input type="email" placeholder="Enter email address" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Phone Number</label>
                <input type="tel" placeholder="+234" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Initial Password</label>
                <input
                  type="password"
                  placeholder="Enter temporary password"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Role</label>
                <select className={selectClass}>
                  <option>Admin</option>
                  <option>Super Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowRegisterModal(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
              >
                Cancel
              </button>
              <button className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D93025] text-white font-semibold rounded-xl shadow-sm hover:bg-red-700 transition-all text-sm">
                Register Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from "react";
import { Bell, User, GraduationCap, BellRing, CreditCard, Mail, Settings as SettingsIcon, Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "tutorials" | "notifications" | "payments">("profile");
  const [formData, setFormData] = useState({
    // Profile
    adminName: "Admin User",
    email: "admin@astar-tutorials.com",
    phone: "+234 123 456 7890",
    
    // Tutorial Settings
    groupPrice: "15000",
    privatePrice: "25000",
    sessionDuration: "120",
    maxStudents: "30",
    bookingDeadline: "24",
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    newBookings: true,
    cancellations: true,
    feedbackAlerts: true,
    digestFrequency: "real-time",
    
    // Payment
    paymentGateway: "flutterwave",
    currency: "NGN",
    taxRate: "0"
  });

  const handleSave = () => {
    console.log("Saving settings:", formData);
    // Add save functionality here
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "tutorials", name: "Tutorials", icon: GraduationCap },
    { id: "notifications", name: "Notifications", icon: BellRing },
    { id: "payments", name: "Payments", icon: CreditCard }
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Settings</h1>
          <p className="text-gray-500 text-sm md:text-base">Manage your admin preferences and system configuration.</p>
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

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 p-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-[var(--astar-navy)] text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <tab.icon size={18} />
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        {/* Profile Settings */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Profile Settings</h2>
              <p className="text-sm text-gray-500">Update your admin profile information.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <button className="w-full px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all text-left text-sm text-gray-600">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tutorial Settings */}
        {activeTab === "tutorials" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Tutorial Settings</h2>
              <p className="text-sm text-gray-500">Configure default tutorial pricing and parameters.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Group Tutorial Price (₦)</label>
                <input
                  type="number"
                  value={formData.groupPrice}
                  onChange={(e) => setFormData({ ...formData, groupPrice: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Private Tutorial Price (₦)</label>
                <input
                  type="number"
                  value={formData.privatePrice}
                  onChange={(e) => setFormData({ ...formData, privatePrice: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Default Session Duration (minutes)</label>
                <select
                  value={formData.sessionDuration}
                  onChange={(e) => setFormData({ ...formData, sessionDuration: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
                >
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                  <option value="180">180 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Maximum Students per Group</label>
                <input
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Booking Deadline (hours before)</label>
                <input
                  type="number"
                  value={formData.bookingDeadline}
                  onChange={(e) => setFormData({ ...formData, bookingDeadline: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Notification Preferences</h2>
              <p className="text-sm text-gray-500">Manage how you receive notifications.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.emailNotifications}
                    onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.smsNotifications}
                    onChange={(e) => setFormData({ ...formData, smsNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="border-t pt-4 mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Alert Types</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.newBookings}
                      onChange={(e) => setFormData({ ...formData, newBookings: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">New bookings</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.cancellations}
                      onChange={(e) => setFormData({ ...formData, cancellations: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Cancellations</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.feedbackAlerts}
                      onChange={(e) => setFormData({ ...formData, feedbackAlerts: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Student feedback</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Digest Frequency</label>
                <select
                  value={formData.digestFrequency}
                  onChange={(e) => setFormData({ ...formData, digestFrequency: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
                >
                  <option value="real-time">Real-time</option>
                  <option value="daily">Daily digest</option>
                  <option value="weekly">Weekly digest</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Payment Settings */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Payment Configuration</h2>
              <p className="text-sm text-gray-500">Configure payment gateway and preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Gateway</label>
                <select
                  value={formData.paymentGateway}
                  onChange={(e) => setFormData({ ...formData, paymentGateway: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
                >
                  <option value="flutterwave">Flutterwave</option>
                  <option value="paystack">Paystack</option>
                  <option value="stripe">Stripe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
                >
                  <option value="NGN">Nigerian Naira (₦)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tax / VAT Rate (%)</label>
                <input
                  type="number"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">API Key</label>
                <input
                  type="password"
                  value="••••••••••••••••"
                  disabled
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button (Sticky Footer) */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
        <div className="max-w-7xl mx-auto flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-[var(--astar-red)] text-white font-bold shadow-lg hover:bg-[#c8102e] transition-all"
          >
            <Save size={20} />
            Save Changes
          </button>
        </div>
      </div>

      {/* Spacer for sticky footer */}
      <div className="h-20"></div>
    </div>
  );
}

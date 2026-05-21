'use client';

import { useState, useEffect } from "react";
import {
  User, GraduationCap, BellRing, CreditCard, Shield,
  Save, Lock, UserPlus, X, Loader2, CheckCircle2, AlertCircle,
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

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${checked ? "bg-[#0B1120]" : "bg-gray-200"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
      {type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState({
    adminName: "",
    email: "",
    phone: "",
    groupPrice: "15000",
    privatePrice: "6000",
    sessionDuration: "120",
    maxStudents: "30",
    bookingDeadline: "24",
    emailNotifications: true,
    smsNotifications: false,
    newBookings: true,
    cancellations: true,
    feedbackAlerts: true,
    digestFrequency: "real-time",
    paymentGateway: "paystack",
    currency: "NGN",
    taxRate: "0",
  });

  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [registerError, setRegisterError] = useState("");
  const [registerSaving, setRegisterSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) {
          setFormData((prev) => ({
            ...prev,
            adminName: d.name ?? "",
            email: d.email ?? "",
            phone: d.phone ?? "",
          }));
        }
      });
  }, []);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  const set = (key: string, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.adminName, phone: formData.phone }),
      });
      if (!res.ok) {
        const d = await res.json();
        showToast(d.error ?? "Failed to save settings.", "error");
      } else {
        showToast("Settings saved successfully.", "success");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch("/api/admin/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.newPass }),
      });
      const d = await res.json();
      if (!res.ok) {
        setPasswordError(d.error ?? "Failed to update password.");
      } else {
        setShowPasswordModal(false);
        setPasswordForm({ current: "", newPass: "", confirm: "" });
        showToast("Password updated successfully.", "success");
      }
    } catch {
      setPasswordError("Network error. Please try again.");
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleRegisterAdmin(e: React.FormEvent) {
    e.preventDefault();
    setRegisterError("");
    setRegisterSaving(true);
    try {
      const res = await fetch("/api/admin/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });
      const d = await res.json();
      if (!res.ok) {
        setRegisterError(d.error ?? "Failed to register admin.");
      } else {
        setShowRegisterModal(false);
        setRegisterForm({ name: "", email: "", password: "" });
        showToast("New admin registered successfully.", "success");
      }
    } catch {
      setRegisterError("Network error. Please try again.");
    } finally {
      setRegisterSaving(false);
    }
  }

  return (
    <div className="pb-24">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your admin preferences and system configuration.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-1.5 mb-6 flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? "bg-[#0B1120] text-white" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <tab.icon size={16} />
            {tab.name}
          </button>
        ))}
      </div>

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
                <input type="text" value={formData.adminName} onChange={(e) => set("adminName", e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Email Address</label>
                <input type="email" value={formData.email} disabled className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 text-sm cursor-not-allowed" />
                <p className="text-[10px] text-gray-400">Email cannot be changed here.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Phone Number</label>
                <input type="tel" value={formData.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Password</label>
                <button onClick={() => setShowPasswordModal(true)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all text-left text-sm text-gray-600 bg-white">
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
                <input type="number" value={formData.groupPrice} onChange={(e) => set("groupPrice", e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Private Tutorial Price (₦)</label>
                <input type="number" value={formData.privatePrice} onChange={(e) => set("privatePrice", e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Default Session Duration</label>
                <select value={formData.sessionDuration} onChange={(e) => set("sessionDuration", e.target.value)} className={selectClass}>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                  <option value="180">180 minutes</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Max Students per Group</label>
                <input type="number" value={formData.maxStudents} onChange={(e) => set("maxStudents", e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Booking Deadline (hours before)</label>
                <input type="number" value={formData.bookingDeadline} onChange={(e) => set("bookingDeadline", e.target.value)} className={inputClass} />
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
                { key: "emailNotifications", title: "Email Notifications", desc: "Receive notifications via email", val: formData.emailNotifications },
                { key: "smsNotifications", title: "SMS Notifications", desc: "Receive notifications via SMS", val: formData.smsNotifications },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                  <Toggle checked={item.val} onChange={(v) => set(item.key, v)} />
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
                    <input type="checkbox" checked={item.val} onChange={(e) => set(item.key, e.target.checked)} className="w-4 h-4 rounded border-gray-300 accent-[#D93025]" />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Digest Frequency</label>
              <select value={formData.digestFrequency} onChange={(e) => set("digestFrequency", e.target.value)} className={selectClass}>
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
                <select value={formData.paymentGateway} onChange={(e) => set("paymentGateway", e.target.value)} className={selectClass}>
                  <option value="paystack">Paystack</option>
                  <option value="flutterwave">Flutterwave</option>
                  <option value="stripe">Stripe</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Currency</label>
                <select value={formData.currency} onChange={(e) => set("currency", e.target.value)} className={selectClass}>
                  <option value="NGN">Nigerian Naira (₦)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Tax / VAT Rate (%)</label>
                <input type="number" value={formData.taxRate} onChange={(e) => set("taxRate", e.target.value)} placeholder="0" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">API Key</label>
                <input type="password" value="••••••••••••••••" disabled className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 text-sm cursor-not-allowed" />
                <p className="text-[10px] text-gray-400">Managed via environment variables.</p>
              </div>
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-0.5">Security &amp; Admin Management</h2>
              <p className="text-sm text-gray-500">Manage admin users and passwords.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => setShowPasswordModal(true)} className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl hover:shadow-md transition-all group text-left">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform flex-shrink-0">
                  <Lock size={18} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Change Password</p>
                  <p className="text-xs text-gray-500 mt-0.5">Update your admin password</p>
                </div>
              </button>
              <button onClick={() => setShowRegisterModal(true)} className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl hover:shadow-md transition-all group text-left">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform flex-shrink-0">
                  <UserPlus size={18} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Register New Admin</p>
                  <p className="text-xs text-gray-500 mt-0.5">Add a new administrator to the system</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky save footer — only meaningful on Profile tab */}
      {activeTab === "profile" && (
        <div className="fixed bottom-0 left-0 lg:left-60 right-0 bg-white border-t border-gray-100 py-4 px-8 z-30 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D93025] text-white font-semibold rounded-xl shadow-sm hover:bg-red-700 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      )}

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
              <button onClick={() => { setShowPasswordModal(false); setPasswordError(""); }} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Current Password</label>
                <input type="password" placeholder="Enter current password" value={passwordForm.current} onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))} className={inputClass} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">New Password</label>
                <input type="password" placeholder="At least 8 characters" value={passwordForm.newPass} onChange={(e) => setPasswordForm((p) => ({ ...p, newPass: e.target.value }))} className={inputClass} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Confirm New Password</label>
                <input type="password" placeholder="Repeat new password" value={passwordForm.confirm} onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))} className={inputClass} required />
              </div>
              {passwordError && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{passwordError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowPasswordModal(false); setPasswordError(""); }} className="flex-1 px-5 py-2.5 border border-gray-200 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={passwordSaving} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D93025] text-white font-semibold rounded-xl shadow-sm hover:bg-red-700 transition-all text-sm disabled:opacity-60">
                  {passwordSaving ? <><Loader2 size={15} className="animate-spin" /> Updating…</> : "Update Password"}
                </button>
              </div>
            </form>
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
              <button onClick={() => { setShowRegisterModal(false); setRegisterError(""); }} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRegisterAdmin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Full Name</label>
                <input type="text" placeholder="Enter admin name" value={registerForm.name} onChange={(e) => setRegisterForm((p) => ({ ...p, name: e.target.value }))} className={inputClass} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Email Address</label>
                <input type="email" placeholder="Enter email address" value={registerForm.email} onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))} className={inputClass} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Password</label>
                <input type="password" placeholder="At least 8 characters" value={registerForm.password} onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))} className={inputClass} required />
              </div>
              {registerError && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{registerError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowRegisterModal(false); setRegisterError(""); }} className="flex-1 px-5 py-2.5 border border-gray-200 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={registerSaving} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D93025] text-white font-semibold rounded-xl shadow-sm hover:bg-red-700 transition-all text-sm disabled:opacity-60">
                  {registerSaving ? <><Loader2 size={15} className="animate-spin" /> Registering…</> : "Register Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

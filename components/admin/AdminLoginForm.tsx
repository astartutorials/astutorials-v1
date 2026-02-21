'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User, Lock, Moon } from "lucide-react";

interface Admin {
  id: string;
  email: string;
  name: string;
  role: "admin";
}

interface AdminLoginResponse {
  admin: Admin;
}

export default function AdminLoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data: AdminLoginResponse = await response.json();

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      console.log("Logged in admin:", data.admin);

      // Example: redirect to admin dashboard
      router.push("/admin/dashboard");

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full lg:w-1/2 bg-white p-8 md:p-16 relative">
      <div className="absolute top-8 right-8 text-gray-400 cursor-pointer hover:text-gray-600">
        <Moon size={20} />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Image 
              src="/logo.png" 
              alt="A-Star Logo" 
              width={48} 
              height={48} 
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Portal</h2>
          <p className="text-gray-500 text-sm">
            Welcome back! Please enter your details.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSignIn}>
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Email
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-sm"
              />
            </div>

            <div className="flex justify-between mt-1">
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "Hide password" : "Show password"}
              </button>

              <Link href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--astar-red)] text-white font-bold py-3 rounded-lg shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all text-sm disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-[10px] text-gray-300">
            © 2024 A-Star Tutorials. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
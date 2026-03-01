'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Lock, Moon, Sun } from "lucide-react";

export default function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full lg:w-1/2 bg-white h-full p-8 md:p-16 relative">
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
          <p className="text-gray-500 text-sm">Welcome back! Please enter your details.</p>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Enter your username"
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-300 text-gray-700 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password"
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-300 text-gray-700 text-sm"
              />
            </div>
            <div className="flex justify-end mt-1">
               <Link href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                 Forgot Password?
               </Link>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full btn-primary bg-[var(--astar-red)] text-white font-bold py-3 rounded-lg shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all text-sm"
          >
            Sign In
          </button>
        </form>

        <div className="absolute bottom-6 left-0 right-0 text-center">
             <p className="text-[10px] text-gray-300">© {new Date().getFullYear()} A-Star Tutorials. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

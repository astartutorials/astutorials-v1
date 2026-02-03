'use client';

import Link from 'next/link';
import { GraduationCap, Moon, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="w-full py-4 px-4 md:px-6 flex items-center justify-between bg-white border-b border-gray-100 sticky top-0 z-50">
            {/* Left: Logo */}
            <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-blue-900 fill-blue-900" />
                <span className="text-xl md:text-2xl font-bold text-slate-900">A-Star.</span>
            </div>

            {/* Center: Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
                <Link href="/" className="text-gray-500 hover:text-gray-900 font-medium transition-colors">
                    Home
                </Link>
                <Link href="/tutorials" className="text-red-500 font-bold transition-colors">
                    Tutorials
                </Link>
                <Link href="/resources" className="text-gray-500 hover:text-gray-900 font-medium transition-colors">
                    Resources
                </Link>
                <Link href="/contact" className="text-gray-500 hover:text-gray-900 font-medium transition-colors">
                    Contact
                </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 md:gap-4">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                    <Moon className="w-4 h-4 md:w-5 md:h-5 fill-gray-500" />
                </button>
                <button className="hidden sm:block bg-blue-900 hover:bg-blue-800 text-white px-4 md:px-6 py-2 rounded-full font-medium transition-colors text-sm md:text-base">
                    Sign In
                </button>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? (
                        <X className="w-6 h-6 text-gray-700" />
                    ) : (
                        <Menu className="w-6 h-6 text-gray-700" />
                    )}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg">
                    <div className="flex flex-col p-4 space-y-4">
                        <Link
                            href="/"
                            className="text-gray-500 hover:text-gray-900 font-medium transition-colors py-2"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="/tutorials"
                            className="text-red-500 font-bold transition-colors py-2"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Tutorials
                        </Link>
                        <Link
                            href="/resources"
                            className="text-gray-500 hover:text-gray-900 font-medium transition-colors py-2"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Resources
                        </Link>
                        <Link
                            href="/contact"
                            className="text-gray-500 hover:text-gray-900 font-medium transition-colors py-2"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Contact
                        </Link>
                        <button
                            className="sm:hidden bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-full font-medium transition-colors text-center"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;


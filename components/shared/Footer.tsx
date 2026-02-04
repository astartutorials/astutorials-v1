import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, MessageCircle, Camera, Music } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#020617] text-white pt-20 pb-8 border-t border-white/5">
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
        
        {/* Brand Column (Span 5) */}
        <div className="md:col-span-5 space-y-6">
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <Image 
              src="/logo.png" 
              alt="A-Star Logo" 
              width={60} 
              height={60} 
              className="w-16 h-16 md:w-12 md:h-12 object-contain"
            />
          </Link>
          <p className="text-gray-400 leading-relaxed max-w-sm">
            Empowering Babcock University students to achieve academic excellence through structured guidance and community support.
          </p>
        </div>

        {/* Quick Links (Span 3) */}
        <div className="md:col-span-3">
          <h4 className="text-lg font-bold mb-8">Quick Links</h4>
          <ul className="space-y-4 text-gray-400">
            {['Home', 'About', 'Services', 'Book a Tutorial', 'Contact'].map((link) => (
              <li key={link}>
                <Link href="#" className="hover:text-[var(--astar-red)] transition-colors">
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact & Social (Span 4) */}
        <div className="md:col-span-4">
          <h4 className="text-lg font-bold mb-8">Connect With Us</h4>
          
          <ul className="space-y-6 mb-10">
            <li className="flex items-start gap-4 text-gray-400">
              <MapPin className="w-5 h-5 text-[var(--astar-red)] shrink-0 mt-1" />
              <span>Babcock University<br />Ilishan-Remo, Ogun State</span>
            </li>
            <li className="flex items-center gap-4 text-gray-400">
              <Phone className="w-5 h-5 text-[var(--astar-red)] shrink-0" />
              <span>+234 916 046 5678</span>
            </li>
            <li className="flex items-center gap-4 text-gray-400">
              <Mail className="w-5 h-5 text-[var(--astar-red)] shrink-0" />
              <span>info@astartutorials.ng</span>
            </li>
          </ul>

          <div className="flex gap-4">
            <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[var(--astar-red)] hover:-translate-y-1 transition-all duration-300">
              <MessageCircle size={18} />
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[var(--astar-red)] hover:-translate-y-1 transition-all duration-300">
              <Camera size={18} />
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[var(--astar-red)] hover:-translate-y-1 transition-all duration-300">
              <Music size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/5 pt-8 text-center">
        <p className="text-xs text-gray-600">
          © 2026 A-Star Tutorials. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

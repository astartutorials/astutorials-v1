import FeedbackForm from "@/components/feedback/FeedbackForm";
import { MessageCircle, Instagram, Music } from "lucide-react";
import Link from "next/link";

export default function FeedbackPage() {
  const socials = [
    { 
      name: "WhatsApp Channel", 
      icon: <MessageCircle size={20} />, 
      href: "https://whatsapp.com/channel/0029VavS6E5EwEjtZ3eM4t2R",
      handle: "Join Channel",
      color: "hover:text-green-500"
    },
    { 
      name: "Instagram", 
      icon: <Instagram size={20} />, 
      href: "https://instagram.com/astartutorials",
      handle: "@astartutorials",
      color: "hover:text-pink-500"
    },
    { 
      name: "TikTok", 
      icon: <Music size={20} />, 
      href: "https://tiktok.com/@astartutorials",
      handle: "@astartutorials",
      color: "hover:text-black"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <FeedbackForm />
      
      {/* Social Links Section */}
      <div className="mt-12 w-full max-w-xl text-center">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Connect with us</p>
        <div className="flex justify-center gap-6">
          {socials.map((social) => (
            <Link 
              key={social.name}
              href={social.href} 
              target="_blank"
              title={social.name}
              className={`w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 transition-all duration-300 ${social.color} hover:-translate-y-1 hover:shadow-md`}
            >
              {social.icon}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

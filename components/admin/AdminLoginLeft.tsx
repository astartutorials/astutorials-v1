'use client';

import Image from "next/image";

export default function AdminLoginLeft() {
  return (
    <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-[#1e1e1e] relative overflow-hidden text-white p-12">
      <div className="absolute inset-0 bg-[#0B1120]/90 z-10" />
      <div className="absolute inset-0 z-0">
         <Image 
            src="/logo.png" 
            alt="Background"
            layout="fill"
            objectFit="cover"
            className="opacity-5"
         />
      </div>

      <div className="relative z-20 text-center max-w-lg">
        <h1 className="text-4xl font-bold mb-6">Empowering Education</h1>
        <p className="text-gray-300 text-lg leading-relaxed">
          Streamlined management for a brighter future. Welcome to the A-Star administrative hub.
        </p>
      </div>


       <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/50 to-transparent z-10 pointer-events-none" />
    </div>
  );
}

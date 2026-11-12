import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

/**
 * Deep wine, picked by the user (2026-11-12) over navy and light. It replaced
 * a bright A-Star red band where the blue "A-Star Tutorials" and the pale pink
 * text were hard to read. Keeps the warmth of red without the glare, and
 * doesn't repeat the navy of the ambassador band and footer. The brand name is
 * blush pink, matching the accents (the user found light blue out of character).
 */
const t = {
  section: "bg-gradient-to-br from-[#3A0B10] via-[#4E1117] to-[#2A080C] text-white",
  eyebrow: "text-[#F4A9A3]",
  heading: "text-white",
  underline: "decoration-[#F4A9A3]",
  brand: "text-[#F4A9A3]",
  body: "text-white/70",
  checkWrap: "bg-white/10 text-[#F4A9A3]",
  item: "text-white/90",
  button: "bg-white text-[#7A1A21] shadow-black/30 hover:bg-red-50",
  fade: "from-[#2A080C]/90",
  badgeLabel: "text-white/60",
};

export default function BecomeTutor() {
  return (
    <div className={`w-full py-20 px-6 ${t.section}`}>
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Image */}
        <div className="relative">
          <div className="aspect-square rounded-[2rem] overflow-hidden border border-white/10 relative">
            <Image
              src="/become-tutor.jpg"
              alt="A-Star Tutor Teaching"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className={`absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t ${t.fade} to-transparent`}>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 inline-flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center text-green-950 font-bold">A+</div>
                <div>
                  <p className={`text-xs font-medium uppercase ${t.badgeLabel}`}>Tutor Rating</p>
                  <p className="font-bold text-white">Top 1% Performers</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Content */}
        <div>
          <span className={`text-sm font-bold tracking-widest uppercase mb-4 block ${t.eyebrow}`}>Careers</span>
          <h2 className={`text-3xl md:text-5xl font-bold mb-6 tracking-tight ${t.heading}`}>
            Become a <span className={`underline underline-offset-4 ${t.underline}`}>Tutor</span> at <br />{" "}
            <span className={t.brand}>A-Star Tutorials</span>
          </h2>
          <p className={`text-lg mb-8 leading-relaxed max-w-lg ${t.body}`}>
            Are you a high-performing student with a passion for teaching? Join our team of expert tutors and make a difference while earning.
          </p>

          <ul className="space-y-4 mb-10">
            {[
              "Flexible schedule around your classes",
              "Competitive compensation",
              "Leadership & mentorship experience"
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${t.checkWrap}`}>
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className={`font-medium ${t.item}`}>{item}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/apply"
            className={`px-8 py-3.5 rounded-full font-bold shadow-lg hover:-translate-y-1 transition-all duration-300 inline-block ${t.button}`}
          >
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
}

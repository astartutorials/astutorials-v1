
import { 
  GraduationCap, 
  BookOpen, 
  User, 
  FlaskConical, 
  FileText, 
  Globe,
  ArrowRight
} from "lucide-react"; 
import ScrollReveal from "@/components/shared/ScrollReveal";

export default function Services() {
  const services = [
    {
      title: "Group Tutorials",
      desc: "Interactive sessions with peers, fostering collaborative learning and shared understanding of complex topics.",
      icon: GraduationCap,
      action: "View Schedule",
      highlight: false
    },
    {
      title: "Exam Preparation",
      desc: "Intensive revision crash courses designed to maximize retention and exam performance in minimum time.",
      icon: BookOpen,
      action: "Start Prep",
      highlight: true 
    },
    {
      title: "Private 1-on-1",
      desc: "Personalized attention focused entirely on your specific weaknesses and learning pace.",
      icon: User,
      action: "Find a Tutor",
      highlight: false
    },
    {
      title: "Science Labs",
      desc: "Practical guidance for laboratory reports and experimental procedures to boost your practical grades.",
      icon: FlaskConical,
      action: "Lab Support",
      highlight: false
    },
    {
      title: "Assignment Help",
      desc: "Guidance on structuring essays, research papers, and assignments to meet academic standards.",
      icon: FileText,
      action: "Get Help",
      highlight: false
    },
    {
      title: "Language Club",
      desc: "Enhance your communication skills in French and other languages with conversational practice.",
      icon: Globe,
      action: "Join Club",
      highlight: false
    },
  ];

  return (
    <ScrollReveal id="services" className="w-full px-6 py-12 md:py-24 max-w-[1440px] mx-auto bg-gray-50/50 rounded-[3rem] my-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">Our Academic Services</h2>
        <p className="text-gray-500 text-lg font-light">Comprehensive tutorial programs designed to fit your learning style and schedule.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div key={index} className={`group relative p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 ${service.highlight ? 'bg-blue-800 text-white shadow-xl shadow-blue-900/20' : 'bg-white border border-gray-100 text-gray-900 shadow-sm hover:shadow-xl hover:shadow-gray-200/40'}`}>
            {service.highlight && <service.icon className="absolute top-8 right-8 w-32 h-32 text-white/5 -rotate-12 pointer-events-none transition-transform duration-500 group-hover:scale-110" />}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-xl transition-colors duration-300 ${service.highlight ? 'bg-white/10 text-white' : 'bg-red-50 text-[var(--astar-red)]'}`}><service.icon size={28} /></div>
            <h3 className="text-xl font-bold mb-4">{service.title}</h3>
            <p className={`text-sm leading-relaxed mb-8 ${service.highlight ? 'text-white/80' : 'text-gray-500'}`}>{service.desc}</p>
            <div className={`flex items-center text-xs font-bold tracking-widest uppercase transition-all duration-300 ${service.highlight ? 'text-white' : 'text-[var(--astar-red)]'}`}>{service.action} <ArrowRight className="w-3 h-3 ml-2 transition-transform duration-300 group-hover:translate-x-1" /></div>
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}

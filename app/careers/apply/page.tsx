import Image from "next/image";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export default function ApplyPage() {
    const benefits = [
        {
            title: "Flexible Schedule",
            desc: "Work around your university hours"
        },
        {
            title: "Great Pay",
            desc: "Competitive rates for your expertise"
        },
        {
            title: "Build Your CV",
            desc: "Gain valuable teaching experience"
        }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20 md:py-32 bg-white">
            <div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="grid md:grid-cols-2">
                    {/* Left Side - Image */}
                    <div className="relative h-64 md:h-auto min-h-[400px]">
                        <Image
                            src="/tutor-hero.png"
                            alt="Become a tutor"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Right Side - Content */}
                    <div className="bg-[#2563EB] text-white p-8 md:p-12 flex flex-col justify-center">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                            Share Your Knowledge & Earn
                        </h1>

                        <p className="text-blue-100 mb-8 text-base leading-relaxed">
                            Join the A-Star Tutorials team and help students succeed. Turn your expertise into income on your own terms.
                        </p>

                        {/* Benefits List */}
                        <div className="space-y-4 mb-10">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="bg-white rounded-full p-1 shrink-0 mt-1">
                                        <Check size={16} className="text-[#2563EB]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{benefit.title}</h3>
                                        <p className="text-blue-100 text-sm">{benefit.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA Button */}
                        <button className="bg-[#EF4444] hover:bg-red-600 text-white px-8 py-4 rounded-lg font-bold inline-flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-red-500/30 transform hover:-translate-y-0.5 mb-4 justify-center">
                            Apply to be a Tutor <ArrowRight size={20} />
                        </button>

                        {/* Login Link */}
                        <p className="text-blue-100 text-sm text-center">
                            Already a member?{" "}
                            <Link href="#" className="text-white font-semibold underline hover:text-blue-50">
                                Log in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

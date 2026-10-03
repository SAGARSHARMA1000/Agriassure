// components/WhyAgriassure.jsx
import TiltCard from "./TiltCard";
import {  Link as LinkIcon,
  Star,
  MapPin,
  Check,Lock,Activity,Shield,FileText,Gavel,AlertTriangle
} from 'lucide-react';

const WhyAgriassure = () => {
  return (
    <section id="why-agriassure" className="relative py-24 overflow-hidden">
      {/* FULL trust builder JSX unchanged */}

        {/* Soft Gradient Background */}
        <div className="absolute inset-0 bg-linear-to-br from-emerald-50 via-teal-50 to-slate-100"></div>
        
        {/* Background Video (Blurred) */}
        <div className="absolute inset-0 z-0 opacity-10">
           <video autoPlay loop muted className="w-full h-full object-cover filter blur-sm">
             <source src="https://res.cloudinary.com/dtbuqsryl/video/upload/v1772042753/AgriAssure_Promotional_Video_Script_fyuwqr.mp4" type="video/mp4" />
           </video>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-emerald-600 font-bold tracking-widest uppercase text-sm mb-4 block">Trust Ecosystem</span>
            <h2 className="text-4xl md:text-6xl font-extrabold text-slate-800">
              Why <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500">AgriAssure?</span>
            </h2>
            <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto">Building the future of agriculture on pillars of transparency and security.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Lock, title: "Secure Escrow", desc: "Payments locked in RBI-compliant accounts." },
              { icon: LinkIcon, title: "No Middlemen", desc: "Direct farmer-to-buyer connections." },
              { icon: Activity, title: "Mandi Intelligence", desc: "Real-time market rate analytics." },
              { icon: Shield, title: "Verified Users", desc: "100% KYC verified farmers & buyers." },
              { icon: FileText, title: "Transparent Pricing", desc: "Clear terms, zero hidden charges." },
              { icon: Gavel, title: "Dispute Resolution", desc: "Digital tribunal for quick settlements." },
            ].map((item, idx) => (
              <TiltCard key={idx} className="glass-card rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 group cursor-pointer hover:border-emerald-400/50">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm">
                  <item.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-emerald-700 transition-colors">{item.title}</h3>
                <p className="text-slate-600 group-hover:text-slate-700">{item.desc}</p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-emerald-400 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </TiltCard>
            ))}
          </div>
        </div>
    </section>
  );
};

export default WhyAgriassure;

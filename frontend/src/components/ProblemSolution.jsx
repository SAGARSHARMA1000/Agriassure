// components/ProblemSolution.jsx
import { AlertTriangle,X,ArrowRight ,Sprout,Check} from "lucide-react";
const ProblemSolution = () => {
  return (
    <section id="problem-solution" className="relative bg-white overflow-hidden">
      {/* FULL storytelling section JSX */}
      <section id="problem-solution" className="relative bg-white overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          
          {/* Left: Problems (Red/Amber) */}
          <div className="lg:w-1/2 bg-linear-to-br from-red-50 to-orange-50 p-12 lg:p-24 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-400"></div>
            <h3 className="text-3xl font-bold text-red-800 mb-12 flex items-center gap-3">
              <AlertTriangle className="text-red-600" /> The Old Way
            </h3>
            
            <div className="space-y-6">
              {[
                "Payment delays & defaults",
                "Exploitation by middlemen",
                "No price transparency",
                "Trust issues in quality",
                "Zero dispute support"
              ].map((text, i) => (
                <div key={i} className="bg-white/80 p-5 rounded-xl border border-red-100 shadow-sm text-red-900 font-medium flex items-center gap-4 animate-shake cursor-default hover:bg-red-50 transition-colors">
                   <X size={20} className="text-red-500 shrink-0" />
                   {text}
                </div>
              ))}
            </div>
            
            {/* Visual particles/dust */}
            <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
              <AlertTriangle size={300} className="text-red-900 transform rotate-12 translate-x-10 translate-y-10" />
            </div>
          </div>

          {/* Animated Divider */}
          <div className="hidden lg:block w-0.5 bg-linear-to-b from-transparent via-gray-300 to-transparent relative z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 p-2 rounded-full shadow-lg">
              <ArrowRight size={20} className="text-gray-400" />
            </div>
          </div>

          {/* Right: Solutions (Green) */}
          <div className="lg:w-1/2 bg-linear-to-br from-emerald-50 to-green-50 p-12 lg:p-24 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
             <h3 className="text-3xl font-bold text-emerald-800 mb-12 flex items-center gap-3">
              <Sprout className="text-emerald-600" /> The AgriAssure Way
            </h3>

            <div className="space-y-6">
              {[
                "Escrow-locked instant payments",
                "Direct farmer–buyer deals",
                "Live mandi rates & analytics",
                "100% Verified ecosystem",
                "Digital dispute resolution tribunal"
              ].map((text, i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm text-emerald-900 font-medium flex items-center gap-4 hover:shadow-md hover:scale-[1.02] transition-all transform duration-300">
                   <div className="bg-emerald-100 p-1 rounded-full"><Check size={16} className="text-emerald-600" /></div>
                   {text}
                </div>
              ))}
            </div>

            {/* Visual Flow Animation */}
            <div className="absolute bottom-10 right-10 flex gap-2 opacity-20">
              <div className="w-3 h-3 rounded-full bg-emerald-600 animate-bounce"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-600 animate-bounce delay-100"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-600 animate-bounce delay-200"></div>
            </div>
          </div>

        </div>
      </section>
    </section>
  );
};

export default ProblemSolution;

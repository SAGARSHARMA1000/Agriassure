// components/Testimonials.jsx
import Counter from "./Counter";
import { Star, Play, MapPin } from 'lucide-react';

const Testimonials = ({ setShowVideoModal }) => {
  const testimonialsData = [
    {
      role: "किसान (Farmer)",
      name: "रमेश पवार",
      loc: "नासिक, महाराष्ट्र",
      quote: "एग्रीएश्योर के साथ अब मुझे अपने भुगतान की कोई चिंता नहीं रहती। एस्क्रो पेमेंट सिस्टम से मेरी फसल का पूरा पैसा सीधे और सुरक्षित रूप से मेरे खाते में आता है।",
      img: "/images/farmer1.jpg"
    },
    {
      role: "कृषि उद्यमी (Farmer & Trader)",
      name: "सुनिता देवी",
      loc: "मंदसौर, मध्य प्रदेश",
      quote: "पहले बिचौलियों के कारण उपज का सही दाम नहीं मिलता था। इस प्लेटफॉर्म से सीधे खरीदारों से जुड़कर मेरी आमदनी में 30% से अधिक की बढ़ोतरी हुई है।",
      img: "/images/farmer2.jpg"
    },
    {
      role: "एफपीओ अध्यक्ष (FPO President)",
      name: "सुरेश पटेल",
      loc: "आनंद, गुजरात",
      quote: "500 से अधिक किसानों की उपज की बिक्री और हिसाब-किताब पहले बहुत कठिन था। अब एग्रीएश्योर के जरिए सब कुछ डिजिटल, सटीक और पूरी तरह पारदर्शी है।",
      img: "/images/farmer3.jpg"
    }
  ];

  const impactMetrics = [
    { label: "पंजीकृत किसान", val: 10000, suffix: "+" },
    { label: "सुरक्षित लेन-देन", val: 120, suffix: " Cr+" },
    { label: "सफल व्यापार", val: 98, suffix: "%" },
    { label: "धोखाधड़ी के मामले", val: 0, suffix: "" }
  ];

  return (
    <section id="testimonials" className="bg-slate-900 py-24 relative overflow-hidden text-white">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-emerald-500/20 rounded-full"
            style={{
              width: Math.random() * 10 + 5 + 'px',
              height: Math.random() * 10 + 5 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animation: `particles ${Math.random() * 5 + 5}s linear infinite`
            }}
          ></div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-emerald-400 font-semibold tracking-wider uppercase text-sm mb-2 block">
            किसान अनुभव और सफलता
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            सच्ची कहानियाँ, सच्चा प्रभाव
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg">
            देश भर के किसान और व्यापारी एग्रीएश्योर पर क्यों भरोसा करते हैं
          </p>
          <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full mt-6"></div>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {testimonialsData.map((t, i) => (
            <div key={i} className="glass-card p-8 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-all hover:-translate-y-2 group flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src={t.img} 
                    alt={t.name} 
                    className="w-16 h-16 rounded-full border-2 border-emerald-500 p-0.5 object-cover shadow-md" 
                  />
                  <div>
                    <h3 className="font-bold text-lg text-white">{t.name}</h3>
                    <p className="text-emerald-400 text-sm flex items-center gap-1">
                      <MapPin size={14} /> {t.loc}
                    </p>
                  </div>
                </div>
                <div className="mb-4 text-yellow-400 flex gap-1">
                  {[...Array(5)].map((_, star) => (
                    <Star key={star} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-slate-300 italic leading-relaxed">"{t.quote}"</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-700/60 flex justify-between items-center">
                <span className="text-xs font-bold bg-slate-800/90 text-emerald-400 px-3 py-1 rounded-full uppercase tracking-wide border border-emerald-500/20">
                  {t.role}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-800 pt-12">
          {impactMetrics.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-b from-white to-slate-400 mb-2">
                <Counter end={stat.val} suffix={stat.suffix} />
              </div>
              <p className="text-emerald-500 font-medium uppercase tracking-wider text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button 
            onClick={() => setShowVideoModal(true)}
            className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold transition-all shadow-lg shadow-emerald-900/50 hover:scale-105 cursor-pointer"
          >
            <Play size={20} fill="currentColor" /> किसानों की वीडियो कहानियाँ देखें
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

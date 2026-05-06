"use client";
import { Zap, Palette, BarChart3, Shield } from "lucide-react";
import { motion } from "framer-motion";

export const FeaturesGrid = () => {
  const features = [
    {
      icon: <Zap className="h-6 w-6 text-white" />,
      title: "Decision Engine",
      description: "Analyze feedback from Slack, GitHub, and users. Zentri tells you exactly what to build next and why."
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-white" />,
      title: "Feedback Synthesis",
      description: "Stop reading 100s of messages. Zentri distills user pain points into clear, actionable evidence."
    },
    {
      icon: <Palette className="h-6 w-6 text-white" />,
      title: "Automated PRDs",
      description: "From decision to documentation in seconds. Zentri generates high-quality PRDs and specs instantly."
    },
    {
      icon: <Shield className="h-6 w-6 text-white" />,
      title: "Task Readiness",
      description: "Ship faster with less friction. Zentri breaks down decisions into ready-to-code tasks for your team."
    }
  ];

  return (
    <section className="py-40 px-8 lg:px-24 bg-black">
       <div className="flex flex-col items-center gap-8 mb-24">
        <div className="liquid-glass rounded-full px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 border border-white/5">Why Zentri</div>
        <h2 className="text-5xl md:text-7xl font-heading italic text-white text-center leading-[0.9]">The difference is everything.</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="liquid-glass rounded-3xl p-10 flex flex-col gap-8 hover:translate-y-[-12px] transition-all duration-500 border border-white/5 hover:border-white/20 group"
          >
            <div className="liquid-glass-strong rounded-2xl w-14 h-14 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
              {f.icon}
            </div>
            <h4 className="text-2xl font-heading italic text-white">{f.title}</h4>
            <p className="text-white/50 font-body font-light text-base leading-relaxed">
              {f.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

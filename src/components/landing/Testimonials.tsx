"use client";
import { motion } from "framer-motion";

export const Testimonials = () => {
  const testimonials = [
    {
      quote:
        "Zentri synthesized months of feedback in minutes. We finally stopped guessing and started building what matters.",
      name: "Sarah Chen",
      role: "CEO, Luminary",
    },
    {
      quote:
        "No more guessing. The decision engine told us exactly why users were dropping off and what feature to fix first.",
      name: "Marcus Webb",
      role: "Founder, Arcline",
    },
    {
      quote:
        "It's like having a Senior PM on the team 24/7. The clarity it gives our dev team is insane.",
      name: "Elena Voss",
      role: "Founder, Helix",
    },
  ];

  return (
    <section className="py-40 px-8 lg:px-24 bg-black">
      <div className="flex flex-col items-center gap-8 mb-32">
        <div className="liquid-glass rounded-full px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 border border-white/5">
          What They Say
        </div>
        <h2 className="text-5xl md:text-7xl font-heading italic text-white text-center leading-[0.9]">
          Don't take our word for it.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.8 }}
            className="liquid-glass rounded-[2rem] p-12 flex flex-col justify-between gap-12 border border-white/5 hover:border-white/20 transition-all duration-700 hover:scale-[1.02] shadow-2xl group"
          >
            <p className="text-white/80 font-body font-light text-xl italic leading-relaxed group-hover:text-white transition-colors">
              "{t.quote}"
            </p>
            <div className="flex flex-col gap-2">
              <span className="text-white font-body font-bold text-lg">
                {t.name}
              </span>
              <span className="text-white/30 font-body font-medium text-[10px] uppercase tracking-[0.2em]">
                {t.role}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

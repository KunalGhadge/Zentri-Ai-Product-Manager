"use client";
import { VideoBackground } from "./VideoBackground";
import { motion } from "framer-motion";

export const Stats = () => {
  const stats = [
    { value: "10k+", label: "Decisions made" },
    { value: "85%", label: "Less documentation" },
    { value: "4.2x", label: "Faster delivery" },
    { value: "100%", label: "Data clarity" },
  ];

  return (
    <section className="relative min-h-[700px] flex items-center justify-center py-40 bg-black">
      <VideoBackground
        src="https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8"
        isHls
        className="opacity-20 grayscale saturate-0 brightness-50"
      />
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-black to-transparent z-1" />
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent z-1" />

      <div className="relative z-10 w-full max-w-7xl px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="liquid-glass rounded-[4rem] p-16 md:p-28 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-16 text-center relative z-10">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col gap-6">
                <span className="text-6xl md:text-8xl font-heading italic text-white leading-none tracking-tighter">
                  {s.value}
                </span>
                <span className="text-white/40 font-body font-medium text-xs uppercase tracking-[0.3em]">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

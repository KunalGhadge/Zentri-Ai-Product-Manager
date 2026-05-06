"use client";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const FeaturesChess = () => {
  return (
    <section className="py-40 px-8 lg:px-24 bg-black flex flex-col gap-48">
      <div className="flex flex-col items-center gap-8 mb-12">
        <div className="liquid-glass rounded-full px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 border border-white/5">
          Capabilities
        </div>
        <h2 className="text-5xl md:text-7xl font-heading italic text-white text-center leading-[0.9]">
          Pro features. <br /> Zero complexity.
        </h2>
      </div>

      {/* Row 1 */}
      <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-40">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex flex-col gap-10"
        >
          <h3 className="text-4xl md:text-6xl font-heading italic text-white leading-tight">
            Decide with confidence. <br /> Not guesswork.
          </h3>
          <p className="text-white/60 font-body font-light text-lg md:text-xl leading-relaxed max-w-lg">
            Zentri acts as your product brain, analyzing every piece of feedback
            across Slack and GitHub. It identifies why users aren't sticking and
            tells you exactly which feature matters most.
          </p>
          <Link
            href="/sign-in"
            className="liquid-glass-strong rounded-full px-10 py-4 w-fit text-white font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-xl"
          >
            Analyze my product <ArrowUpRight className="h-5 w-5" />
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="flex-1 w-full aspect-video liquid-glass rounded-[2.5rem] overflow-hidden border border-white/10 relative group shadow-2xl"
        >
          <img
            src="https://motionsites.ai/assets/hero-finlytic-preview-CV9g0FHP.gif"
            alt="Decision Engine"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent pointer-events-none" />
        </motion.div>
      </div>

      {/* Row 2 */}
      <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-40">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex flex-col gap-10"
        >
          <h3 className="text-4xl md:text-6xl font-heading italic text-white leading-tight">
            Automated specs. <br /> Instant clarity.
          </h3>
          <p className="text-white/60 font-body font-light text-lg md:text-xl leading-relaxed max-w-lg">
            Once a decision is made, Zentri does the heavy lifting. High-quality
            PRDs, technical specs, and ready-to-execute tasks are generated
            instantly, reducing your mental load to zero.
          </p>
          <Link
            href="/sign-in"
            className="liquid-glass-strong rounded-full px-10 py-4 w-fit text-white font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-xl"
          >
            Reduce mental load <ArrowUpRight className="h-5 w-5" />
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="flex-1 w-full aspect-video liquid-glass rounded-[2.5rem] overflow-hidden border border-white/10 relative group shadow-2xl"
        >
          <img
            src="https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif"
            alt="Feature 2"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-tl from-black/40 to-transparent pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
};

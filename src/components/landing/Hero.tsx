"use client";
import { motion } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import { BlurText } from "./BlurText";
import { VideoBackground } from "./VideoBackground";
import Link from "next/link";

export const Hero = () => {
  return (
    <section className="relative overflow-visible min-h-[1000px] flex flex-col items-center justify-start pt-[150px] text-center px-4">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <VideoBackground
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
          className="absolute top-[20%] left-0 w-full h-auto object-contain scale-125 opacity-40"
        />
        <div className="absolute inset-0 bg-black/5" />
        <div className="absolute bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-4xl">
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass rounded-full px-1 py-1 mb-12 flex items-center gap-3 pr-4"
        >
          <span className="bg-white text-black rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider">New</span>
          <span className="text-white text-xs font-medium font-body">Introducing Zentri: Your AI Product Manager.</span>
        </motion.div>

        {/* Heading */}
        <BlurText
          text="Zentri is your AI product manager."
          className="text-6xl md:text-7xl lg:text-[6rem] font-heading italic text-white leading-[0.85] tracking-[-3px] mb-8"
        />

        {/* Subtext */}
        <motion.p
          initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-base md:text-xl text-white/70 font-body font-light leading-relaxed max-w-xl mb-12"
        >
          Zentri helps founders decide what to build next using their product data. 
          The product brain for indie hackers and startup teams who want clear decisions, not just dashboards.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex flex-wrap items-center justify-center gap-8"
        >
          <Link href="/sign-in" className="liquid-glass-strong rounded-full px-8 py-3.5 flex items-center gap-2 text-white font-semibold hover:scale-105 transition-all shadow-2xl">
            Get Started <ArrowUpRight className="h-5 w-5" />
          </Link>
          <button className="flex items-center gap-3 text-white/90 font-medium hover:text-white transition-all group">
            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-xl border border-white/10 group-hover:bg-white/10 transition-all">
              <Play className="h-4 w-4 fill-white" />
            </div>
            Watch the Film
          </button>
        </motion.div>
      </div>

      {/* Partners Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="mt-auto pb-20 pt-20 flex flex-col items-center gap-10 w-full"
      >
        <div className="liquid-glass rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 font-body border border-white/5">
          Trusted by the teams behind
        </div>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-30 grayscale invert brightness-0 contrast-200">
          {["Stripe", "Vercel", "Linear", "Notion", "Figma"].map((name) => (
            <span key={name} className="text-2xl md:text-4xl font-heading italic text-white whitespace-nowrap">
              {name}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

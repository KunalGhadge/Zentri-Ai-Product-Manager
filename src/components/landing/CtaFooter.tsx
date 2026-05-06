"use client";
import { VideoBackground } from "./VideoBackground";
import { ArrowUpRight, Twitter, Github, Linkedin } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export const CtaFooter = () => {
  return (
    <section className="relative pt-64 pb-20 overflow-hidden bg-black flex flex-col items-center">
      <VideoBackground
        src="https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8"
        isHls
        className="opacity-40 scale-110"
      />
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-black to-transparent z-1" />
      
      <div className="relative z-10 text-center px-4 max-w-5xl flex flex-col items-center gap-12">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-6xl md:text-[9rem] font-heading italic text-white tracking-tight leading-[0.8]"
        >
          Ready to stop <br /> guessing?
        </motion.h2>
        <p className="text-white/60 font-body font-light text-xl md:text-2xl max-w-3xl leading-relaxed">
          Give your startup the AI product manager it deserves. No salary, no overhead. 
          Just pure clarity on what to build next.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10 mt-6">
          <Link href="/sign-in" className="liquid-glass-strong rounded-full px-12 py-5 text-white font-bold text-xl hover:scale-105 transition-all shadow-[0_0_80px_rgba(255,255,255,0.1)] flex items-center gap-3">
            Build Your Product Brain <ArrowUpRight className="h-6 w-6" />
          </Link>
          <Link href="/sign-in" className="bg-white text-black rounded-full px-12 py-5 text-xl font-bold hover:scale-105 transition-all shadow-2xl">
            Start for Free
          </Link>
        </div>
      </div>

      <div className="relative z-10 mt-64 w-full px-8 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 pb-24 border-b border-white/5">
          <div className="flex flex-col gap-8">
            <div className="h-10 px-4 bg-white/5 rounded-lg flex items-center justify-center backdrop-blur-xl border border-white/10 overflow-hidden group hover:bg-white/10 transition-all w-fit">
              <img src="/logo-icon.png" alt="Zentri Logo" className="h-6 w-auto object-contain transition-transform group-hover:scale-105" />
            </div>
            <p className="text-white/40 font-body text-sm leading-relaxed max-w-xs">
              The AI product manager for founders and indie hackers. Decide faster, build better.
            </p>
            <div className="flex items-center gap-5">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <Link key={i} href="#" className="h-10 w-10 rounded-full liquid-glass flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all">
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <h5 className="text-white font-body font-bold text-sm uppercase tracking-widest">Product</h5>
            <div className="flex flex-col gap-4">
              {["Features", "Decisions", "Framework", "Pricing"].map((link) => (
                <Link key={link} href={`#${link.toLowerCase()}`} className="text-white/40 hover:text-white transition-colors text-sm font-body">
                  {link}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <h5 className="text-white font-body font-bold text-sm uppercase tracking-widest">Company</h5>
            <div className="flex flex-col gap-4">
              {["About", "Blog", "Careers", "Contact"].map((link) => (
                <Link key={link} href="#" className="text-white/40 hover:text-white transition-colors text-sm font-body">
                  {link}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <h5 className="text-white font-body font-bold text-sm uppercase tracking-widest">Legal</h5>
            <div className="flex flex-col gap-4">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((link) => (
                <Link key={link} href="#" className="text-white/40 hover:text-white transition-colors text-sm font-body">
                  {link}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="py-12 flex flex-col md:flex-row items-center justify-between gap-10 opacity-30 hover:opacity-100 transition-opacity duration-700">
          <span className="text-white text-[10px] font-bold tracking-[0.3em] uppercase">
            © 2026 Zentri. All rights reserved.
          </span>
          <span className="text-white text-[10px] font-bold tracking-[0.3em] uppercase italic">
            Built by Founders for Founders
          </span>
        </div>
      </div>
    </section>
  );
};

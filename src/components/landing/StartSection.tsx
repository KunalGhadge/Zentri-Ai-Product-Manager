"use client";
import { VideoBackground } from "./VideoBackground";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const StartSection = () => {
  return (
    <section className="relative min-h-[700px] flex items-center justify-center overflow-hidden py-32 bg-black">
      <VideoBackground
        src="https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8"
        isHls
        className="opacity-40 scale-110"
      />
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-black to-transparent z-1" />
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent z-1" />

      <div className="relative z-10 text-center px-4 max-w-4xl flex flex-col items-center gap-8">
        <div className="liquid-glass rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80 font-body border border-white/10">
          How It Works
        </div>
        <h2 className="text-5xl md:text-7xl font-heading italic text-white tracking-tight leading-[0.9]">
          Stop guessing. <br /> Start building.
        </h2>
        <p className="text-white/60 font-body font-light text-lg md:text-xl max-w-2xl leading-relaxed">
          Connect your data. Zentri synthesizes everything—Slack messages,
          GitHub issues, and user feedback. Get the clarity you need to build
          the right thing next.
        </p>
        <Link
          href="/sign-in"
          className="liquid-glass-strong rounded-full px-10 py-4 text-white font-bold text-lg hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)] flex items-center gap-2"
        >
          Start for Free <ArrowUpRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
};

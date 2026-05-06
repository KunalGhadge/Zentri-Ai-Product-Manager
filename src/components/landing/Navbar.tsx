"use client";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const Navbar = () => {
  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-6 md:px-16 py-3 flex items-center justify-between pointer-events-none">
      <div className="flex items-center pointer-events-auto">
        <Link
          href="/"
          className="h-10 px-4 bg-white/5 rounded-lg flex items-center justify-center backdrop-blur-xl border border-white/10 overflow-hidden group hover:bg-white/10 transition-all"
        >
          <img
            src="/logo-icon.png"
            alt="Zentri Logo"
            className="h-6 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>
      </div>

      <div className="hidden md:flex items-center liquid-glass rounded-full px-1.5 py-1 pointer-events-auto">
        {["Home", "Product", "Decisions", "Framework", "Pricing"].map(
          (link) => (
            <Link
              key={link}
              href={`#${link.toLowerCase()}`}
              className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors"
            >
              {link}
            </Link>
          ),
        )}
      </div>

      <div className="pointer-events-auto">
        <Link
          href="/sign-in"
          className="bg-white text-black rounded-full px-5 py-2 text-sm font-semibold flex items-center gap-1 hover:bg-white/90 transition-all hover:scale-105"
        >
          Get Started <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </nav>
  );
};

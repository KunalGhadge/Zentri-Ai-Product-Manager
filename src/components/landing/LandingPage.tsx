"use client";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { StartSection } from "./StartSection";
import { FeaturesChess } from "./FeaturesChess";
import { FeaturesGrid } from "./FeaturesGrid";
import { Stats } from "./Stats";
import { Testimonials } from "./Testimonials";
import { CtaFooter } from "./CtaFooter";

export default function LandingPage() {
  return (
    <div className="bg-black min-h-screen text-white selection:bg-white selection:text-black overflow-x-hidden">
      <Navbar />
      <main className="relative z-10">
        <div id="home">
          <Hero />
        </div>
        <div className="bg-black">
          <div id="framework">
            <StartSection />
          </div>
          <div id="decisions">
            <FeaturesChess />
          </div>
          <div id="product">
            <FeaturesGrid />
          </div>
          <Stats />
          <div id="pricing">
            <Testimonials />
          </div>
          <CtaFooter />
        </div>
      </main>
    </div>
  );
}

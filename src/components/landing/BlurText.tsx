"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface BlurTextProps {
  text: string;
  delay?: number;
  direction?: "top" | "bottom";
  className?: string;
}

export const BlurText = ({
  text,
  delay = 100,
  direction = "bottom",
  className = "",
}: BlurTextProps) => {
  const words = text.split(" ");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ filter: "blur(10px)", opacity: 0, y: direction === "bottom" ? 50 : -50 }}
          animate={isInView ? {
            filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
            opacity: [0, 0.5, 1],
            y: [direction === "bottom" ? 50 : -50, -5, 0],
          } : {}}
          transition={{
            duration: 0.35,
            delay: (delay + i * 200) / 1000,
            times: [0, 0.5, 1],
            ease: "easeOut",
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

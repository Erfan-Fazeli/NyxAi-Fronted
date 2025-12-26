"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import { RandomEffectText } from "@/components/ui/random-effect-text";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const IsometricScene = dynamic(() => import("./IsometricScene"), { ssr: false });

const rotatingWords = [
  "Startups",
  "Founders",
  "Builders",
  "Developers",
  "Designers",
  "Product",
  "Marketing",
  "Sales",
  "Support",
  "Operations",
  "Finance",
  "Legal",
  "HR",
  "Healthcare",
  "Education",
  "Retail",
  "Ecommerce",
  "Agencies",
  "Consultants",
  "Creators",
  "Media",
  "Research",
  "Nonprofits",
  "Security",
  "Data",
  "Analytics",
  "Engineering",
  "Testing",
  "DevOps",
  "IT",
];

export function Hero() {
  return (
    <section className="relative min-h-screen w-full flex items-start overflow-hidden bg-zinc-950 pt-16">
        {/* 3D Background - Full Width */}
        <div className="absolute inset-0 z-0">
          <IsometricScene />
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10 flex items-start pt-32 md:pt-36">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start w-full">
            
            {/* Left Side - New Modern Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8 max-w-2xl"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-[#51a2ff]/25 bg-[#51a2ff]/15 px-4 py-2 text-sm text-zinc-100 backdrop-blur-sm w-fit"
              >
                <Sparkles className="h-4 w-4" style={{ color: "#51a2ff" }} strokeWidth={1.5} />
                <span>Free plan built for real work</span>
              </motion.div>

              {/* Headline with Random Effects */}
              <div className="space-y-2">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white text-left"
                >
                  <span className="block">Build and ship with</span>
                  <span className="block whitespace-nowrap">
                    <span className="inline-flex items-baseline justify-center gap-3">
                      <span>Nyx AI</span>
                      <span className="text-white">for</span>
                      <RandomEffectText
                        words={rotatingWords}
                        className="inline-block whitespace-nowrap align-baseline text-[0.95em] md:text-[1em] lg:text-[1em]"
                        style={{ color: "#ed6aff" }}
                        duration={6500}
                      />
                    </span>
                  </span>
                </motion.h1>
              </div>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-xl"
              >
                Start free with production-ready limits for early teams—upgrade only when growth demands it.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48, duration: 0.6 }}
                className="text-sm md:text-base text-zinc-500 leading-relaxed max-w-xl"
              >
                No countdowns. Just a solid starting point you can keep building on.
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-wrap gap-4 items-center"
              >
                <HoverBorderGradient
                  as="button"
                  containerClassName="rounded-full"
                  className="bg-[#51a2ff] text-white font-medium px-6 py-3 flex items-center gap-2 transition-colors hover:bg-[#2e90ff]"
                >
                  <span>Start for free</span>
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                </HoverBorderGradient>

              <button className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-6 text-base font-medium text-zinc-950 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all duration-300 hover:bg-zinc-100 hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)]">
                <BookOpen className="h-4 w-4" strokeWidth={2} />
                Documentation
              </button>
            </motion.div>

          </motion.div>

          {/* Right Side - Spacer for layout balance */}
          <div className="hidden lg:block"></div>          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white/50 flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-widest">Scroll to Explore</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </section>
  );
}
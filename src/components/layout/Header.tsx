"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Github, ChevronDown, Bot, ArrowUpRight, Brain, Workflow, Database, LineChart, Shield, Terminal, Cloud, Globe, Cpu, Scissors } from "lucide-react";

const navItems = [
  {
    name: "Services",
    href: "/services",
    megaMenu: [
      {
        title: "Featured",
        items: [
          { 
            title: "Background Remover", 
            desc: "AI-powered automatic background removal", 
            icon: Scissors,
            gradient: "from-cyan-500/20 to-blue-500/20",
            accentColor: "cyan",
            href: "/remove-bg"
          },
          { 
            title: "AI Neural Platform", 
            desc: "Deploy autonomous agents with our next-gen infrastructure", 
            icon: Brain,
            gradient: "from-violet-500/20 to-purple-500/20",
            accentColor: "violet"
          },
          {
            title: "AI Strategy Lab",
            desc: "Roadmaps, governance, and rollout playbooks",
            icon: Workflow,
            gradient: "from-fuchsia-500/20 to-rose-500/20",
            accentColor: "pink"
          }
        ]
      },
      {
        title: "Solutions",
        items: [
          { 
            title: "Custom Agents", 
            desc: "Purpose-built intelligent workers", 
            icon: Bot,
            gradient: "from-blue-500/20 to-cyan-500/20",
            accentColor: "blue"
          },
          { 
            title: "Model Training", 
            desc: "Fine-tuning on your proprietary data", 
            icon: Database,
            gradient: "from-emerald-500/20 to-teal-500/20",
            accentColor: "emerald"
          },
          { 
            title: "Workflow Automation", 
            desc: "End-to-end business process autonomy", 
            icon: Workflow,
            gradient: "from-pink-500/20 to-rose-500/20",
            accentColor: "pink"
          },
          { 
            title: "Analytics Engine", 
            desc: "Real-time performance insights", 
            icon: LineChart,
            gradient: "from-orange-500/20 to-red-500/20",
            accentColor: "orange"
          },
          { 
            title: "Enterprise Security", 
            desc: "Bank-grade data protection", 
            icon: Shield,
            gradient: "from-indigo-500/20 to-violet-500/20",
            accentColor: "indigo"
          },
          { 
            title: "API Access", 
            desc: "Developer platform & SDKs", 
            icon: Terminal,
            gradient: "from-zinc-500/20 to-gray-500/20",
            accentColor: "zinc"
          },
          { 
            title: "Cloud Infrastructure", 
            desc: "Scalable computing power", 
            icon: Cloud,
            gradient: "from-sky-500/20 to-blue-500/20",
            accentColor: "sky"
          },
          { 
            title: "Edge Computing", 
            desc: "Low-latency processing", 
            icon: Cpu,
            gradient: "from-amber-500/20 to-orange-500/20",
            accentColor: "amber"
          },
          { 
            title: "Global Network", 
            desc: "Worldwide content delivery", 
            icon: Globe,
            gradient: "from-green-500/20 to-emerald-500/20",
            accentColor: "green"
          }
        ]
      }
    ],
  },
  { name: "Solutions", href: "/solutions" },
  { name: "Creators", href: "/creators" },
  { name: "Pricing", href: "/pricing" },
];

// Icon component helper (removed - not needed anymore)

// 3D Isometric Card Component for Mega Menu
interface IsometricCardProps {
  item: {
    title: string;
    desc: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    gradient: string;
    accentColor: string;
    href?: string;
  };
  index: number;
  sectionIndex: number;
  variant?: "default" | "featured";
  chip?: string;
}

function IsometricCard({ item, index, sectionIndex, variant = "default", chip }: IsometricCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  const Icon = item.icon;
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -15, rotateY: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, rotateY: 0 }}
      transition={{ 
        delay: 0.05 + (sectionIndex * 0.05) + (index * 0.04), 
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      <Link href={item.href || "#"} className="block group/card h-full">
        <motion.div
          className={
            variant === "featured"
              ? "relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 p-2 backdrop-blur-xl h-full flex flex-col justify-center"
              : "relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 p-2 backdrop-blur-xl h-full flex flex-col justify-center"
          }
          animate={{
            rotateX: isHovered ? mousePosition.y * 6 : 0,
            rotateY: isHovered ? mousePosition.x * 6 : 0,
            z: isHovered ? 20 : 0,
          }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 20 
          }}
          style={{
            transformStyle: "preserve-3d",
            boxShadow: isHovered 
              ? "0 15px 35px -12px rgba(0, 0, 0, 0.7), 0 0 20px -8px rgba(139, 92, 246, 0.25)"
              : "0 8px 18px -10px rgba(0, 0, 0, 0.5)"
          }}
        >
          {/* Animated gradient background */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 transition-opacity duration-500 group-hover/card:opacity-100`}
            animate={{
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.4 }}
          />
          
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${(mousePosition.x + 1) * 50}% ${(mousePosition.y + 1) * 50}%, rgba(255, 255, 255, 0.15), transparent 50%)`,
            }}
          />

          {/* Content */}
          <div className={variant === "featured" ? "relative z-10 flex flex-col items-start gap-2" : "relative z-10 flex items-start gap-2.5"}>
            {/* 3D Isometric Icon Container */}
            <div className={variant === "featured" ? "flex items-center justify-between w-full" : ""}>
              <motion.div
                className={`relative flex ${variant === "featured" ? "h-8 w-8" : "h-8 w-8"} shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${item.gradient} shadow-lg`}
                animate={{
                  rotateX: isHovered ? -mousePosition.y * 15 : 0,
                  rotateY: isHovered ? mousePosition.x * 15 : 0,
                  z: isHovered ? 50 : 20,
                  scale: isHovered ? 1.1 : 1,
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20 
                }}
                style={{
                  transformStyle: "preserve-3d",
                  boxShadow: isHovered
                    ? `0 20px 40px -15px rgba(139, 92, 246, 0.6), 0 0 20px rgba(139, 92, 246, 0.4)`
                    : "0 8px 16px -8px rgba(139, 92, 246, 0.4)"
                }}
              >
                {/* Icon glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg bg-white/30 blur-sm"
                  animate={{
                    opacity: isHovered ? 0.4 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />
                
                <Icon 
                  className={variant === "featured" ? "relative z-10 h-4 w-4 text-white drop-shadow-lg" : "relative z-10 h-4 w-4 text-white drop-shadow-lg"}
                  strokeWidth={2}
                />
                
                {/* 3D depth layers */}
                <motion.div 
                  className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent"
                  style={{ translateZ: -2 }}
                />
              </motion.div>

              {variant === "featured" && chip && (
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
                  {chip}
                </span>
              )}
            </div>

            {/* Text Content */}
            <div className={variant === "featured" ? "flex-1 flex flex-col justify-center space-y-1.5 w-full" : "flex-1 space-y-0.5"}>
              {variant !== "featured" && chip && (
                <div className="inline-flex items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
                    {chip}
                  </span>
                </div>
              )}
              <motion.h5 
                className={
                  variant === "featured"
                    ? "text-[12px] font-bold text-zinc-100 group-hover/card:text-white transition-colors leading-tight"
                    : "text-[11px] font-semibold text-zinc-100 group-hover/card:text-white transition-colors leading-tight"
                }
                animate={{
                  x: isHovered ? 5 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {item.title}
              </motion.h5>
              <motion.p 
                className={
                  variant === "featured"
                    ? "text-[10px] text-zinc-500 group-hover/card:text-zinc-400 transition-colors leading-relaxed max-w-[95%]"
                    : "text-[9px] text-zinc-500 group-hover/card:text-zinc-400 transition-colors leading-tight"
                }
                animate={{
                  x: isHovered ? 5 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.05 }}
              >
                {item.desc}
              </motion.p>
            </div>

            {/* Arrow indicator */}
            {variant !== "featured" && (
              <motion.div
                className="shrink-0"
                animate={{
                  x: isHovered ? 3 : 0,
                  y: isHovered ? -3 : 0,
                  opacity: isHovered ? 1 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <ArrowUpRight className="h-3.5 w-3.5 text-violet-400" strokeWidth={2.5} />
              </motion.div>
            )}
          </div>

          {/* Bottom glow line */}
          <motion.div
            className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r ${item.gradient}`}
            initial={{ width: "0%" }}
            animate={{
              width: isHovered ? "100%" : "0%",
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}

export function Header() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-zinc-950/60 backdrop-blur-md transition-all duration-300">
      <div className="relative container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group z-50">
          <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 transition-transform duration-300 group-hover:scale-110 shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)]">
            <div className="absolute inset-0 bg-white/30 opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="relative z-10 text-lg font-bold text-white">N</span>
          </div>
          <span className="relative text-xl font-bold tracking-tight text-white">
            Nyx<span className="text-violet-400">Ai</span>
            <span className="absolute -right-7 top-0 flex h-3 items-center justify-center rounded-sm bg-white px-1 text-[8px] font-extrabold tracking-tighter text-violet-600 shadow-sm ring-1 ring-white/20 transition-all duration-300 group-hover:bg-violet-50 group-hover:text-violet-700">
              TM
            </span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-2" onMouseLeave={() => setHoveredIndex(null)}>
          {navItems.map((item, index) => (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => setHoveredIndex(index)}
            >
              <Link
                href={item.href}
                className="relative px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white flex items-center gap-1 group"
              >
                {item.name}
                {item.megaMenu && (
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${hoveredIndex === index ? "rotate-180" : ""}`} strokeWidth={1.5} />
                )}
                
                {/* Hover Pill */}
                {hoveredIndex === index && (
                  <motion.div
                    layoutId="hover-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-white/5 border border-white/5"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>

              {/* Mega Menu Dropdown - Perfectly Balanced Bento 2025 */}
              <AnimatePresence>
                {hoveredIndex === index && item.megaMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 10, scale: 0.96, filter: "blur(10px)" }}
                    transition={{ type: "spring", mass: 0.3, stiffness: 150, damping: 20 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[800px]"
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-3xl p-2.5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.95)] ring-1 ring-white/5">
                      {/* Ambient background effects */}
                      <div className="absolute top-0 left-1/4 h-48 w-48 rounded-full bg-violet-500/8 blur-3xl" />
                      <div className="absolute bottom-0 right-1/4 h-36 w-36 rounded-full bg-blue-500/8 blur-3xl" />

                      {/* Perfect Bento Grid: 9 Small Cards (3 cols) */}
                      <div className="relative z-10 h-[200px]">
                        {/* Grid of 9 Cards */}
                        <div className="grid grid-cols-3 grid-rows-3 auto-rows-fr gap-1.5 h-full min-h-0">
                          {item.megaMenu[1].items.map((subItem, idx) => (
                            <div key={idx} className="h-full min-h-0">
                              <IsometricCard
                                item={subItem}
                                index={idx}
                                sectionIndex={1}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center justify-end">
          <Link
            href="https://github.com"
            target="_blank"
            className="absolute right-[170px] text-zinc-400 transition-colors hover:text-white hover:scale-110 duration-200"
          >
            <Github className="h-5 w-5" />
          </Link>
          
          {/* Modern Expandable Button - Fixed Layout */}
          <button className="group relative flex h-10 items-center justify-center overflow-hidden rounded-full bg-white pl-5 pr-5 text-sm font-medium text-zinc-950 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all duration-300 hover:bg-zinc-100 hover:pr-9 hover:pl-5 hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)]">
            <span className="relative z-10">Get Started</span>
            <div className="absolute right-2.5 translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
              <ArrowUpRight className="h-[18px] w-[18px] text-violet-500 animate-[pulse_0.8s_ease-in-out_infinite]" strokeWidth={2.5} />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

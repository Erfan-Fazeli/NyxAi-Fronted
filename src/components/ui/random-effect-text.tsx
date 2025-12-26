"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface RandomEffectTextProps {
  words: string[];
  className?: string;
  style?: React.CSSProperties;
  /**
   * Fallback interval (ms) if you don't want randomized timing.
   * If `randomIntervalMs` is provided, this is ignored.
   */
  duration?: number;
  /** Random interval range in milliseconds for each word change. */
  randomIntervalMs?: { min: number; max: number };
}

// ========== 14 SELECTED EFFECTS ==========

// 1. Fade + Slide Up/Down
const fadeSlideUpDown = {
  initial: { opacity: 0, y: 20, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -20, filter: "blur(4px)" },
  transition: { duration: 1.0, ease: [0.25, 0.4, 0.25, 1] },
};

// 2. Fade + Scale
const fadeScale = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.2 },
  transition: { duration: 0.9, ease: "easeInOut" },
};

// 3. Slide Left/Right
const slideLeftRight = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
  transition: { duration: 1.0, ease: [0.6, 0.05, 0.01, 0.9] },
};

// 4. Bounce In/Out
const bounceInOut = {
  initial: { opacity: 0, scale: 0.3, y: 50 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.3, y: -50 },
  transition: { type: "spring", stiffness: 120, damping: 22 },
};

// 5. Zoom Blur
const zoomBlur = {
  initial: { opacity: 0, scale: 1.5, filter: "blur(20px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.5, filter: "blur(20px)" },
  transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
};

// 6. Slide Up + Scale
const slideUpScale = {
  initial: { opacity: 0, y: 80, scale: 0.8 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -80, scale: 0.8 },
  transition: { duration: 1.0, ease: "easeOut" },
};

// 7. Skew Slide
const skewSlide = {
  initial: { opacity: 0, x: -100, skewX: -10 },
  animate: { opacity: 1, x: 0, skewX: 0 },
  exit: { opacity: 0, x: 100, skewX: 10 },
  transition: { duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] },
};

// 8. Ripple Effect
const rippleEffect = {
  initial: { opacity: 0, scale: 0.5, filter: "blur(5px)" },
  animate: { 
    opacity: 1, 
    scale: [0.5, 1.1, 1],
    filter: ["blur(5px)", "blur(2px)", "blur(0px)"],
  },
  exit: { opacity: 0, scale: 0.5, filter: "blur(5px)" },
  transition: { duration: 1.1, ease: "easeOut" },
};

// 9. Shake Fade
const shakeFade = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    x: [0, -10, 10, -10, 10, 0],
  },
  exit: { opacity: 0 },
  transition: { duration: 1.0 },
};

// 10. Pulse Fade
const pulseFade = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { 
    opacity: 1, 
    scale: [0.9, 1.05, 1],
  },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 1.0, ease: "easeInOut" },
};

// 11. Elastic Bounce
const elasticBounce = {
  initial: { opacity: 0, y: -100 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 100 },
  transition: { type: "spring", stiffness: 160, damping: 18 },
};

// 12. Cascade Fade
const cascadeFade = {
  initial: { opacity: 0, y: 30 },
  animate: { 
    opacity: [0, 0.5, 1],
    y: [30, 15, 0],
  },
  exit: { 
    opacity: [1, 0.5, 0],
    y: [0, -15, -30],
  },
  transition: { duration: 1.0, times: [0, 0.5, 1] },
};

// 13. HyperText (Scramble Effect)
const hyperText = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.8 },
};

// 14. Flip Words
const flipWords = {
  initial: { opacity: 0, rotateX: -90, transformPerspective: 1000 },
  animate: { opacity: 1, rotateX: 0, transformPerspective: 1000 },
  exit: { opacity: 0, rotateX: 90, transformPerspective: 1000 },
  transition: { duration: 0.9, ease: "easeInOut" },
};

// 15. Blur Slide Vertical
const blurSlideVertical = {
  initial: { opacity: 0, y: -60, filter: "blur(15px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: 60, filter: "blur(15px)" },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
};

const ALL_EFFECTS = [
  fadeSlideUpDown,
  fadeScale,
  slideLeftRight,
  bounceInOut,
  zoomBlur,
  slideUpScale,
  skewSlide,
  rippleEffect,
  shakeFade,
  pulseFade,
  elasticBounce,
  cascadeFade,
  hyperText,
  flipWords,
  blurSlideVertical,
];

export function RandomEffectText({
  words,
  className = "",
  style = {},
  // Fallback if randomIntervalMs is not provided
  duration = 7000,
  // Default: randomize between 5s and 10s
  randomIntervalMs = { min: 5000, max: 10000 },
}: RandomEffectTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [effectKey, setEffectKey] = useState(0);
  const [currentEffect, setCurrentEffect] = useState(() => 
    ALL_EFFECTS[Math.floor(Math.random() * ALL_EFFECTS.length)]
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getRandomEffect = useCallback(() => {
    return ALL_EFFECTS[Math.floor(Math.random() * ALL_EFFECTS.length)];
  }, []);

  const getNextDelayMs = useCallback(() => {
    if (!randomIntervalMs) return duration;
    const min = Math.max(0, Math.floor(randomIntervalMs.min));
    const max = Math.max(min, Math.floor(randomIntervalMs.max));
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }, [duration, randomIntervalMs]);

  useEffect(() => {
    if (!words.length) return;

    const tick = () => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
      setCurrentEffect(getRandomEffect());
      setEffectKey((prev) => prev + 1);
      timeoutRef.current = setTimeout(tick, getNextDelayMs());
    };

    timeoutRef.current = setTimeout(tick, getNextDelayMs());

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    };
  }, [words.length, getRandomEffect, getNextDelayMs]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={effectKey}
        initial={currentEffect.initial as any}
        animate={currentEffect.animate as any}
        exit={currentEffect.exit as any}
        transition={currentEffect.transition as any}
        className={className}
        style={{ display: "inline-block", ...style }}
      >
        {words[currentIndex]}
      </motion.span>
    </AnimatePresence>
  );
}

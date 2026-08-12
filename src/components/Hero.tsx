"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/* ─────────────────────────────────────────
   Animated orange pixel-wave background canvas
   (Digital square wave pattern matching reference design)
───────────────────────────────────────── */
function PixelGrid() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const CELL = 14;            // Grid spacing
    const SQ = 9;               // Square size
    const FADE_SPEED = 0.05;    // Opacity transition speed

    type Sq = {
      r: number;
      c: number;
      x: number;
      y: number;
      a: number;
      t: number;
      s: number;
      noiseOffset: number;
    };

    let W = 0;
    let H = 0;
    let sqs: Sq[] = [];
    let raf = 0;
    let cols = 0;
    let rows = 0;
    const startTime = Date.now();

    function init() {
      if (!canvas) return;
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
      cols = Math.ceil(W / CELL) + 1;
      rows = Math.ceil(H / CELL) + 1;

      sqs = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * CELL;
          const y = r * CELL;
          sqs.push({
            r,
            c,
            x,
            y,
            a: Math.random() * 0.2,
            t: 0,
            s: FADE_SPEED * (0.7 + Math.random() * 0.6),
            noiseOffset: Math.random() * 0.3 - 0.15,
          });
        }
      }
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      const time = (Date.now() - startTime) * 0.0012;

      for (const s of sqs) {
        const normC = s.c / cols;
        const normR = s.r / rows;

        // Wave 1: Main diagonal flow
        const wave1 = Math.sin(s.c * 0.14 + s.r * 0.09 - time * 1.8);
        
        // Wave 2: Counter wave
        const wave2 = Math.cos(s.c * 0.08 - s.r * 0.16 + time * 1.2);

        // Wave 3: Corner accent wave concentrations (top-left & bottom-right like reference image)
        const distTL = Math.hypot(normC, normR);
        const distBR = Math.hypot(1 - normC, 1 - normR);
        const cornerEnv = Math.exp(-distTL * 2.8) * 1.2 + Math.exp(-distBR * 2.8) * 1.2;

        // Combine waves
        const combinedWave = (wave1 * 0.5 + wave2 * 0.5) * 0.5 + 0.5;
        
        // Soft cutout in center so title stays readable
        const centerCutout = 1 - Math.exp(-Math.pow(normC - 0.5, 2) * 8 - Math.pow(normR - 0.5, 2) * 8) * 0.65;

        // Calculate dynamic wave intensity
        let waveIntensity = (combinedWave * 0.6 + cornerEnv * 0.7 + s.noiseOffset) * centerCutout;
        waveIntensity = Math.max(0, Math.min(1, waveIntensity));

        // Thresholding for sharp pixel cluster definition
        if (waveIntensity > 0.38) {
          s.t = (waveIntensity - 0.35) * 1.1;
        } else if (Math.random() < 0.02) {
          s.t = 0.15 + Math.random() * 0.3;
        } else {
          s.t = 0;
        }

        s.a += (s.t - s.a) * s.s;

        if (s.a > 0.02) {
          const alpha = Math.min(0.9, s.a);
          if (s.a > 0.55) {
            ctx.fillStyle = `rgba(255, 140, 30, ${alpha.toFixed(2)})`;
          } else {
            ctx.fillStyle = `rgba(255, 107, 0, ${alpha.toFixed(2)})`;
          }
          ctx.fillRect(s.x, s.y, SQ, SQ);
        }
      }
      raf = requestAnimationFrame(draw);
    }

    init();
    draw();
    const ro = new ResizeObserver(init);
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full pointer-events-none" />;
}

/* ─────────────────────────────────────────
   Framer Motion staggered variants
───────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-64px)] md:min-h-[100svh] w-full overflow-hidden flex flex-col items-center justify-start md:justify-center bg-navy-950 pt-20 sm:pt-24 pb-8 md:py-8 px-4">
      {/* ── Orange animated pixel grid with CSS smooth mask fade ── */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 95%)",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 95%)",
        }}
      >
        <PixelGrid />
      </div>

      {/* ── Solid backdrop vignette so center text is crisp & legible ── */}
      <div className="absolute inset-0 pointer-events-none z-[2] bg-navy-950/60" />

      {/* ── Glow Orbs ── */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 z-[4] h-[450px] w-[600px] rounded-full bg-[#dd830a]/15 blur-[160px]" />

      {/* ══════════════ HERO CONTENT ══════════════ */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center px-4"
      >
        {/* Live badge */}
        <motion.div
          variants={itemVariants}
          className="mb-7 md:mb-6 flex items-center gap-2.5 rounded-full border border-[#FF6B00]/35 bg-[#FF6B00]/10 px-4 py-1.5 backdrop-blur-md"
        >
          <span
            className="h-2 w-2 rounded-full bg-[#FF6B00] shrink-0"
            style={{
              animation: "badge-pulse 2.2s ease-in-out infinite",
              boxShadow: "0 0 10px #FF6B00",
            }}
          />
          <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.36em] uppercase text-orange-400">
            Faculty of Computing - Sabaragamuwa University of Sri Lanka
          </span>
        </motion.div>

        {/* Main display heading */}
        <motion.h1
          variants={itemVariants}
          className="hero-heading select-none text-center text-white leading-[1.00] md:leading-[0.95] mb-6 md:mb-5 tracking-[0.04em]"
          style={{
            fontFamily: "var(--font-anton), var(--font-teko), sans-serif",
          }}
        >
          INFOBASH
          <br />
          <span
            style={{
              color: "#FF6B00",
              textShadow:
                "0 0 70px rgba(255,107,0,0.5), 0 0 120px rgba(255,107,0,0.25)",
            }}
          >
            CRICKET
          </span>
          <br />
          TOURNAMENT V5.0
        </motion.h1>

        {/* Accent Divider */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-4 mb-5 md:mb-4 w-full max-w-xs"
        >
          <div className="flex-1 h-px bg-[#FF6B00]/35" />
          <span className="text-[10px] font-mono tracking-[0.45em] uppercase text-white/30 shrink-0">
            2026
          </span>
          <div className="flex-1 h-px bg-[#FF6B00]/35" />
        </motion.div>

        {/* Taglines */}
        <motion.p
          variants={itemVariants}
          className="text-xs sm:text-sm font-mono tracking-[0.28em] uppercase text-white/60 mb-2"
        >
          Where 0s and 1s Become 4s and 6s
        </motion.p>
        <motion.p
          variants={itemVariants}
          className="text-[11px] sm:text-xs font-mono tracking-wider text-white/35 mb-9 max-w-md"
        >
          Annual Intra-Faculty Tournament · Faculty of Computing
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link
            href="/register"
            className="group relative inline-flex items-center justify-center text-white text-xs sm:text-sm font-bold tracking-[0.2em] uppercase px-8 py-3.5 rounded-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_4px_32px_rgba(255,107,0,0.4)]"
            style={{ background: "#FF6B00" }}
          >
            Register Now
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/matches"
            className="inline-flex items-center justify-center text-xs sm:text-sm font-bold tracking-[0.2em] uppercase px-8 py-3.5 rounded-sm transition-all duration-200 border border-[#FF6B00]/35 text-white/60 hover:border-orange-500/50 hover:text-white hover:bg-white/5"
          >
            View Schedule
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

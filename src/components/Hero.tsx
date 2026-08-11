"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/* ─────────────────────────────────────────
   Animated orange pixel-grid background canvas
   with procedurally formed FOC & INFOBASH pixel text!
───────────────────────────────────────── */
const FONT_5X7: Record<string, number[][]> = {
  F: [[1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0]],
  O: [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  C: [[0, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [0, 1, 1, 1, 1]],
  I: [[1, 1, 1, 1, 1], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [1, 1, 1, 1, 1]],
  N: [[1, 0, 0, 0, 1], [1, 1, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 0, 1, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
  B: [[1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0]],
  A: [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
  S: [[0, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 1], [0, 0, 0, 0, 1], [1, 1, 1, 1, 0]],
  H: [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
  V: [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 0, 1, 0], [0, 0, 1, 0, 0]],
  "5": [[1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 1, 1, 1, 0], [0, 0, 0, 0, 1], [0, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  ".": [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 1, 0]],
  "0": [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  U: [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  L: [[1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 1]],
  R: [[1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0], [1, 0, 1, 0, 0], [1, 0, 0, 1, 0], [1, 0, 0, 0, 1]],
  K: [[1, 0, 0, 0, 1], [1, 0, 0, 1, 0], [1, 0, 1, 0, 0], [1, 1, 0, 0, 0], [1, 0, 1, 0, 0], [1, 0, 0, 1, 0], [1, 0, 0, 0, 1]],
  E: [[1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 1]],
  T: [[1, 1, 1, 1, 1], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0]],
};

function PixelGrid() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* Manual controls */
    const CELL = 13;            // Grid spacing
    const SQ = 8.5;             // Square size
    const FADE_SPEED = 0.04;    // Opacity transition speed

    type Sq = { r: number; c: number; x: number; y: number; wordPhase: number; isTextPixel: boolean; a: number; t: number; s: number };
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

      // 2D grid map to store text pixel associations
      const textPixelMap = new Map<string, { phase: number }>();

      // Helper function to position word inside one of the 4 marked side zones:
      // Zone 1: Top-Left, Zone 2: Top-Right, Zone 3: Mid-Left, Zone 4: Mid-Right
      const getZonePos = (word: string, zone: 1 | 2 | 3 | 4) => {
        let width = 0;
        for (const ch of word) {
          const matrix = FONT_5X7[ch];
          width += matrix ? matrix[0].length + 1 : 4;
        }

        let rRatio = 0.16;
        let cRatio = 0.04;
        if (zone === 1) { rRatio = 0.16; cRatio = 0.04; }
        else if (zone === 2) { rRatio = 0.16; cRatio = 0.68; }
        else if (zone === 3) { rRatio = 0.54; cRatio = 0.04; }
        else if (zone === 4) { rRatio = 0.60; cRatio = 0.68; }

        const r = Math.max(2, Math.floor(rows * rRatio));
        const targetC = Math.floor(cols * cRatio);
        const maxC = Math.max(2, cols - width - 2);
        const c = Math.min(Math.max(2, targetC), maxC);

        return { r, c };
      };

      const wordConfigs = [
        // Phase 1: Top-Left (FOC) & Top-Right (INFOBASH)
        { text: "FOC", zone: 1 as const, phase: 1 },
        { text: "INFOBASH", zone: 2 as const, phase: 1 },

        // Phase 2: Mid-Left (CRICKET) & Mid-Right (V5.0)
        { text: "CRICKET", zone: 3 as const, phase: 2 },
        { text: "V5.0", zone: 4 as const, phase: 2 },

        // Phase 3: Mid-Left (SUSL) & Top-Right (INFOBASH)
        { text: "SUSL", zone: 3 as const, phase: 3 },
        { text: "INFOBASH", zone: 2 as const, phase: 3 },
      ];

      const wordPlacements = wordConfigs.map((w) => {
        const pos = getZonePos(w.text, w.zone);
        return { text: w.text, r: pos.r, c: pos.c, phase: w.phase };
      });

      // Populate textPixelMap from font matrices
      for (const w of wordPlacements) {
        let curC = w.c;
        for (const ch of w.text) {
          const matrix = FONT_5X7[ch];
          if (matrix) {
            for (let mr = 0; mr < matrix.length; mr++) {
              for (let mc = 0; mc < matrix[mr].length; mc++) {
                if (matrix[mr][mc] === 1) {
                  const gr = w.r + mr;
                  const gc = curC + mc;
                  textPixelMap.set(`${gr},${gc}`, { phase: w.phase });
                }
              }
            }
            curC += matrix[0].length + 1; // Spacing between letters
          } else {
            curC += 4;
          }
        }
      }

      sqs = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * CELL;
          const y = r * CELL;
          const textInfo = textPixelMap.get(`${r},${c}`);
          sqs.push({
            r,
            c,
            x,
            y,
            wordPhase: textInfo ? textInfo.phase : 0,
            isTextPixel: Boolean(textInfo),
            a: Math.random() * 0.25,
            t: Math.random() < 0.28 ? 0.12 + Math.random() * 0.55 : 0,
            s: FADE_SPEED * (0.8 + Math.random() * 0.6),
          });
        }
      }
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      const now = Date.now() - startTime;

      // 12-second cycle for text phases:
      // Phase 1 (0.5s - 4.5s): FOC (Top Left) & INFOBASH (Top Right)
      // Phase 2 (4.5s - 8.5s): V5.0 (Mid Left) & CRICKET (Center Top) & FOC (Mid Right)
      // Phase 3 (8.5s - 11.5s): INFOBASH (Bottom Left) & SUSL (Bottom Right)
      const cycleTime = (now * 0.00045) % 12;
      const p1Progress = cycleTime >= 0.5 && cycleTime <= 4.5 ? Math.sin(((cycleTime - 0.5) / 4) * Math.PI) : 0;
      const p2Progress = cycleTime >= 4.5 && cycleTime <= 8.5 ? Math.sin(((cycleTime - 4.5) / 4) * Math.PI) : 0;
      const p3Progress = cycleTime >= 8.5 && cycleTime <= 11.5 ? Math.sin(((cycleTime - 8.5) / 3) * Math.PI) : 0;

      for (const s of sqs) {
        // Text Boost for active word phase
        let textBoost = 0;
        if (s.isTextPixel) {
          if (s.wordPhase === 1 && p1Progress > 0) textBoost = p1Progress * 0.95;
          else if (s.wordPhase === 2 && p2Progress > 0) textBoost = p2Progress * 0.95;
          else if (s.wordPhase === 3 && p3Progress > 0) textBoost = p3Progress * 0.95;
        }

        if (Math.abs(s.a - s.t) < 0.02) {
          const isIlluminated = Math.random() < (0.24 + textBoost * 0.6);
          s.t = isIlluminated ? (0.12 + Math.random() * 0.55 + textBoost * 0.65) : 0;
          s.s = FADE_SPEED * (0.5 + Math.random() * 1.2);
        }

        s.a += (s.t - s.a) * s.s;

        const finalAlpha = Math.min(0.95, Math.max(0, s.a + textBoost * 0.8));

        if (finalAlpha > 0.015) {
          ctx.fillStyle = `rgba(255,107,0,${finalAlpha.toFixed(2)})`;
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
    <section className="relative min-h-[calc(100vh-64px)] w-full overflow-hidden flex flex-col items-center justify-start bg-navy-950 pt-20 sm:pt-24 pb-8 px-4">
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
          className="mb-7 flex items-center gap-2.5 rounded-full border border-[#FF6B00]/35 bg-[#FF6B00]/10 px-4 py-1.5 backdrop-blur-md"
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
          className="select-none text-center text-white leading-[1.00] mb-6 tracking-[0.04em]"
          style={{
            fontFamily: "var(--font-anton), var(--font-teko), sans-serif",
            fontSize: "clamp(3.8rem, 10.0vw, 10.5rem)",
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
          className="flex items-center gap-4 mb-5 w-full max-w-xs"
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
            className="inline-flex items-center justify-center text-xs sm:text-sm font-bold tracking-[0.2em] uppercase px-8 py-3.5 rounded-sm transition-all duration-200 border border-white/15 text-white/60 hover:border-orange-500/50 hover:text-white hover:bg-white/5"
          >
            View Schedule
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

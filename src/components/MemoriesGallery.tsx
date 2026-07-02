"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Camera, ZoomIn } from "lucide-react";
import Image from "next/image";

/* ── Memory tile data ──────────────────────────────────────── */
interface Memory {
  id: number;
  year: string;
  caption: string;
  src: string | null;
  gradient: string;
  /** Responsive Tailwind grid span classes */
  span: string;
}

const MEMORIES: Memory[] = [
  /* ── Group 1: Bento block (rows 1-3) ── */
  {
    id: 1,
    year: "InfoBash IV",
    caption: "Champions lift the trophy",
    src: null,
    gradient: "from-blue-900 via-blue-800 to-cyan-700",
    span: "col-span-2 row-span-2 sm:row-span-3",
  },
  {
    id: 2,
    year: "InfoBash IV",
    caption: "Opening ceremony",
    src: null,
    gradient: "from-indigo-900 via-violet-800 to-purple-800",
    span: "col-span-1 row-span-1",
  },
  {
    id: 3,
    year: "InfoBash IV",
    caption: "Wicket celebrations",
    src: null,
    gradient: "from-sky-900 via-blue-800 to-indigo-800",
    span: "col-span-1 row-span-2 sm:row-span-3",
  },
  {
    id: 4,
    year: "InfoBash III",
    caption: "Match-winning six",
    src: null,
    gradient: "from-cyan-900 via-teal-800 to-emerald-800",
    span: "col-span-1 row-span-1",
  },
  {
    id: 5,
    year: "InfoBash III",
    caption: "The tense final over",
    src: null,
    gradient: "from-slate-800 via-blue-900 to-cyan-900",
    span: "col-span-1 row-span-1",
  },

  /* ── Group 2: Medium row (rows 4-5) ── */
  {
    id: 6,
    year: "InfoBash III",
    caption: "Fielding masterclass",
    src: null,
    gradient: "from-blue-950 via-indigo-900 to-blue-800",
    span: "col-span-1 row-span-1 sm:row-span-2",
  },
  {
    id: 7,
    year: "InfoBash II",
    caption: "Team photo — Batch 2022",
    src: null,
    gradient: "from-[#0d1340] via-slate-800 to-blue-900",
    span: "col-span-2 row-span-1 sm:row-span-2",
  },
  {
    id: 8,
    year: "InfoBash II",
    caption: "Victory lap",
    src: null,
    gradient: "from-indigo-950 via-blue-900 to-cyan-900",
    span: "col-span-1 row-span-1 sm:row-span-2",
  },

  /* ── Group 3: Small strip (row 6) ── */
  {
    id: 9,
    year: "InfoBash II",
    caption: "Crowd goes wild",
    src: null,
    gradient: "from-blue-900 via-cyan-900 to-teal-900",
    span: "col-span-1 row-span-1",
  },
  {
    id: 10,
    year: "InfoBash I",
    caption: "The first edition",
    src: null,
    gradient: "from-purple-900 via-indigo-900 to-blue-900",
    span: "col-span-1 row-span-1",
  },
  {
    id: 11,
    year: "InfoBash I",
    caption: "The inaugural trophy",
    src: null,
    gradient: "from-slate-900 via-blue-950 to-indigo-900",
    span: "col-span-1 row-span-1",
  },
  {
    id: 12,
    year: "InfoBash I",
    caption: "Where it all began",
    src: null,
    gradient: "from-cyan-950 via-blue-900 to-slate-900",
    span: "col-span-1 row-span-1",
  },
];

/* ── Cricket seam pattern overlay ─────────────────────────── */
function CricketOverlay() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-[0.06]"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="seam" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M0 30 Q15 0 30 30 Q45 60 60 30" stroke="white" strokeWidth="0.8" fill="none" />
          <path d="M0 30 Q15 60 30 30 Q45 0 60 30" stroke="white" strokeWidth="0.8" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#seam)" />
    </svg>
  );
}

/* ── Single tile ───────────────────────────────────────────── */
function Tile({ memory, index }: { memory: Memory; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className={`group relative cursor-pointer overflow-hidden rounded-2xl ${memory.span}`}
      initial={{ opacity: 0, scale: 0.93, y: 18 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] as const }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.025, transition: { duration: 0.25 } }}
    >
      {/* Background — real photo or gradient placeholder */}
      {memory.src ? (
        <Image
          src={memory.src}
          alt={memory.caption}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${memory.gradient}`}>
          <CricketOverlay />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-25">
            <Camera size={28} className="text-white" />
            <span className="font-mono-score text-[9px] uppercase tracking-widest text-white">
              Photo Coming Soon
            </span>
          </div>
        </div>
      )}

      {/* Bottom fade for captions */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Hover: cyan tint */}
      <motion.div
        className="absolute inset-0 bg-cyan-400/8 backdrop-blur-[0.5px]"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* Zoom icon */}
      <motion.div
        className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm"
        animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.6 }}
        transition={{ duration: 0.2 }}
      >
        <ZoomIn size={13} className="text-white" />
      </motion.div>

      {/* Year badge */}
      <div className="absolute left-2.5 top-2.5 rounded-full border border-cyan-400/25 bg-black/40 px-2 py-0.5 backdrop-blur-sm">
        <span className="font-mono-score text-[9px] uppercase tracking-widest text-cyan-300">
          {memory.year}
        </span>
      </div>

      {/* Caption */}
      <motion.div
        className="absolute inset-x-0 bottom-0 p-3"
        animate={{ y: hovered ? 0 : 5, opacity: hovered ? 1 : 0.7 }}
        transition={{ duration: 0.2 }}
      >
        <p className="font-display text-xs tracking-wide text-ivory-50 drop-shadow-lg sm:text-sm">
          {memory.caption}
        </p>
      </motion.div>

      {/* Glow border */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        animate={{
          boxShadow: hovered
            ? "0 0 0 1.5px rgba(53,215,255,0.5)"
            : "0 0 0 0px rgba(53,215,255,0)",
        }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
}

/* ── Main section ──────────────────────────────────────────── */
export default function MemoriesGallery() {
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-60px" });

  return (
    <section className="relative overflow-hidden bg-[#060c1a] py-24">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[160px]" />
        <div className="absolute bottom-1/4 right-0 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-cyan-500/8 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Heading */}
        <motion.div
          ref={headingRef}
          animate={headingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] as const }}
          className="mb-12 flex flex-col items-center text-center"
        >
          <span className="font-mono-score text-[11px] uppercase tracking-[0.45em] text-gold-400">
            Through The Years
          </span>
          <h2 className="mt-3 font-display text-5xl tracking-wide text-ivory-50 sm:text-6xl">
            The Memories{" "}
            <span className="text-gradient-cyan">Live On.</span>
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-ivory-400">
            Four editions. Countless unforgettable moments on the pitch. Here&apos;s
            a glimpse of the battles, celebrations, and camaraderie that made
            InfoBash what it is today.
          </p>
        </motion.div>

        {/* 
          Grid layout (4 cols, auto-rows-[140px]):
          ┌────────────┬──────┬──────────┐
          │            │  2   │          │
          │     1      ├──────┤    3     │  rows 1-3
          │  (2×3)     │  4   │  (1×3)   │
          │            ├──────┤          │
          │            │  5   │          │
          ├──────┬─────┴─┬────┴──────────┤
          │  6   │   7   │       8       │  rows 4-5
          │      │ (2×2) │               │
          ├──────┼───────┼───────┬───────┤
          │  9   │  10   │  11   │  12   │  row 6
          └──────┴───────┴───────┴───────┘
        */}
        <div className="grid auto-rows-[140px] grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {MEMORIES.map((memory, i) => (
            <Tile key={memory.id} memory={memory} index={i} />
          ))}
        </div>

        {/* Film-reel footer strip */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
          <span className="font-mono-score text-[10px] uppercase tracking-[0.4em] text-ivory-500">
            InfoBash · 2021 – 2024
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
        </div>
      </div>
    </section>
  );
}

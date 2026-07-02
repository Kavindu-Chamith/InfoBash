"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Camera, ZoomIn } from "lucide-react";
import Image from "next/image";

/* ── Each memory tile ──────────────────────────────────────── */
interface Memory {
  id: number;
  year: string;
  caption: string;
  /** Set src to a real image path once photos are available */
  src: string | null;
  /** Tailwind gradient to use when src is null */
  gradient: string;
  /** Bento span classes */
  span: string;
}

const MEMORIES: Memory[] = [
  {
    id: 1,
    year: "InfoBash IV",
    caption: "Champions lift the trophy",
    src: null,
    gradient: "from-blue-900 via-blue-800 to-cyan-700",
    span: "col-span-2 row-span-2",
  },
  {
    id: 2,
    year: "InfoBash IV",
    caption: "Opening ceremony buzz",
    src: null,
    gradient: "from-indigo-900 via-violet-800 to-purple-700",
    span: "col-span-1 row-span-1",
  },
  {
    id: 3,
    year: "InfoBash III",
    caption: "Match-winning six",
    src: null,
    gradient: "from-cyan-900 via-teal-800 to-emerald-700",
    span: "col-span-1 row-span-1",
  },
  {
    id: 4,
    year: "InfoBash III",
    caption: "Wicket! The crowd erupts",
    src: null,
    gradient: "from-sky-900 via-blue-800 to-indigo-700",
    span: "col-span-1 row-span-2",
  },
  {
    id: 5,
    year: "InfoBash II",
    caption: "The legendary final over",
    src: null,
    gradient: "from-slate-800 via-blue-900 to-cyan-900",
    span: "col-span-1 row-span-1",
  },
  {
    id: 6,
    year: "InfoBash II",
    caption: "Team photo — Batch 2021",
    src: null,
    gradient: "from-[#0a0f2e] via-indigo-900 to-blue-800",
    span: "col-span-2 row-span-1",
  },
];

/* ── Decorative SVG cricket-stitching pattern overlay ── */
function CricketOverlay() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-[0.06]"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="cricket-lines" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M0 30 Q15 0 30 30 Q45 60 60 30" stroke="white" strokeWidth="0.8" fill="none" />
          <path d="M0 30 Q15 60 30 30 Q45 0 60 30" stroke="white" strokeWidth="0.8" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#cricket-lines)" />
    </svg>
  );
}

/* ── Single tile ──────────────────────────────────────────── */
function Tile({ memory, index }: { memory: Memory; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className={`group relative overflow-hidden rounded-2xl ${memory.span} cursor-pointer`}
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] as const }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.02 }}
    >
      {/* Image or gradient placeholder */}
      {memory.src ? (
        <Image
          src={memory.src}
          alt={memory.caption}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${memory.gradient}`}>
          <CricketOverlay />
          {/* Placeholder icon */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-30">
            <Camera size={32} className="text-white" />
            <span className="font-mono-score text-[10px] uppercase tracking-widest text-white">
              Photo Coming Soon
            </span>
          </div>
        </div>
      )}

      {/* Persistent dark gradient at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Hover: full overlay */}
      <motion.div
        className="absolute inset-0 bg-cyan-400/10 backdrop-blur-[1px]"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      />

      {/* Hover: zoom icon */}
      <motion.div
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
        animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.7 }}
        transition={{ duration: 0.2 }}
      >
        <ZoomIn size={14} className="text-white" />
      </motion.div>

      {/* Year badge */}
      <div className="absolute left-3 top-3 rounded-full border border-cyan-400/30 bg-navy-950/70 px-2.5 py-1 backdrop-blur-sm">
        <span className="font-mono-score text-[10px] uppercase tracking-widest text-cyan-300">
          {memory.year}
        </span>
      </div>

      {/* Caption */}
      <motion.div
        className="absolute inset-x-0 bottom-0 p-4"
        animate={{ y: hovered ? 0 : 6, opacity: hovered ? 1 : 0.75 }}
        transition={{ duration: 0.25 }}
      >
        <p className="font-display text-sm tracking-wide text-ivory-50 drop-shadow-lg sm:text-base">
          {memory.caption}
        </p>
      </motion.div>

      {/* Glowing border on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        animate={{ boxShadow: hovered ? "0 0 0 1.5px rgba(53,215,255,0.45)" : "0 0 0 0px rgba(53,215,255,0)" }}
        transition={{ duration: 0.25 }}
      />
    </motion.div>
  );
}

/* ── Main section ─────────────────────────────────────────── */
export default function MemoriesGallery() {
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-60px" });

  return (
    <section className="relative overflow-hidden bg-[#060c1a] py-24">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[160px]" />
        <div className="absolute right-0 bottom-1/3 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-cyan-400/8 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Heading */}
        <motion.div
          ref={headingRef}
          animate={headingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] as const }}
          className="mb-14 flex flex-col items-center text-center"
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

        {/* Bento grid */}
        <div className="grid auto-rows-[200px] grid-cols-2 gap-4 sm:auto-rows-[220px] sm:grid-cols-4 lg:auto-rows-[240px]">
          {MEMORIES.map((memory, i) => (
            <Tile key={memory.id} memory={memory} index={i} />
          ))}
        </div>

        {/* Bottom strip — film-reel feel */}
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

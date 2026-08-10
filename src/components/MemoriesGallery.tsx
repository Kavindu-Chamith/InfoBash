"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

/* -- Memory tile data ---------------------------------------- */
interface Memory {
  id: number;
  title: string;
  description: string;
  src: string;
  span: string;
}

const MEMORIES: Memory[] = [
  {
    id: 1,
    title: "Opening Ceremony",
    description: "Faculty members & organizers opening InfoBash V5.0.",
    src: "/gallery/IMG_3599.JPG.jpeg",
    span: "col-span-1 row-span-1 md:row-span-2",
  },
  {
    id: 2,
    title: "Match Preparation",
    description: "Teams gearing up before entering the field.",
    src: "/gallery/IMG_3600.JPG.jpeg",
    span: "col-span-1 row-span-1",
  },
  {
    id: 3,
    title: "Captain Briefing",
    description: "Captains and match referees during team briefing.",
    src: "/gallery/IMG_3601.JPG.jpeg",
    span: "col-span-1 row-span-1",
  },
  {
    id: 4,
    title: "Squad Line-Up",
    description: "Players standing together representing their batch.",
    src: "/gallery/IMG_3602.JPG.jpeg",
    span: "col-span-1 row-span-1",
  },
  {
    id: 5,
    title: "High Octane Action",
    description: "Intensity on the pitch during the tournament rounds.",
    src: "/gallery/IMG_3603.JPG.jpeg",
    span: "col-span-1 row-span-1",
  },
  {
    id: 6,
    title: "Spectator Stands",
    description: "Batches cheering enthusiastically for every boundary.",
    src: "/gallery/IMG_3604.JPG.jpeg",
    span: "col-span-1 row-span-1",
  },
  {
    id: 7,
    title: "Team Unity",
    description: "Squad huddle before strategic overs.",
    src: "/gallery/IMG_3605.JPG.jpeg",
    span: "col-span-1 row-span-1 md:row-span-2",
  },
  {
    id: 8,
    title: "Celebration Moments",
    description: "Wicket celebrations and team camaraderie.",
    src: "/gallery/IMG_3606.JPG.jpeg",
    span: "col-span-1 row-span-1",
  },
  {
    id: 9,
    title: "On-Field Powerplay",
    description: "Aggressive batting and precision bowling.",
    src: "/gallery/IMG_3607.JPG.jpeg",
    span: "col-span-1 row-span-1 md:row-span-2",
  },
  {
    id: 10,
    title: "Organizing Committee",
    description: "Dedicated team behind InfoBash tournament execution.",
    src: "/gallery/IMG_3608.JPG.jpeg",
    span: "col-span-1 row-span-1",
  },
  {
    id: 11,
    title: "Boundary Thrills",
    description: "Unforgettable highlights from the stadium.",
    src: "/gallery/IMG_3609.JPG.jpeg",
    span: "col-span-1 row-span-1",
  },
  {
    id: 12,
    title: "Trophy Presentation",
    description: "Awarding champions and top individual performers.",
    src: "/gallery/IMG_3610.JPG.jpeg",
    span: "col-span-1 row-span-1",
  },
];

/* -- Cricket seam pattern overlay --------------------------- */
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

/* -- Single tile --------------------------------------------- */
function Tile({ memory, index }: { memory: Memory; index: number }) {
  return (
    <motion.div
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-navy-900/40 ${memory.span}`}
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.55, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] as const }}
      whileHover={{ scale: 1.015, transition: { duration: 0.3 } }}
    >
      {/* Background image */}
      <Image
        src={memory.src}
        alt={memory.title}
        fill
        className="object-cover filter grayscale contrast-110 brightness-95 transition-all duration-500 ease-in-out group-hover:grayscale-0 group-hover:scale-105 group-hover:brightness-100"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {/* Glow border on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/0 group-hover:border-cyan-400/30 transition-colors duration-300" />
    </motion.div>
  );
}

/* -- Main section -------------------------------------------- */
export default function MemoriesGallery() {
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-60px" });

  return (
    <section className="relative overflow-hidden bg-navy-950 py-24">
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
          +------------+------+----------+
          |            |  2   |          |
          |     1      +------+    3     |  rows 1-3
          |  (2×3)     |  4   |  (1×3)   |
          |            +------+          |
          |            |  5   |          |
          +------+-----+-+----+----------+
          |  6   |   7   |       8       |  rows 4-5
          |      | (2×2) |               |
          +------+-------+-------+-------+
          |  9   |  10   |  11   |  12   |  row 6
          +------+-------+-------+-------+
        */}
        <div className="grid auto-rows-[200px] grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {MEMORIES.map((memory, i) => (
            <Tile key={memory.id} memory={memory} index={i} />
          ))}
        </div>

        {/* Film-reel footer strip */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-cyan-400/20" />
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">
            Faculty of Computing · InfoBash V5.0
          </span>
          <div className="h-px flex-1 bg-cyan-400/20" />
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRef, useState } from "react";
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
  {
    id: 13,
    title: "Faculty Pride",
    description: "Faculty members celebrating tournament spirit.",
    src: "/gallery/IMG_3611.JPG.jpeg",
    span: "col-span-1 row-span-1",
  },
  {
    id: 14,
    title: "Matchday Energy",
    description: "Vibrant atmosphere all day long at the stadium.",
    src: "/gallery/IMG_3612.JPG.jpeg",
    span: "col-span-1 row-span-1",
  },
  {
    id: 15,
    title: "Champions Moment",
    description: "Lifting the coveted InfoBash championship trophy.",
    src: "/gallery/IMG_3613.JPG.jpeg",
    span: "col-span-1 row-span-1 md:row-span-2",
  },
  {
    id: 16,
    title: "Fellowship & Sportsmanship",
    description: "Post-match handshakes and batch friendships.",
    src: "/gallery/IMG_3614.JPG.jpeg",
    span: "col-span-1 row-span-1",
  },
  {
    id: 17,
    title: "Final Overs",
    description: "Nail-biting finish down to the last ball.",
    src: "/gallery/IMG_3615.JPG.jpeg",
    span: "col-span-1 row-span-1",
  },
  {
    id: 18,
    title: "InfoBash Legacy",
    description: "Creating memories that last a lifetime.",
    src: "/gallery/IMG_3616.JPG.jpeg",
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
/* -- Single tile --------------------------------------------- */
function Tile({
  memory,
  index,
  onClick,
}: {
  memory: Memory;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#070e1c]/80 shadow-lg min-h-[220px]"
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.55, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] as const }}
      whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
    >
      {/* Background image in full crisp resolution */}
      <Image
        src={memory.src}
        alt={memory.title}
        fill
        unoptimized
        className="object-cover object-center transition-all duration-500 group-hover:scale-105"
      />

      {/* Subtle overlay gradient & title caption */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <h4 className="font-display text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
          {memory.title}
        </h4>
        <p className="text-xs text-ivory-300 line-clamp-1 mt-0.5">
          {memory.description}
        </p>
      </div>

      {/* Zoom indicator icon */}
      <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-navy-950/80 text-xs text-ivory-200 opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 backdrop-blur-md">
        🔍
      </div>
    </motion.div>
  );
}

/* -- Main section -------------------------------------------- */
export default function MemoriesGallery() {
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-60px" });
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

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
            Four editions. Countless unforgettable moments on the pitch. Click any image to view full high-definition resolution.
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid auto-rows-[220px] grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {MEMORIES.map((memory, i) => (
            <Tile
              key={memory.id}
              memory={memory}
              index={i}
              onClick={() => setSelectedMemory(memory)}
            />
          ))}
        </div>

        {/* Film-reel footer strip */}
        <div className="mt-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
          <span className="font-mono-score text-[10px] uppercase tracking-[0.4em] text-ivory-500">
            InfoBash · 2021 – 2024
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
        </div>
      </div>

      {/* Full-Screen Zoom Lightbox Modal */}
      {selectedMemory && (
        <div
          onClick={() => setSelectedMemory(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/95 p-4 sm:p-8 backdrop-blur-xl animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col max-h-[90vh] max-w-[92vw] overflow-hidden rounded-2xl border border-cyan-400/30 bg-[#070e1c] p-3 shadow-2xl"
          >
            <button
              onClick={() => setSelectedMemory(null)}
              className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-navy-950/80 text-white border border-white/20 hover:bg-red-500 transition-colors"
            >
              ✕
            </button>

            <div className="relative h-[65vh] w-[85vw] max-w-4xl sm:h-[75vh]">
              <Image
                src={selectedMemory.src}
                alt={selectedMemory.title}
                fill
                unoptimized
                className="object-contain"
              />
            </div>

            <div className="p-3 text-center border-t border-white/10 bg-navy-900/60">
              <h3 className="font-display text-xl font-bold text-cyan-300">
                {selectedMemory.title}
              </h3>
              <p className="mt-1 text-xs text-ivory-300">
                {selectedMemory.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

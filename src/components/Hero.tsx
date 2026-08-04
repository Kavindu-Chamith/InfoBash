"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import ParticleField from "@/components/ParticleField";

/* --- Stagger variants for hero text --- */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

/* --- Photo wall source pool --- */
const GALLERY_POOL = [
  "/gallery/IMG_3599.JPG.jpeg",
  "/gallery/IMG_3600.JPG.jpeg",
  "/gallery/IMG_3601.JPG.jpeg",
  "/gallery/IMG_3602.JPG.jpeg",
  "/gallery/IMG_3603.JPG.jpeg",
  "/gallery/IMG_3604.JPG.jpeg",
  "/gallery/IMG_3605.JPG.jpeg",
  "/gallery/IMG_3606.JPG.jpeg",
  "/gallery/IMG_3607.JPG.jpeg",
  "/gallery/IMG_3608.JPG.jpeg",
  "/gallery/IMG_3609.JPG.jpeg",
  "/gallery/IMG_3610.JPG.jpeg",
  "/gallery/IMG_3611.JPG.jpeg",
  "/gallery/IMG_3612.JPG.jpeg",
  "/gallery/IMG_3613.JPG.jpeg",
  "/gallery/IMG_3614.JPG.jpeg",
  "/gallery/IMG_3615.JPG.jpeg",
  "/gallery/IMG_3616.JPG.jpeg",
];

function pickRow(offset: number, count: number) {
  return Array.from({ length: count }, (_, i) => GALLERY_POOL[(offset + i) % GALLERY_POOL.length]);
}

// 16 tiles/row — enough to span full-bleed widths up to ultra-wide monitors
const ROW1 = pickRow(0, 16);
const ROW2 = pickRow(4, 16);
const ROW3 = pickRow(8, 16);

// Doubled so the row can loop seamlessly: animating x from 0 to -50% of this
// doubled track lines the second copy up exactly where the first started.
const ROW1_LOOP = [...ROW1, ...ROW1];
const ROW2_LOOP = [...ROW2, ...ROW2];
const ROW3_LOOP = [...ROW3, ...ROW3];

const TILE_SIZE = "calc((100dvh - 64px - 24px) / 3)";

function PhotoTile({ src }: { src: string }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl border border-cyan-400/20 bg-[#070e1c]"
      style={{ height: TILE_SIZE, width: "calc(TILE_SIZE * 1.35)" }}
    >
      <Image
        src={src}
        alt=""
        fill
        unoptimized
        className="object-cover object-center transition-transform duration-700 hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950/20 via-transparent to-cyan-400/10" />
    </div>
  );
}

export default function Hero() {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const row3Ref = useRef<HTMLDivElement>(null);

  // Continuous auto-scrolling photo rows — time-based, not scroll-linked.
  // Earlier this was a GSAP ScrollTrigger pin+scrub, which never worked
  // reliably (fought the preloader's temporary body scroll-lock, the global
  // `overflow-x` rule, and touch scroll on mobile). A duration-based loop
  // sidesteps all of that since it doesn't care about scroll position at all.
  useEffect(() => {
    const anims: gsap.core.Tween[] = [];

    if (row1Ref.current) {
      anims.push(gsap.fromTo(row1Ref.current, { x: 0 }, { x: "-50%", duration: 25, ease: "none", repeat: -1 }));
    }
    if (row2Ref.current) {
      gsap.set(row2Ref.current, { x: "-50%" });
      anims.push(gsap.to(row2Ref.current, { x: 0, duration: 22, ease: "none", repeat: -1 }));
    }
    if (row3Ref.current) {
      anims.push(gsap.fromTo(row3Ref.current, { x: 0 }, { x: "-50%", duration: 28, ease: "none", repeat: -1 }));
    }

    return () => anims.forEach((a) => a.kill());
  }, []);

  return (
    <section className="relative flex h-[calc(100dvh-64px)] min-h-[580px] items-center justify-center overflow-hidden">

      {/* -- Background -- */}
      <div className="absolute inset-0 bg-[#060c1a]" />

      {/* -- Full-bleed photo wall -- */}
      <div className="absolute inset-0 flex flex-col justify-center gap-3">
        <div className="overflow-hidden">
          <div ref={row1Ref} className="flex w-max gap-3">
            {ROW1_LOOP.map((src, i) => <PhotoTile key={`r1-${i}`} src={src} />)}
          </div>
        </div>
        <div className="overflow-hidden">
          <div ref={row2Ref} className="flex w-max gap-3">
            {ROW2_LOOP.map((src, i) => <PhotoTile key={`r2-${i}`} src={src} />)}
          </div>
        </div>
        <div className="overflow-hidden">
          <div ref={row3Ref} className="flex w-max gap-3">
            {ROW3_LOOP.map((src, i) => <PhotoTile key={`r3-${i}`} src={src} />)}
          </div>
        </div>
      </div>

      {/* Radial vignette — dark centre so the headline stays readable, fades to the photos at the edges */}
      <div
        className="pointer-events-none absolute inset-0 z-[6]"
        style={{
          background:
            "radial-gradient(ellipse 62% 68% at 50% 50%, rgba(6,12,26,0.9) 0%, rgba(6,12,26,0.72) 32%, rgba(6,12,26,0.32) 62%, transparent 100%)",
        }}
      />

      {/* Edge fades — blend the wall into the page background */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[7] w-24 bg-gradient-to-r from-[#060c1a] to-transparent sm:w-40" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[7] w-24 bg-gradient-to-l from-[#060c1a] to-transparent sm:w-40" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[7] h-20 bg-gradient-to-b from-[#060c1a] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[7] h-20 bg-gradient-to-t from-[#060c1a] to-transparent" />

      {/* Pitch grid — subtle texture over the wall */}
      <div
        className="pointer-events-none absolute inset-0 z-[8] opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(53,215,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(53,215,255,1) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Ambient particles */}
      <div className="absolute inset-0 z-[8]">
        <ParticleField density={50} />
      </div>

      {/* Glow orbs — static, no scroll motion */}
      <div className="pointer-events-none absolute -top-24 left-1/3 z-[8] h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/3 z-[8] h-[400px] w-[400px] animate-pulse-glow rounded-full bg-cyan-400/10 blur-[140px]" />

      {/* -- CENTERED CONTENT -- */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center sm:px-8"
      >
        {/* Eyebrow */}
        <motion.div variants={item} className="mb-5 flex items-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-cyan-400" />
          <span className="font-mono-score text-[11px] uppercase tracking-[0.45em] text-gold-400">
            Faculty of Computing · SUSL
          </span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-cyan-400" />
        </motion.div>

        {/* Main headline */}
        <motion.h1
          variants={item}
          className="text-shimmer font-display text-center leading-[0.88] tracking-wide"
          style={{ fontSize: "clamp(3.4rem, 9vw, 7.5rem)" }}
        >
          LIVE FOR
          <br />
          <span className="relative inline-block">
            CRICKET
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -bottom-1.5 left-0 h-[3px] w-full origin-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
            />
          </span>
        </motion.h1>

        {/* Version badge */}
        <motion.div variants={item} className="mt-3 flex items-center gap-3">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-400/50" />
          <span className="font-display text-2xl tracking-[0.25em] text-gold-400">V5.0</span>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold-400/50" />
        </motion.div>

        {/* Sub-text */}
        <motion.p
          variants={item}
          className="mt-5 max-w-sm text-[15px] leading-relaxed text-ivory-200"
        >
          The passion. The drama. The glory.
          <br />
          Every match. Every moment.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={item}
          className="mt-7 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/register"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 px-7 py-3.5 text-sm font-bold text-navy-950 shadow-[0_0_36px_-6px_rgba(53,215,255,0.85)] transition-all hover:scale-105 hover:shadow-[0_0_52px_-6px_rgba(53,215,255,1)]"
          >
            {/* shimmer */}
            <motion.span
              className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: "-110%" }}
              animate={{ x: "210%" }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.2, ease: "easeInOut" }}
            />
            <span className="relative z-10 flex items-center gap-2">
              Register Your Team
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/rules"
            className="group inline-flex items-center gap-2 rounded-full border border-cyan-400/30 px-7 py-3.5 text-sm font-semibold text-ivory-100 transition-all hover:border-cyan-400/60 hover:bg-cyan-400/5 hover:text-cyan-300"
          >
            View Rules
            <ArrowRight size={13} className="-translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

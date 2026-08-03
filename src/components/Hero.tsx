"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ParticleField from "@/components/ParticleField";

gsap.registerPlugin(ScrollTrigger);

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
  "/images/gallery-1.jpg",
  "/images/gallery-2.jpg",
  "/images/gallery-3.jpg",
  "/images/gallery-4.jpg",
  "/images/gallery-5.jpg",
  "/images/gallery-6.jpg",
  "/images/gallery-7.jpg",
  "/images/gallery-8.jpg",
  "/images/gallery-9.jpg",
  "/images/gallery-10.jpg",
  "/images/gallery-11.jpg",
  "/images/gallery-12.jpg",
  "/images/cricket-hero.png",
];

function pickRow(offset: number, count: number) {
  return Array.from({ length: count }, (_, i) => GALLERY_POOL[(offset + i) % GALLERY_POOL.length]);
}

// 16 tiles/row — enough to span full-bleed widths up to ultra-wide monitors
const ROW1 = pickRow(0, 16);
const ROW2 = pickRow(4, 16);
const ROW3 = pickRow(8, 16);

const TILE_SIZE = "calc((100dvh - 64px - 24px) / 3)";

function PhotoTile({ src }: { src: string }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl border border-cyan-400/10"
      style={{ height: TILE_SIZE, width: TILE_SIZE }}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="280px"
        className="object-cover"
        style={{ filter: "saturate(0.6) contrast(1.05)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950/35 via-transparent to-cyan-400/10" />
    </div>
  );
}

export default function Hero() {
  const outerRef = useRef<HTMLDivElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const row3Ref = useRef<HTMLDivElement>(null);

  // Full-bleed row parallax — pinned + scroll-driven on all breakpoints.
  // ignoreMobileResize stops GSAP from re-pinning every time the mobile
  // address bar shows/hides mid-scroll, which is what broke this on touch.
  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });
    const mm = gsap.matchMedia();

    mm.add(
      { isMobile: "(max-width: 1023.98px)" },
      (context) => {
        const { isMobile } = context.conditions as { isMobile: boolean };
        const scale = isMobile ? 0.5 : 1;
        const scrollOpts = { trigger: outerRef.current, start: "top top", end: "bottom bottom" };

        gsap.fromTo(row1Ref.current, { x: 0 }, { x: -640 * scale, ease: "none", scrollTrigger: { ...scrollOpts, scrub: 1.6 } });
        gsap.fromTo(row2Ref.current, { x: -640 * scale }, { x: 80 * scale, ease: "none", scrollTrigger: { ...scrollOpts, scrub: 1.1 } });
        gsap.fromTo(row3Ref.current, { x: 60 * scale }, { x: -720 * scale, ease: "none", scrollTrigger: { ...scrollOpts, scrub: 0.8 } });
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <div ref={outerRef} className="relative h-[180vh] lg:h-[220vh]">
      <section className="sticky top-16 flex h-[calc(100dvh-64px)] min-h-[580px] items-center justify-center overflow-hidden">

        {/* -- Background -- */}
        <div className="absolute inset-0 bg-[#060c1a]" />

        {/* -- Full-bleed photo wall -- */}
        <div className="absolute inset-0 flex flex-col justify-center gap-3">
          <div className="overflow-hidden">
            <div ref={row1Ref} className="flex w-max gap-3">
              {ROW1.map((src, i) => <PhotoTile key={`r1-${i}`} src={src} />)}
            </div>
          </div>
          <div className="overflow-hidden">
            <div ref={row2Ref} className="flex w-max gap-3">
              {ROW2.map((src, i) => <PhotoTile key={`r2-${i}`} src={src} />)}
            </div>
          </div>
          <div className="overflow-hidden">
            <div ref={row3Ref} className="flex w-max gap-3">
              {ROW3.map((src, i) => <PhotoTile key={`r3-${i}`} src={src} />)}
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

          {/* Stat pills */}
          <motion.div variants={item} className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              { label: "One-Day Format", dot: "bg-cyan-400" },
              { label: "11-A-Side", dot: "bg-gold-400" },
              { label: "4 Batches", dot: "bg-blue-500" },
              { label: "Inter-Batch Rivalry", dot: "bg-cyan-300" },
            ].map(({ label, dot }) => (
              <span
                key={label}
                className="flex items-center gap-2 rounded-full border border-cyan-400/15 bg-navy-800/60 px-3 py-1.5 text-xs font-medium text-ivory-400 backdrop-blur-sm"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                {label}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="font-mono-score text-[10px] uppercase tracking-[0.3em] text-ivory-500">Scroll</span>
          <svg width="14" height="18" viewBox="0 0 14 18" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="12" height="16" rx="6" stroke="rgba(232,229,223,0.35)" strokeWidth="1.2" />
            <circle cx="7" cy="6" r="1.4" fill="rgba(53,215,255,0.7)" />
          </svg>
        </motion.div>
      </section>
    </div>
  );
}

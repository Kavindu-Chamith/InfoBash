"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Users,
  ShieldCheck,
  Trophy,
  CalendarDays,
  MapPin,
} from "lucide-react";
import ParticleField from "@/components/ParticleField";
import ScoreTicker from "@/components/ScoreTicker";
import Countdown from "@/components/Countdown";
import MemoriesGallery from "@/components/MemoriesGallery";
import { TOURNAMENT_INFO } from "@/lib/config";

/* ─── Reveal on scroll ─── */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Stagger variants for hero text ─── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Home() {
  return (
    <>
      {/* ══════════════════════════════════════
          HERO  
      ══════════════════════════════════════ */}
      <section className="relative flex h-[calc(100vh-64px)] min-h-[580px] items-center overflow-hidden">

        {/* ── Background ── */}
        <div className="absolute inset-0 bg-[#060c1a]" />

        {/* Pitch grid */}
        <div
          className="absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(53,215,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(53,215,255,1) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* Ambient particles */}
        <ParticleField density={50} />

        {/* Glow orbs — static, no scroll motion */}
        <div className="pointer-events-none absolute -top-24 left-1/3 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[150px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-[400px] w-[400px] animate-pulse-glow rounded-full bg-cyan-400/10 blur-[140px]" />

        {/* ── TWO-COLUMN LAYOUT ── */}
        <div className="relative z-10 grid h-full w-full grid-cols-1 items-center lg:grid-cols-2">

          {/* ── LEFT: Text content ── */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex h-full flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24"
          >
            {/* Eyebrow */}
            <motion.div variants={item} className="mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-gradient-to-r from-cyan-400 to-transparent" />
              <span className="font-mono-score text-[11px] uppercase tracking-[0.45em] text-gold-400">
                Faculty of Computing · SUSL
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              variants={item}
              className="font-display leading-[0.88] tracking-wide text-ivory-50"
              style={{ fontSize: "clamp(3.6rem, 8vw, 7.5rem)" }}
            >
              LIVE FOR
              <br />
              <span className="relative inline-block text-gradient-cyan">
                CRICKET
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -bottom-1.5 left-0 h-[3px] w-full origin-left rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                />
              </span>
            </motion.h1>

            {/* Version badge */}
            <motion.div variants={item} className="mt-3 flex items-center gap-3">
              <span className="font-display text-2xl tracking-[0.25em] text-gold-400">V5.0</span>
              <span className="h-px w-16 bg-gradient-to-r from-gold-400/50 to-transparent" />
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
              className="mt-7 flex flex-wrap items-center gap-3"
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
            <motion.div variants={item} className="mt-6 flex flex-wrap gap-2">
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

          {/* ── RIGHT: Full-bleed cricket image ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.15, ease: "easeOut" }}
            className="relative hidden h-full overflow-hidden lg:block"
          >
            {/* The actual image — fills the entire right half */}
            <Image
              src="/images/cricket-hero.png"
              alt="Cricket batsman hitting a powerful shot in a floodlit stadium"
              fill
              priority
              className="object-cover object-center"
              sizes="50vw"
            />

            {/* Top-edge blend */}
            <div className="absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-[#060c1a]/70 to-transparent" />

            {/* Bottom-edge blend */}
            <div className="absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-[#060c1a] to-transparent" />

            {/* Right-edge blend (blends to nothing, no hard edge) */}
            <div className="absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#060c1a]/40 to-transparent" />

            {/* Cyan tint overlay for color coherence */}
            <div className="absolute inset-0 z-[5] bg-gradient-to-bl from-transparent via-transparent to-blue-900/20" />

            {/* Floating badge — Edition */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card absolute right-8 top-[20%] z-20 rounded-2xl px-5 py-3.5 text-center"
            >
              <p className="font-display text-3xl leading-none text-cyan-400">5th</p>
              <p className="mt-1 font-mono-score text-[10px] uppercase tracking-widest text-ivory-400">
                Edition
              </p>
            </motion.div>

            {/* Floating badge — Teams */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card absolute bottom-[22%] right-10 z-20 rounded-2xl px-5 py-3.5 text-center"
            >
              <p className="font-display text-3xl leading-none text-gold-400">15+</p>
              <p className="mt-1 font-mono-score text-[10px] uppercase tracking-widest text-ivory-400">
                Teams
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <ScoreTicker />

      {/* ══════════════════════════════════════
          COUNTDOWN  —  Big, centered, standalone
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-navy-900 py-16">
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[400px] w-[700px] rounded-full bg-blue-600/10 blur-[120px]" />
        </div>

        <Reveal className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
          <span className="font-mono-score text-xs uppercase tracking-[0.4em] text-cyan-400">
            Countdown to Match Day
          </span>
          <div className="mt-8 w-full">
            <Countdown />
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════
          ABOUT / FEATURES
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-navy-900 py-24">
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[160px]" />
        <div className="relative mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="font-mono-score text-xs uppercase tracking-[0.35em] text-cyan-400">
              What is InfoBash
            </span>
            <h2 className="mt-3 font-display text-5xl tracking-wide text-ivory-50 sm:text-6xl">
              Batch vs Batch.{" "}
              <span className="text-gradient-gold">Bragging Rights</span> On The Line.
            </h2>
            <p className="mt-5 text-ivory-300">
              InfoBash is the Faculty of Computing&apos;s flagship cricket tournament —
              a one-day battle between teams from every batch. Now in its fifth
              edition, it&apos;s bigger, faster, and more competitive than ever.
            </p>
          </Reveal>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: CalendarDays,
                title: "One-Day Format",
                desc: "A fast-paced, single-day knockout tournament — every over counts.",
              },
              {
                icon: Users,
                title: "11-A-Side Squads",
                desc: "Full teams of 11 players, with at least 2 female players required per squad.",
              },
              {
                icon: ShieldCheck,
                title: "4 Batches Compete",
                desc: "2–3 teams register per batch, bringing rival years head-to-head.",
              },
              {
                icon: Trophy,
                title: "The InfoBash Trophy",
                desc: "One champion team lifts the trophy and the faculty's respect.",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -5, transition: { duration: 0.18 } }}
                className="glass-card rounded-2xl p-6 transition-colors hover:border-cyan-400/40"
              >
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-600/30 to-cyan-400/20 text-cyan-300">
                  <f.icon size={22} />
                </div>
                <h3 className="font-display text-xl tracking-wide text-ivory-50">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ivory-400">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          MEMORIES GALLERY
      ══════════════════════════════════════ */}
      <MemoriesGallery />

      {/* ══════════════════════════════════════
          VENUE / CTA
      ══════════════════════════════════════ */}
      <section className="relative border-y border-cyan-400/10 bg-navy-950 py-16">
        <Reveal>
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 text-center">
            <div className="flex items-center gap-2 text-cyan-300">
              <MapPin size={18} />
              <span className="font-mono-score text-sm tracking-wide">
                {TOURNAMENT_INFO.venue}
              </span>
            </div>
            <h2 className="font-display text-4xl tracking-wide text-ivory-50 sm:text-5xl">
              Gather your squad.{" "}
              <span className="text-gradient-cyan">Register before slots fill up.</span>
            </h2>
            <Link
              href="/register"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 px-8 py-3.5 text-sm font-semibold text-navy-950 shadow-[0_0_30px_-6px_rgba(53,215,255,0.8)] transition-transform hover:scale-105"
            >
              Register Your Team <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}

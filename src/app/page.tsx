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

            {/* Left-edge blend: merges seamlessly into the dark left panel */}
            <div className="absolute inset-y-0 left-0 z-10 w-48 bg-gradient-to-r from-[#060c1a] via-[#060c1a]/75 to-transparent" />

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
                accent: "from-cyan-400/20 to-blue-500/20",
                glow: "rgba(53,215,255,0.35)",
                iconColor: "text-cyan-300",
                iconBg: "from-cyan-500/25 to-blue-600/25",
                borderGlow: "rgba(53,215,255,0.5)",
              },
              {
                icon: Users,
                title: "11-A-Side Squads",
                desc: "Full teams of 11 players, with at least 2 female players required per squad.",
                accent: "from-gold-400/20 to-gold-300/10",
                glow: "rgba(245,185,66,0.35)",
                iconColor: "text-gold-300",
                iconBg: "from-gold-400/25 to-gold-300/15",
                borderGlow: "rgba(245,185,66,0.5)",
              },
              {
                icon: ShieldCheck,
                title: "4 Batches Compete",
                desc: "2–3 teams register per batch, bringing rival years head-to-head.",
                accent: "from-cyan-400/20 to-blue-500/20",
                glow: "rgba(53,215,255,0.35)",
                iconColor: "text-cyan-300",
                iconBg: "from-cyan-500/25 to-blue-600/25",
                borderGlow: "rgba(53,215,255,0.5)",
              },
              {
                icon: Trophy,
                title: "The InfoBash Trophy",
                desc: "One champion team lifts the trophy and the faculty's respect.",
                accent: "from-gold-400/20 to-gold-300/10",
                glow: "rgba(245,185,66,0.35)",
                iconColor: "text-gold-300",
                iconBg: "from-gold-400/25 to-gold-300/15",
                borderGlow: "rgba(245,185,66,0.5)",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.22 } }}
                className="group relative overflow-hidden rounded-2xl border border-white/8 cursor-pointer"
                style={{
                  background: "linear-gradient(145deg, rgba(13,19,52,0.95) 0%, rgba(8,13,38,0.98) 100%)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                {/* Starfield dot pattern — hidden by default, spreads from bottom-left corner on hover */}
                <div
                  className="absolute inset-0 transition-all duration-700 ease-out"
                  style={{
                    backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)`,
                    backgroundSize: "22px 22px",
                    WebkitMaskImage: "radial-gradient(ellipse 0% 0% at 0% 100%, black 0%, transparent 70%)",
                    maskImage: "radial-gradient(ellipse 0% 0% at 0% 100%, black 0%, transparent 70%)",
                  }}
                />
                {/* Dot spread layer — expands on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out"
                  style={{
                    backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)`,
                    backgroundSize: "22px 22px",
                    WebkitMaskImage: "radial-gradient(ellipse 180% 180% at 0% 100%, black 40%, transparent 75%)",
                    maskImage: "radial-gradient(ellipse 180% 180% at 0% 100%, black 40%, transparent 75%)",
                  }}
                />

                {/* Top glow blob */}
                <div
                  className="absolute -top-8 left-1/2 -translate-x-1/2 h-24 w-24 rounded-full blur-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-500"
                  style={{ background: f.glow }}
                />

                {/* Shimmer sweep on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none" />

                {/* Glowing border on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: `inset 0 0 0 1px ${f.borderGlow}` }}
                />

                {/* Content */}
                <div className="relative z-10 p-7 flex flex-col gap-5">
                  {/* Icon badge */}
                  <div
                    className={`h-14 w-14 rounded-xl bg-gradient-to-br ${f.iconBg} flex items-center justify-center border border-white/10 shadow-lg`}
                    style={{ boxShadow: `0 0 20px ${f.glow}` }}
                  >
                    <f.icon size={24} className={f.iconColor} />
                  </div>

                  <div>
                    <h3 className="font-display text-2xl tracking-wide text-ivory-50 leading-tight">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ivory-400 group-hover:text-ivory-200 transition-colors duration-300">
                      {f.desc}
                    </p>
                  </div>
                </div>

                {/* Bottom spacer */}
                <div className="relative z-10 px-7 pb-2">
                </div>
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
          MEDIA PARTNER — Lumetrix Media
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-navy-950 py-20">
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[350px] w-[700px] rounded-full bg-gold-400/5 blur-[120px]" />
        </div>

        <Reveal className="relative z-10 mx-auto max-w-4xl px-6">
          {/* Eyebrow */}
          <div className="mb-10 flex flex-col items-center gap-2 text-center">
            <span className="font-mono-score text-[10px] uppercase tracking-[0.5em] text-ivory-500">
              Official Media Partner
            </span>
            <div className="flex items-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold-400/60" />
              <span className="animate-pulse h-1.5 w-1.5 rounded-full bg-gold-400" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold-400/60" />
            </div>
          </div>

          {/* Card */}
          <div className="relative overflow-hidden rounded-3xl border border-gold-400/15 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 shadow-[0_0_60px_-20px_rgba(212,175,55,0.15)] backdrop-blur-sm sm:p-12">
            {/* Corner accents */}
            <span className="absolute left-0 top-0 h-20 w-20 rounded-br-full border-b border-r border-gold-400/20" />
            <span className="absolute bottom-0 right-0 h-20 w-20 rounded-tl-full border-l border-t border-gold-400/20" />

            {/* Partner name */}
            <div className="mb-8 text-center">
              <h2 className="font-display text-4xl tracking-wide text-gold-400 sm:text-5xl">
                Lumetrix Media
              </h2>
              <p className="mt-2 text-sm text-ivory-400">
                Capturing every boundary, wicket &amp; celebration — follow for live coverage
              </p>
            </div>

            {/* Social links */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {/* YouTube */}
              <motion.a
                href="https://youtube.com/@lumetrixmedia"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="group flex flex-col items-center gap-3"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#FF0000]/10 transition-all duration-300 group-hover:border-[#FF0000]/50 group-hover:bg-[#FF0000]/20 group-hover:shadow-[0_0_24px_-4px_#FF0000]">
                  <svg viewBox="0 0 24 24" className="h-7 w-7 fill-[#FF0000]" aria-hidden="true">
                    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
                  </svg>
                </div>
                <span className="font-mono-score text-[10px] uppercase tracking-widest text-ivory-400 transition-colors group-hover:text-[#FF0000]">
                  YouTube
                </span>
              </motion.a>

              {/* Instagram */}
              <motion.a
                href="https://instagram.com/lumetrixmedia"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="group flex flex-col items-center gap-3"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-pink-600/10 transition-all duration-300 group-hover:border-pink-500/50 group-hover:bg-pink-600/20 group-hover:shadow-[0_0_24px_-4px_#E1306C]">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
                    <defs>
                      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f09433"/>
                        <stop offset="25%" stopColor="#e6683c"/>
                        <stop offset="50%" stopColor="#dc2743"/>
                        <stop offset="75%" stopColor="#cc2366"/>
                        <stop offset="100%" stopColor="#bc1888"/>
                      </linearGradient>
                    </defs>
                    <path fill="url(#ig-grad)" d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12c0-3.2 0-3.6.1-4.8.1-3.3 1.7-4.8 4.9-4.9 1.2-.1 1.6-.1 4.8-.1zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1.0 8.3 0 8.7 0 12c0 3.3 0 3.7.1 4.9.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24c3.3 0 3.7 0 4.9-.1 4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9 0-3.3 0-3.7-.1-4.9C23.7 2.7 21.3.3 16.9.1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>
                  </svg>
                </div>
                <span className="font-mono-score text-[10px] uppercase tracking-widest text-ivory-400 transition-colors group-hover:text-pink-400">
                  Instagram
                </span>
              </motion.a>

              {/* Facebook */}
              <motion.a
                href="https://facebook.com/lumetrixmedia"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="group flex flex-col items-center gap-3"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#1877F2]/10 transition-all duration-300 group-hover:border-[#1877F2]/50 group-hover:bg-[#1877F2]/20 group-hover:shadow-[0_0_24px_-4px_#1877F2]">
                  <svg viewBox="0 0 24 24" className="h-7 w-7 fill-[#1877F2]" aria-hidden="true">
                    <path d="M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1c0 6 4.4 11 10.1 11.9v-8.4H7.1v-3.5h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9v2.3h3.4l-.5 3.5h-2.8v8.4C19.6 23.1 24 18.2 24 12.1z"/>
                  </svg>
                </div>
                <span className="font-mono-score text-[10px] uppercase tracking-widest text-ivory-400 transition-colors group-hover:text-[#1877F2]">
                  Facebook
                </span>
              </motion.a>

              {/* TikTok */}
              <motion.a
                href="https://tiktok.com/@lumetrixmedia"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="group flex flex-col items-center gap-3"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-white/30 group-hover:bg-white/10 group-hover:shadow-[0_0_24px_-4px_rgba(255,255,255,0.4)]">
                  <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white" aria-hidden="true">
                    <path d="M19.6 3.3A4.5 4.5 0 0 1 15.2 0h-3.4v16c0 1.5-1.2 2.7-2.7 2.7a2.7 2.7 0 0 1-2.7-2.7 2.7 2.7 0 0 1 2.7-2.7c.3 0 .5 0 .8.1V9.9a6.2 6.2 0 0 0-.8-.1A6.1 6.1 0 0 0 3 15.9a6.1 6.1 0 0 0 6.1 6.1 6.1 6.1 0 0 0 6.1-6.1V8.2a7.8 7.8 0 0 0 4.6 1.5V6.3a4.6 4.6 0 0 1-2.2-3z"/>
                  </svg>
                </div>
                <span className="font-mono-score text-[10px] uppercase tracking-widest text-ivory-400 transition-colors group-hover:text-white">
                  TikTok
                </span>
              </motion.a>
            </div>
          </div>
        </Reveal>
      </section>

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

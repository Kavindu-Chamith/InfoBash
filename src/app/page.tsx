"use client";

import Link from "next/link";
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
import Hero from "@/components/Hero";
import Countdown from "@/components/Countdown";
import MemoriesGallery from "@/components/MemoriesGallery";
import { TOURNAMENT_INFO } from "@/lib/config";

/* --- Reveal on scroll --- */
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

export default function Home() {
  return (
    <>
      <Hero />

      {/* ══════════════════════════════════════
          COUNTDOWN  —  Big, centered, standalone
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-navy-950 py-16">
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[400px] w-[700px] rounded-full bg-[#FF6B00]/10 blur-[120px]" />
        </div>

        <Reveal className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
          <span className="font-mono-score text-xs uppercase tracking-[0.4em] text-orange-400">
            Countdown to Match Day
          </span>
          <div className="mt-8 w-full">
            <Countdown />
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════
          ABOUT / DETAILS (Proposal Context)
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-navy-950 py-16">
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF6B00]/10 blur-[160px]" />
        <div className="relative mx-auto max-w-4xl px-6">
          <Reveal className="text-center">
            <span className="font-mono-score text-xs uppercase tracking-[0.35em] text-orange-400">
              What is InfoBash 5.0
            </span>
            <h2 className="mt-3 font-display text-5xl tracking-wide text-ivory-50 sm:text-6xl">
              Unity, Sportsmanship &amp;{" "}
              <span className="text-gradient-gold">Healthy Competition</span>
            </h2>
          </Reveal>

          <Reveal delay={0.15} className="mt-8 space-y-6 text-ivory-300 text-base sm:text-lg leading-relaxed text-justify sm:text-center font-normal">
            <p>
              <strong className="text-white font-semibold">INFO BASH V5.0   </strong> is the annual cricket tournament organized by the Sports Sub Committee of the Students&apos; Union, Faculty of Computing at Sabaragamuwa University of Sri Lanka. Building on the resounding success of four previous editions, INFO BASH V5.0 serves as a flagship event designed to bring together undergraduates and academic staff in a spirit of teamwork, sportsmanship, and healthy competition while strengthening unity across the faculty.
            </p>
            <p>
              The primary aim of INFO BASH V5.0 is to promote holistic development by providing a vibrant platform for students and lecturers to showcase their athletic talent. Beyond the boundaries of the pitch, the tournament strives to foster confidence, leadership, decision-making, and mutual respect in an informal and engaging environment that contributes directly to personal growth and well-being.
            </p>
          </Reveal>
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
                href="https://www.youtube.com/@LumetrixMedia"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="group flex flex-col items-center gap-3"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#FF0000]/10 transition-all duration-300 group-hover:border-[#FF0000]/50 group-hover:bg-[#FF0000]/20 group-hover:shadow-[0_0_24px_-4px_#FF0000]">
                  <svg viewBox="0 0 24 24" className="h-7 w-7 fill-[#FF0000]" aria-hidden="true">
                    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z" />
                  </svg>
                </div>
                <span className="font-mono-score text-[10px] uppercase tracking-widest text-ivory-400 transition-colors group-hover:text-[#FF0000]">
                  YouTube
                </span>
              </motion.a>

              {/* Instagram */}
              <motion.a
                href="https://www.instagram.com/Lumetrix_Media/"
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
                        <stop offset="0%" stopColor="#f09433" />
                        <stop offset="25%" stopColor="#e6683c" />
                        <stop offset="50%" stopColor="#dc2743" />
                        <stop offset="75%" stopColor="#cc2366" />
                        <stop offset="100%" stopColor="#bc1888" />
                      </linearGradient>
                    </defs>
                    <path fill="url(#ig-grad)" d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12c0-3.2 0-3.6.1-4.8.1-3.3 1.7-4.8 4.9-4.9 1.2-.1 1.6-.1 4.8-.1zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1.0 8.3 0 8.7 0 12c0 3.3 0 3.7.1 4.9.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24c3.3 0 3.7 0 4.9-.1 4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9 0-3.3 0-3.7-.1-4.9C23.7 2.7 21.3.3 16.9.1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
                  </svg>
                </div>
                <span className="font-mono-score text-[10px] uppercase tracking-widest text-ivory-400 transition-colors group-hover:text-pink-400">
                  Instagram
                </span>
              </motion.a>

              {/* Facebook */}
              <motion.a
                href="https://facebook.com/share/1BE9KQkWtL/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="group flex flex-col items-center gap-3"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#1877F2]/10 transition-all duration-300 group-hover:border-[#1877F2]/50 group-hover:bg-[#1877F2]/20 group-hover:shadow-[0_0_24px_-4px_#1877F2]">
                  <svg viewBox="0 0 24 24" className="h-7 w-7 fill-[#1877F2]" aria-hidden="true">
                    <path d="M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1c0 6 4.4 11 10.1 11.9v-8.4H7.1v-3.5h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9v2.3h3.4l-.5 3.5h-2.8v8.4C19.6 23.1 24 18.2 24 12.1z" />
                  </svg>
                </div>
                <span className="font-mono-score text-[10px] uppercase tracking-widest text-ivory-400 transition-colors group-hover:text-[#1877F2]">
                  Facebook
                </span>
              </motion.a>

              {/* TikTok */}
              <motion.a
                href="https://www.tiktok.com/@lumetrixmedialink"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="group flex flex-col items-center gap-3"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-white/30 group-hover:bg-white/10 group-hover:shadow-[0_0_24px_-4px_rgba(255,255,255,0.4)]">
                  <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white" aria-hidden="true">
                    <path d="M19.6 3.3A4.5 4.5 0 0 1 15.2 0h-3.4v16c0 1.5-1.2 2.7-2.7 2.7a2.7 2.7 0 0 1-2.7-2.7 2.7 2.7 0 0 1 2.7-2.7c.3 0 .5 0 .8.1V9.9a6.2 6.2 0 0 0-.8-.1A6.1 6.1 0 0 0 3 15.9a6.1 6.1 0 0 0 6.1 6.1 6.1 6.1 0 0 0 6.1-6.1V8.2a7.8 7.8 0 0 0 4.6 1.5V6.3a4.6 4.6 0 0 1-2.2-3z" />
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
      <section className="relative border-y border-orange-500/15 bg-navy-950 py-16">
        <Reveal>
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 text-center">
            <div className="flex items-center gap-2 text-orange-400 font-semibold">
              <MapPin size={18} />
              <span className="font-mono-score text-sm tracking-wide">
                {TOURNAMENT_INFO.venue}
              </span>
            </div>
            <h2 className="font-display text-4xl tracking-wide text-ivory-50 sm:text-5xl">
              Gather your squad.{" "}
              <span className="text-gradient-gold">Register before slots fill up.</span>
            </h2>
            <Link
              href="/register"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_30px_-6px_rgba(255,107,0,0.8)] transition-transform hover:scale-105"
            >
              Register Your Team <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}

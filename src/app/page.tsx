"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Users, ShieldCheck, Trophy, CalendarDays, MapPin } from "lucide-react";
import ParticleField from "@/components/ParticleField";
import ScoreTicker from "@/components/ScoreTicker";
import Countdown from "@/components/Countdown";
import StatCounter from "@/components/StatCounter";
import { TOURNAMENT_INFO } from "@/lib/config";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[92vh] flex-col justify-center overflow-hidden pitch-lines">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-950/95 to-navy-900" />
        <ParticleField density={60} />

        <div className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-blue-600/25 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/3 right-10 h-80 w-80 animate-pulse-glow rounded-full bg-cyan-400/20 blur-[110px]" />
        <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-full bg-gold-400/10 blur-[110px]" />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-6 animate-float"
          >
            <Image
              src="/images/logo.png"
              alt="InfoBash v5.0 logo"
              width={150}
              height={150}
              priority
              className="h-28 w-28 object-contain drop-shadow-[0_0_35px_rgba(53,215,255,0.35)] sm:h-36 sm:w-36"
            />
          </motion.div>

          <motion.p
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-mono-score text-xs uppercase tracking-[0.4em] text-gold-400 sm:text-sm"
          >
            Faculty of Computing · Sabaragamuwa University of Sri Lanka
          </motion.p>

          <motion.h1
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="mt-4 font-display text-7xl leading-none tracking-wide text-ivory-50 sm:text-9xl"
          >
            INFO<span className="text-gradient-cyan">BASH</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-2 font-display text-2xl tracking-[0.3em] text-gold-400 sm:text-3xl"
          >
            V5.0
          </motion.p>

          <motion.p
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 max-w-xl text-balance text-base text-ivory-200 sm:text-lg"
          >
            One pitch. Four batches. One trophy. The faculty&apos;s biggest one-day
            cricket showdown returns — gather your squad and claim the bragging
            rights.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-9 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 px-8 py-3.5 text-sm font-semibold text-navy-950 shadow-[0_0_30px_-6px_rgba(53,215,255,0.8)] transition-transform hover:scale-105"
            >
              Register Your Team
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/rules"
              className="rounded-full border border-cyan-400/30 px-8 py-3.5 text-sm font-semibold text-ivory-100 transition-colors hover:border-cyan-400 hover:text-cyan-300"
            >
              View Rules
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-14 w-full"
          >
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-ivory-400">
              Countdown to Match Day
            </p>
            <Countdown />
          </motion.div>
        </div>
      </section>

      <ScoreTicker />

      {/* STATS */}
      <section className="relative bg-navy-900 py-16 sm:py-20">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-10 px-6 sm:grid-cols-4">
          <StatCounter value={5} suffix="" label="Editions Strong" />
          <StatCounter value={15} suffix="+" label="Teams Expected" />
          <StatCounter value={4} suffix="" label="Batches Competing" />
          <StatCounter value={11} suffix="" label="Players Per Squad" />
        </div>
      </section>

      {/* ABOUT / FEATURES */}
      <section className="relative overflow-hidden bg-navy-950 py-24">
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[160px]" />
        <div className="relative mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="font-mono-score text-xs uppercase tracking-[0.35em] text-cyan-400">
              What is InfoBash
            </span>
            <h2 className="mt-3 font-display text-5xl tracking-wide text-ivory-50 sm:text-6xl">
              Batch vs Batch. <span className="text-gradient-gold">Bragging Rights</span> On The Line.
            </h2>
            <p className="mt-5 text-ivory-300">
              InfoBash is the Faculty of Computing&apos;s flagship cricket tournament —
              a one-day battle between teams from every batch. Now in its fifth
              edition, it&apos;s bigger, faster, and more competitive than ever.
            </p>
          </motion.div>

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
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass-card group rounded-2xl p-6 transition-colors hover:border-cyan-400/40"
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

      {/* VENUE / INFO STRIP */}
      <section className="relative border-y border-cyan-400/10 bg-navy-900 py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 text-center">
          <div className="flex items-center gap-2 text-cyan-300">
            <MapPin size={18} />
            <span className="font-mono-score text-sm tracking-wide">
              {TOURNAMENT_INFO.venue}
            </span>
          </div>
          <h2 className="font-display text-4xl tracking-wide text-ivory-50 sm:text-5xl">
            Gather your squad. <span className="text-gradient-cyan">Register before slots fill up.</span>
          </h2>
          <Link
            href="/register"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 px-8 py-3.5 text-sm font-semibold text-navy-950 shadow-[0_0_30px_-6px_rgba(53,215,255,0.8)] transition-transform hover:scale-105"
          >
            Register Your Team <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}

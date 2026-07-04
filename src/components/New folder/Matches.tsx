"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import gsap from "gsap";

/* ── Isomorphic layout effect ─────────────────────────────── */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ── Types ─────────────────────────────────────────────────── */
type Slot = { name: string } | null;

interface MatchNode {
  id: string;
  round: number;
  label: string;
  teamA: Slot;
  teamB: Slot;
  feeds?: string;
  champion?: boolean;
}

const ROUND_TITLES = ["Quarterfinals", "Semifinals", "Final", "Champion"];
const ROUND_ACCENTS = ["#35d7ff", "#3f82ff", "#f5b942", "#f5b942"];

const MATCHES: MatchNode[] = [
  { id: "qf1", round: 0, label: "Game 1", teamA: null, teamB: null, feeds: "sf1" },
  { id: "qf2", round: 0, label: "Game 2", teamA: null, teamB: null, feeds: "sf1" },
  { id: "qf3", round: 0, label: "Game 3", teamA: null, teamB: null, feeds: "sf2" },
  { id: "qf4", round: 0, label: "Game 4", teamA: null, teamB: null, feeds: "sf2" },
  { id: "sf1", round: 1, label: "Game 5", teamA: null, teamB: null, feeds: "final" },
  { id: "sf2", round: 1, label: "Game 6", teamA: null, teamB: null, feeds: "final" },
  { id: "final", round: 2, label: "Game 7", teamA: null, teamB: null, feeds: "champion" },
  { id: "champion", round: 3, label: "Champion", teamA: null, teamB: null, champion: true },
];

const ROUNDS = [0, 1, 2, 3].map((r) => MATCHES.filter((m) => m.round === r));

/* ── Team slot ─────────────────────────────────────────────── */
function TeamSlot({ team, accent }: { team: Slot; accent: string }) {
  if (!team) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-dashed border-white/10 bg-white/[0.02] px-2.5 py-1.5">
        <span className="h-1 w-1 rounded-full bg-white/20" />
        <span className="font-mono-score text-[9px] uppercase tracking-[0.25em] text-ivory-400 opacity-60">
          TBD
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.05] px-2.5 py-1.5">
      <span className="h-1 w-1 rounded-full" style={{ background: accent }} />
      <span className="truncate text-xs font-medium text-ivory-100">{team.name}</span>
    </div>
  );
}

/* ── Standard match card ──────────────────────────────────── */
function MatchCard({
  match,
  accent,
  innerRef,
}: {
  match: MatchNode;
  accent: string;
  innerRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <motion.div
      ref={innerRef}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="relative w-44 shrink-0 rounded-xl p-3 transition-all"
      style={{
        background: "linear-gradient(145deg, rgba(16,28,66,0.85), rgba(8,14,36,0.9))",
        border: `1px solid ${accent}28`,
        backdropFilter: "blur(14px)",
        boxShadow: `0 0 20px -8px ${accent}30, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      {/* Top accent bar */}
      <div
        className="absolute inset-x-0 top-0 h-[2px] rounded-t-xl"
        style={{ background: `linear-gradient(90deg, ${accent}80, transparent)` }}
      />

      <div className="mb-2 flex items-center justify-between">
        <span
          className="font-mono-score text-[9px] uppercase tracking-[0.3em]"
          style={{ color: accent }}
        >
          {match.label}
        </span>
        <Clock size={9} className="text-ivory-400 opacity-50" />
      </div>

      <div className="space-y-1.5">
        <TeamSlot team={match.teamA} accent={accent} />
        <div className="flex items-center justify-center py-0.5">
          <span className="font-mono-score text-[8px] tracking-widest text-ivory-400 opacity-40">VS</span>
        </div>
        <TeamSlot team={match.teamB} accent={accent} />
      </div>
    </motion.div>
  );
}

/* ── Champion card ───────────────────────────────────────────── */
function ChampionCard({ innerRef }: { innerRef: (el: HTMLDivElement | null) => void }) {
  const glowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGSVGElement>(null);
  const trophyRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const glowTween = glowRef.current
      ? gsap.to(glowRef.current, {
        opacity: 0.95,
        scale: 1.2,
        duration: 2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      })
      : null;

    const ringTween = ringRef.current
      ? gsap.to(ringRef.current, {
        rotate: 360,
        transformOrigin: "50% 50%",
        duration: 14,
        ease: "none",
        repeat: -1,
      })
      : null;

    const trophyTween = trophyRef.current
      ? gsap.to(trophyRef.current, {
        y: -6,
        duration: 2.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      })
      : null;

    return () => {
      glowTween?.kill();
      ringTween?.kill();
      trophyTween?.kill();
    };
  }, []);

  return (
    <motion.div
      ref={innerRef}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
      className="relative flex w-44 shrink-0 flex-col items-center gap-2"
    >
      {/* Outer glow pulse */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute top-0 h-24 w-24 rounded-full opacity-60 blur-[36px]"
        style={{ background: "radial-gradient(circle, #f5b94280, #f59b0040)" }}
      />

      {/* Spinning ring */}
      <svg
        ref={ringRef}
        viewBox="0 0 100 100"
        className="pointer-events-none absolute top-0 h-24 w-24 opacity-50"
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth="1.2"
          strokeDasharray="3 7"
        />
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5b942" stopOpacity="1" />
            <stop offset="50%" stopColor="#ffd479" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f5b942" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>

      {/* Trophy circle */}
      <div
        className="relative grid h-20 w-20 place-items-center rounded-full"
        style={{
          background: "radial-gradient(circle at 40% 35%, rgba(245,185,66,0.18), rgba(10,17,40,0.95))",
          border: "1px solid rgba(245,185,66,0.4)",
          boxShadow: "0 0 30px -8px rgba(245,185,66,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <div ref={trophyRef} className="relative h-12 w-12">
          <Image
            src="/images/Trophy.png"
            alt="Trophy"
            fill
            sizes="48px"
            className="object-contain drop-shadow-[0_0_12px_rgba(245,185,66,0.8)]"
          />
        </div>
      </div>

      {/* Winner info card */}
      <div
        className="w-full rounded-xl px-3 py-2.5 text-center"
        style={{
          background: "linear-gradient(145deg, rgba(16,28,66,0.9), rgba(8,14,36,0.95))",
          border: "1px solid rgba(245,185,66,0.3)",
          boxShadow: "0 0 24px -8px rgba(245,185,66,0.25), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-[2px] rounded-t-xl"
          style={{ background: "linear-gradient(90deg, #f5b94280, transparent)" }}
        />
        <p className="font-mono-score text-[9px] uppercase tracking-[0.3em] text-gold-400">
          Winner
        </p>
        <p className="mt-0.5 font-display text-lg tracking-wide text-ivory-100">TBD</p>
      </div>
    </motion.div>
  );
}

/* ── Bracket ───────────────────────────────────────────────── */
export default function Bracket() {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const refCallbacks = useRef<Map<string, (el: HTMLDivElement | null) => void>>(new Map());
  const [paths, setPaths] = useState<{ id: string; d: string; accent: string }[]>([]);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  const getRefCallback = useCallback((id: string) => {
    if (!refCallbacks.current.has(id)) {
      refCallbacks.current.set(id, (el: HTMLDivElement | null) => {
        if (el) nodeRefs.current.set(id, el);
        else nodeRefs.current.delete(id);
      });
    }
    return refCallbacks.current.get(id)!;
  }, []);

  const computePaths = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    setDims({ width: container.scrollWidth, height: container.scrollHeight });

    const next: { id: string; d: string; accent: string }[] = [];
    for (const match of MATCHES) {
      if (!match.feeds) continue;
      const fromEl = nodeRefs.current.get(match.id);
      const toEl = nodeRefs.current.get(match.feeds);
      if (!fromEl || !toEl) continue;

      const fRect = fromEl.getBoundingClientRect();
      const tRect = toEl.getBoundingClientRect();

      const ax = fRect.right - containerRect.left + container.scrollLeft;
      const ay = fRect.top + fRect.height / 2 - containerRect.top + container.scrollTop;
      const tx = tRect.left - containerRect.left + container.scrollLeft;
      const ty = tRect.top + tRect.height / 2 - containerRect.top + container.scrollTop;
      const midX = ax + (tx - ax) / 2;

      next.push({
        id: `${match.id}-${match.feeds}`,
        d: `M ${ax} ${ay} H ${midX} V ${ty} H ${tx}`,
        accent: ROUND_ACCENTS[match.round] ?? "#35d7ff",
      });
    }
    setPaths(next);
  }, []);

  useIsoLayoutEffect(() => {
    computePaths();
    const settleTimeout = window.setTimeout(computePaths, 250);
    const ro = new ResizeObserver(() => computePaths());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", computePaths);
    return () => {
      window.clearTimeout(settleTimeout);
      ro.disconnect();
      window.removeEventListener("resize", computePaths);
    };
  }, [computePaths]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ overflow: "hidden" }}
    >
      {/* SVG connector lines with glow */}
      <svg
        className="pointer-events-none absolute left-0 top-0"
        width={dims.width}
        height={dims.height}
        style={{ opacity: paths.length ? 1 : 0, transition: "opacity 0.4s ease" }}
      >
        <defs>
          {ROUND_ACCENTS.map((accent, i) => (
            <filter key={i} id={`glow-${i}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Glow layer */}
        {paths.map((p, i) => (
          <motion.path
            key={`glow-${p.id}`}
            d={p.d}
            fill="none"
            stroke={p.accent}
            strokeOpacity={0.25}
            strokeWidth={4}
            filter={`url(#glow-${i % 4})`}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeInOut", delay: 0.1 }}
          />
        ))}

        {/* Crisp line layer */}
        {paths.map((p) => (
          <motion.path
            key={p.id}
            d={p.d}
            fill="none"
            stroke={p.accent}
            strokeOpacity={0.7}
            strokeWidth={1.5}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          />
        ))}

        {/* Animated travelling dash highlight */}
        {paths.map((p, i) => (
          <motion.path
            key={`travel-${p.id}`}
            d={p.d}
            fill="none"
            stroke={p.accent}
            strokeOpacity={0.9}
            strokeWidth={2}
            strokeDasharray="6 200"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: -300 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "linear", delay: i * 0.35 }}
          />
        ))}
      </svg>

      {/* Rounds */}
      <div className="relative flex min-w-max items-center gap-10 px-4 py-2 sm:gap-14">
        {ROUNDS.map((round, ri) => (
          <div key={ri} className="flex flex-col items-center gap-2">
            {/* Round title */}
            <div className="mb-1 flex items-center gap-1.5">
              <div
                className="h-px w-4"
                style={{ background: `linear-gradient(90deg, transparent, ${ROUND_ACCENTS[ri]})` }}
              />
              <span
                className="font-mono-score text-[9px] uppercase tracking-[0.35em]"
                style={{ color: ROUND_ACCENTS[ri] }}
              >
                {ROUND_TITLES[ri]}
              </span>
              <div
                className="h-px w-4"
                style={{ background: `linear-gradient(90deg, ${ROUND_ACCENTS[ri]}, transparent)` }}
              />
            </div>

            <div className="flex flex-1 flex-col justify-around gap-6">
              {round.map((match) =>
                match.champion ? (
                  <ChampionCard key={match.id} innerRef={getRefCallback(match.id)} />
                ) : (
                  <MatchCard
                    key={match.id}
                    match={match}
                    accent={ROUND_ACCENTS[match.round]}
                    innerRef={getRefCallback(match.id)}
                  />
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

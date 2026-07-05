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
const ROUND_ACCENTS = ["#f5b942", "#f5b942", "#f5b942", "#f5b942"];
const CONNECTOR_GOLD = "#f5b942";
const CARD_BORDER = "rgba(245, 185, 66, 0.45)";
const CARD_BORDER_GLOW = "rgba(245, 185, 66, 0.25)";

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

/* Rounded-corner elbow connector */
function buildElbow(ax: number, ay: number, tx: number, ty: number) {
  const midX = ax + (tx - ax) / 2;
  if (Math.abs(ty - ay) < 1) return `M ${ax} ${ay} H ${tx}`;
  const r = Math.min(14, Math.abs(midX - ax) - 2, Math.abs(ty - ay) / 2);
  const radius = Math.max(r, 0);
  const vSign = ty > ay ? 1 : -1;
  return [
    `M ${ax} ${ay}`,
    `H ${midX - radius}`,
    `Q ${midX} ${ay} ${midX} ${ay + radius * vSign}`,
    `V ${ty - radius * vSign}`,
    `Q ${midX} ${ty} ${midX + radius} ${ty}`,
    `H ${tx}`,
  ].join(" ");
}

/* ── Team slot ─────────────────────────────────────────────── */
function TeamSlot({ team, accent }: { team: Slot; accent: string }) {
  if (!team) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-dashed border-white/10 bg-white/[0.02] px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
        <span className="font-mono-score text-[10px] uppercase tracking-[0.25em] text-ivory-400 opacity-60">TBD</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.05] px-3 py-2">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
      <span className="truncate text-sm font-medium text-ivory-100">{team.name}</span>
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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className="relative w-56 shrink-0 rounded-xl p-4 transition-all"
      style={{
        background: "linear-gradient(145deg, rgba(16,28,66,0.85), rgba(8,14,36,0.9))",
        border: `1px solid ${CARD_BORDER}`,
        backdropFilter: "blur(14px)",
        boxShadow: `0 0 24px -8px ${CARD_BORDER_GLOW}, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono-score text-[10px] uppercase tracking-[0.3em]" style={{ color: accent }}>
          {match.label}
        </span>
        <Clock size={11} className="text-ivory-400 opacity-50" />
      </div>
      <div className="space-y-2">
        <TeamSlot team={match.teamA} accent={accent} />
        <div className="flex items-center justify-center py-0.5">
          <span className="font-mono-score text-[9px] tracking-widest text-ivory-400 opacity-40">VS</span>
        </div>
        <TeamSlot team={match.teamB} accent={accent} />
      </div>
    </motion.div>
  );
}

/* ── Champion card ── Trophy RIGHT of Winner rectangle ─────── */
function ChampionCard({ innerRef }: { innerRef: (el: HTMLDivElement | null) => void }) {
  const glowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGSVGElement>(null);
  const trophyRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const glowTween = glowRef.current
      ? gsap.to(glowRef.current, { opacity: 0.95, scale: 1.25, duration: 2, ease: "sine.inOut", repeat: -1, yoyo: true })
      : null;
    const ringTween = ringRef.current
      ? gsap.to(ringRef.current, { rotate: 360, transformOrigin: "50% 50%", duration: 14, ease: "none", repeat: -1 })
      : null;
    const trophyTween = trophyRef.current
      ? gsap.to(trophyRef.current, { y: -6, duration: 2.5, ease: "sine.inOut", repeat: -1, yoyo: true })
      : null;
    return () => { glowTween?.kill(); ringTween?.kill(); trophyTween?.kill(); };
  }, []);

  return (
    <motion.div
      ref={innerRef}
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
      className="relative w-44 shrink-0"
    >
      {/* ── Winner card (left — connector line feeds into its left edge) ── */}
      <div
        className="w-full rounded-xl px-4 py-3 text-center"
        style={{
          background: "linear-gradient(145deg, rgba(16,28,66,0.9), rgba(8,14,36,0.95))",
          border: `1px solid ${CARD_BORDER}`,
          boxShadow: `0 0 28px -8px ${CARD_BORDER_GLOW}, inset 0 1px 0 rgba(255,255,255,0.04)`,
        }}
      >
        <p className="font-mono-score text-[10px] uppercase tracking-[0.3em]" style={{ color: "#f5b942" }}>Winner</p>
        <p className="mt-1 font-display text-xl tracking-wide text-ivory-100">TBD</p>
      </div>

      {/* ── Trophy (right of winner card) ── absolute positioned to sit outside layout flow ── */}
      <div className="absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 flex h-20 w-20 shrink-0 items-center justify-center">
        {/* Pulsing glow fills the box */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 rounded-full opacity-60 blur-[28px]"
          style={{ background: "radial-gradient(circle, rgba(245,185,66,0.55), rgba(245,155,0,0.12))" }}
        />
        {/* Spinning ring — inset-0 keeps it perfectly concentric */}
        <svg
          ref={ringRef}
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-55"
        >
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5b942" stopOpacity="1" />
              <stop offset="50%" stopColor="#ffd479" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f5b942" stopOpacity="1" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="46" fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" strokeDasharray="4 6" />
        </svg>
        {/* Gold circle with trophy image */}
        <div
          className="relative z-10 grid h-14 w-14 place-items-center rounded-full"
          style={{
            background: "radial-gradient(circle at 40% 35%, rgba(245,185,66,0.22), rgba(10,17,40,0.95))",
            border: "1px solid rgba(245,185,66,0.5)",
            boxShadow: "0 0 22px -4px rgba(245,185,66,0.6), inset 0 1px 0 rgba(255,255,255,0.09)",
          }}
        >
          <div ref={trophyRef} className="relative h-9 w-9">
            <Image
              src="/images/Trophy.png"
              alt="Trophy"
              fill
              sizes="36px"
              className="object-contain drop-shadow-[0_0_10px_rgba(245,185,66,0.85)]"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Bracket ─────────────────────────────────────────────────
   Simple, natural layout — no scaling. The page scrolls to show it.
──────────────────────────────────────────────────────────── */
export default function Bracket() {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const refCallbacks = useRef<Map<string, (el: HTMLDivElement | null) => void>>(new Map());
  const [paths, setPaths] = useState<{ id: string; d: string }[]>([]);
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

    const cRect = container.getBoundingClientRect();
    setDims({ width: container.scrollWidth, height: container.scrollHeight });

    const next: { id: string; d: string }[] = [];
    for (const match of MATCHES) {
      if (!match.feeds) continue;
      const fromEl = nodeRefs.current.get(match.id);
      const toEl = nodeRefs.current.get(match.feeds);
      if (!fromEl || !toEl) continue;

      const fRect = fromEl.getBoundingClientRect();
      const tRect = toEl.getBoundingClientRect();

      const ax = fRect.right - cRect.left + container.scrollLeft;
      const ay = fRect.top + fRect.height / 2 - cRect.top + container.scrollTop;
      const tx = tRect.left - cRect.left + container.scrollLeft;
      const ty = tRect.top + tRect.height / 2 - cRect.top + container.scrollTop;

      next.push({ id: `${match.id}-${match.feeds}`, d: buildElbow(ax, ay, tx, ty) });
    }
    setPaths(next);
  }, []);

  useIsoLayoutEffect(() => {
    computePaths();
    const t = window.setTimeout(computePaths, 250);
    const ro = new ResizeObserver(computePaths);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", computePaths);
    return () => { clearTimeout(t); ro.disconnect(); window.removeEventListener("resize", computePaths); };
  }, [computePaths]);

  return (
    <div ref={containerRef} className="relative">
      {/* SVG connector lines */}
      <svg
        className="pointer-events-none absolute left-0 top-0 z-0"
        width={dims.width}
        height={dims.height}
        style={{ opacity: paths.length ? 1 : 0, transition: "opacity 0.4s ease" }}
      >
        <defs>
          {/* Outer diffuse glow — large stdDeviation for a wide bloom */}
          <filter id="outerGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          </filter>
          {/* Mid bloom — tighter, brighter core glow */}
          <filter id="midGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          </filter>
        </defs>

        {/* ── Layer 1: outer wide diffuse bloom ── */}
        {paths.map((p, i) => (
          <motion.path
            key={`bloom-${p.id}`} d={p.d} fill="none"
            stroke="#f5b942" strokeOpacity={0.45} strokeWidth={2.5}
            strokeLinecap="round" filter="url(#outerGlow)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
          />
        ))}

        {/* ── Layer 2: mid core bloom ── */}
        {paths.map((p, i) => (
          <motion.path
            key={`mid-${p.id}`} d={p.d} fill="none"
            stroke="#ffd479" strokeOpacity={0.75} strokeWidth={2.5}
            strokeLinecap="round" filter="url(#midGlow)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
          />
        ))}

        {/* ── Layer 3: bright crisp core ── */}
        {paths.map((p, i) => (
          <motion.path
            key={p.id} d={p.d} fill="none"
            stroke="#ffe099" strokeOpacity={1} strokeWidth={2.5}
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.06, ease: "easeOut" }}
          />
        ))}

        {/* ── Layer 4: white-hot center thread ── */}
        {paths.map((p, i) => (
          <motion.path
            key={`hot-${p.id}`} d={p.d} fill="none"
            stroke="rgba(255,255,255,0.75)" strokeWidth={2.5}
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.06, ease: "easeOut" }}
          />
        ))}

        {/* ── Layer 5: travelling shimmer dash ── */}
        {paths.map((p, i) => (
          <motion.path
            key={`shimmer-${p.id}`} d={p.d} fill="none"
            stroke="#ffffff" strokeOpacity={0.95} strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray="14 260"
            initial={{ strokeDashoffset: 20 }}
            animate={{ strokeDashoffset: -360 }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "linear", delay: i * 0.4 }}
          />
        ))}
      </svg>

      {/* Rounds */}
      <div className="relative z-10 flex min-w-max items-center gap-16 px-6 py-6">
        {ROUNDS.map((round, ri) => (
          <div key={ri} className="flex flex-col items-center gap-3">
            {/* Round label */}
            <div className="mb-2 flex items-center gap-2">
              <div className="h-px w-6" style={{ background: `linear-gradient(90deg, transparent, ${ROUND_ACCENTS[ri]})` }} />
              <span className="font-mono-score text-[10px] uppercase tracking-[0.35em]" style={{ color: ROUND_ACCENTS[ri] }}>
                {ROUND_TITLES[ri]}
              </span>
              <div className="h-px w-6" style={{ background: `linear-gradient(90deg, ${ROUND_ACCENTS[ri]}, transparent)` }} />
            </div>

            <div className="flex flex-1 flex-col justify-around gap-10">
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

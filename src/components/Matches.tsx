"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Trophy } from "lucide-react";
import gsap from "gsap";

/* ── Isomorphic layout effect (avoids the SSR warning) ───────── */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ── Bracket data ──────────────────────────────────────────────
   Placeholder single-elimination draw. Once the official fixtures
   are announced, replace `teamA` / `teamB` with real team objects
   (e.g. { name: "Batch 21 Strikers" }) — the layout, spacing and
   connector lines all recompute automatically, no matter the size
   of each card or the viewport width.
------------------------------------------------------------- */
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
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
        <span className="font-mono-score text-[10px] uppercase tracking-[0.25em] text-ivory-500">
          TBD
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2">
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
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className="glass-card w-60 shrink-0 rounded-2xl p-4 transition-colors sm:w-64"
      style={{ borderColor: `${accent}30` }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span
          className="font-mono-score text-[10px] uppercase tracking-[0.3em]"
          style={{ color: accent }}
        >
          {match.label}
        </span>
        <Clock size={11} className="text-ivory-500" />
      </div>
      <div className="space-y-2">
        <TeamSlot team={match.teamA} accent={accent} />
        <div className="flex items-center justify-center">
          <span className="font-mono-score text-[9px] tracking-widest text-ivory-600">VS</span>
        </div>
        <TeamSlot team={match.teamB} accent={accent} />
      </div>
    </motion.div>
  );
}

/* ── Champion card (GSAP-driven glow + spin) ─────────────────── */
function ChampionCard({ innerRef }: { innerRef: (el: HTMLDivElement | null) => void }) {
  const glowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGSVGElement>(null);

  useIsoLayoutEffect(() => {
    const glowTween = glowRef.current
      ? gsap.to(glowRef.current, {
          opacity: 0.9,
          scale: 1.15,
          duration: 1.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        })
      : null;

    const ringTween = ringRef.current
      ? gsap.to(ringRef.current, {
          rotate: 360,
          transformOrigin: "50% 50%",
          duration: 16,
          ease: "none",
          repeat: -1,
        })
      : null;

    return () => {
      glowTween?.kill();
      ringTween?.kill();
    };
  }, []);

  return (
    <motion.div
      ref={innerRef}
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
      className="relative flex w-60 shrink-0 flex-col items-center gap-3 sm:w-64"
    >
      <div
        ref={glowRef}
        className="pointer-events-none absolute h-32 w-32 rounded-full bg-gold-400/25 opacity-60 blur-[42px]"
      />
      <svg
        ref={ringRef}
        viewBox="0 0 100 100"
        className="pointer-events-none absolute h-28 w-28 opacity-40"
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="#f5b942"
          strokeWidth="1"
          strokeDasharray="4 8"
        />
      </svg>
      <div className="glass-card relative grid h-20 w-20 place-items-center rounded-full border-gold-400/40">
        <Trophy size={30} className="text-gold-400" />
      </div>
      <div className="glass-card w-full rounded-2xl border-gold-400/30 px-4 py-3 text-center">
        <p className="font-mono-score text-[10px] uppercase tracking-[0.3em] text-gold-400">
          Winner
        </p>
        <p className="mt-1 font-display text-xl tracking-wide text-ivory-100">TBD</p>
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
    const settleTimeout = window.setTimeout(computePaths, 250); // let fonts/layout settle
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
    <div ref={containerRef} className="relative overflow-x-auto pb-4">
      <svg
        className="pointer-events-none absolute left-0 top-0"
        width={dims.width}
        height={dims.height}
        style={{ opacity: paths.length ? 1 : 0, transition: "opacity 0.4s ease" }}
      >
        {paths.map((p) => (
          <motion.path
            key={p.id}
            d={p.d}
            fill="none"
            stroke={p.accent}
            strokeOpacity={0.45}
            strokeWidth={1.5}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          />
        ))}
      </svg>

      <div className="relative flex min-w-max gap-16 px-6 py-4 sm:gap-24">
        {ROUNDS.map((round, ri) => (
          <div key={ri} className="flex flex-col items-center gap-3">
            <span
              className="mb-2 font-mono-score text-[11px] uppercase tracking-[0.35em]"
              style={{ color: ROUND_ACCENTS[ri] }}
            >
              {ROUND_TITLES[ri]}
            </span>
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

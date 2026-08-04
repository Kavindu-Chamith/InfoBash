"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import gsap from "gsap";

/* -- Isomorphic layout effect ------------------------------- */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* -- Types --------------------------------------------------- */
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

export interface PlayoffMatch {
  id: string;
  stage: "round1" | "quarterfinal" | "semifinal" | "final";
  label: string | null;
  team_a_name: string | null;
  team_b_name: string | null;
  status: "scheduled" | "live" | "completed";
  winner_name: string | null;
}

const CARD_BORDER = "rgba(245, 185, 66, 0.45)";
const CARD_BORDER_GLOW = "rgba(245, 185, 66, 0.25)";

function generateDefaultPlayoffs(totalTeams: number): PlayoffMatch[] {
  // If 8 or more teams registered (e.g. 8, 12, 14, 16 teams):
  if (totalTeams >= 8) {
    const round1Count = totalTeams >= 14 ? 6 : 4;
    const r1Matches: PlayoffMatch[] = Array.from({ length: round1Count }, (_, i) => ({
      id: `r1-${i + 1}`,
      stage: "round1",
      label: `Round 1 · ${String.fromCharCode(65 + i)}`,
      team_a_name: null,
      team_b_name: null,
      status: "scheduled",
      winner_name: null,
    }));

    // If 14 teams (12 play in Round 1, 2 top teams paired for Direct QF Entry):
    const directSeedsPairing: PlayoffMatch[] = totalTeams >= 14 ? [
      {
        id: "r1-direct",
        stage: "round1",
        label: "Direct QF Entry",
        team_a_name: "Direct Seed #1",
        team_b_name: "Direct Seed #2",
        status: "scheduled",
        winner_name: null,
      }
    ] : [];

    return [
      ...r1Matches,
      ...directSeedsPairing,
      { id: "qf-1", stage: "quarterfinal", label: "Game 1", team_a_name: null, team_b_name: null, status: "scheduled", winner_name: null },
      { id: "qf-2", stage: "quarterfinal", label: "Game 2", team_a_name: null, team_b_name: null, status: "scheduled", winner_name: null },
      { id: "qf-3", stage: "quarterfinal", label: "Game 3", team_a_name: null, team_b_name: null, status: "scheduled", winner_name: null },
      { id: "qf-4", stage: "quarterfinal", label: "Game 4", team_a_name: null, team_b_name: null, status: "scheduled", winner_name: null },
      { id: "sf-1", stage: "semifinal", label: "Game 5", team_a_name: null, team_b_name: null, status: "scheduled", winner_name: null },
      { id: "sf-2", stage: "semifinal", label: "Game 6", team_a_name: null, team_b_name: null, status: "scheduled", winner_name: null },
      { id: "final", stage: "final", label: "Game 7 (Final)", team_a_name: null, team_b_name: null, status: "scheduled", winner_name: null },
    ];
  }
  return [
    { id: "r1-1", stage: "round1", label: "Round 1 · A", team_a_name: null, team_b_name: null, status: "scheduled", winner_name: null },
    { id: "r1-2", stage: "round1", label: "Round 1 · B", team_a_name: null, team_b_name: null, status: "scheduled", winner_name: null },
    { id: "sf-1", stage: "semifinal", label: "Semifinal 1", team_a_name: null, team_b_name: null, status: "scheduled", winner_name: null },
    { id: "sf-2", stage: "semifinal", label: "Semifinal 2", team_a_name: null, team_b_name: null, status: "scheduled", winner_name: null },
    { id: "final", stage: "final", label: "Final", team_a_name: null, team_b_name: null, status: "scheduled", winner_name: null },
  ];
}

function buildMatchNodes(playoffMatches: PlayoffMatch[], totalTeams: number = 0): {
  matches: MatchNode[];
  championName: string | null;
  roundTitles: string[];
  roundAccents: string[];
} {
  const matchesData = playoffMatches.length > 0 ? playoffMatches : generateDefaultPlayoffs(totalTeams);
  const round1List = matchesData.filter((m) => m.stage === "round1");
  const quarterfinals = matchesData.filter((m) => m.stage === "quarterfinal");
  const semifinals = matchesData.filter((m) => m.stage === "semifinal");
  const final = matchesData.find((m) => m.stage === "final") ?? null;

  const matches: MatchNode[] = [];
  let roundTitles: string[];
  let roundAccents: string[];

  if (round1List.length > 0 && quarterfinals.length > 0) {
    roundTitles = ["First Round", "Quarterfinals", "Semifinals", "Final", "Champion"];
    roundAccents = ["#22d3ee", "#35d7ff", "#f5b942", "#f5b942", "#f5b942"];

    // Round 1 (Round 0)
    const normalR1 = round1List.filter((m) => m.id !== "r1-direct");
    const directMatch = round1List.find((m) => m.id === "r1-direct");

    normalR1.forEach((m, i) => {
      const qfLimit = directMatch ? 3 : quarterfinals.length;
      const qfIndex = Math.min(Math.floor((i * qfLimit) / normalR1.length), qfLimit - 1);
      const qfTarget = quarterfinals[qfIndex]?.id || `qf-${qfIndex + 1}`;
      matches.push({
        id: m.id,
        round: 0,
        label: m.label || `Round 1 · ${String.fromCharCode(65 + i)}`,
        teamA: m.team_a_name ? { name: m.team_a_name } : null,
        teamB: m.team_b_name ? { name: m.team_b_name } : null,
        feeds: qfTarget,
      });
    });

    if (directMatch) {
      matches.push({
        id: directMatch.id,
        round: 0,
        label: directMatch.label || "Direct QF Entry",
        teamA: directMatch.team_a_name ? { name: directMatch.team_a_name } : { name: "Direct Seed #1" },
        teamB: directMatch.team_b_name ? { name: directMatch.team_b_name } : { name: "Direct Seed #2" },
        feeds: quarterfinals[3]?.id || "qf-4",
      });
    }

    // Quarterfinals (Round 1)
    quarterfinals.forEach((m, i) => {
      const sfTarget = i < 2 ? (semifinals[0]?.id || "sf-1") : (semifinals[1]?.id || "sf-2");
      matches.push({
        id: m.id,
        round: 1,
        label: m.label || `Game ${i + 1}`,
        teamA: m.team_a_name ? { name: m.team_a_name } : null,
        teamB: m.team_b_name ? { name: m.team_b_name } : null,
        feeds: sfTarget,
      });
    });

    // Semifinals (Round 2)
    const sfList = semifinals.length > 0 ? semifinals : [
      { id: "sf-1", stage: "semifinal" as const, label: "Game 5", team_a_name: null, team_b_name: null, status: "scheduled" as const, winner_name: null },
      { id: "sf-2", stage: "semifinal" as const, label: "Game 6", team_a_name: null, team_b_name: null, status: "scheduled" as const, winner_name: null },
    ];
    sfList.forEach((m, i) => {
      matches.push({
        id: m.id,
        round: 2,
        label: m.label || `Game ${i + 5}`,
        teamA: m.team_a_name ? { name: m.team_a_name } : null,
        teamB: m.team_b_name ? { name: m.team_b_name } : null,
        feeds: "final",
      });
    });

    // Final (Round 3)
    matches.push({
      id: final?.id || "final",
      round: 3,
      label: final?.label || "Game 7 (Final)",
      teamA: final?.team_a_name ? { name: final.team_a_name } : null,
      teamB: final?.team_b_name ? { name: final.team_b_name } : null,
      feeds: "champion",
    });

    // Champion (Round 4)
    matches.push({ id: "champion", round: 4, label: "Champion", teamA: null, teamB: null, champion: true });
  } else if (quarterfinals.length > 0) {
    roundTitles = ["Quarterfinals", "Semifinals", "Final", "Champion"];
    roundAccents = ["#35d7ff", "#f5b942", "#f5b942", "#f5b942"];

    quarterfinals.forEach((m, i) => {
      const sfTarget = i < 2 ? (semifinals[0]?.id || "sf-1") : (semifinals[1]?.id || "sf-2");
      matches.push({
        id: m.id,
        round: 0,
        label: m.label || `Game ${i + 1}`,
        teamA: m.team_a_name ? { name: m.team_a_name } : null,
        teamB: m.team_b_name ? { name: m.team_b_name } : null,
        feeds: sfTarget,
      });
    });

    const sfList = semifinals.length > 0 ? semifinals : [
      { id: "sf-1", stage: "semifinal" as const, label: "Game 5", team_a_name: null, team_b_name: null, status: "scheduled" as const, winner_name: null },
      { id: "sf-2", stage: "semifinal" as const, label: "Game 6", team_a_name: null, team_b_name: null, status: "scheduled" as const, winner_name: null },
    ];
    sfList.forEach((m, i) => {
      matches.push({
        id: m.id,
        round: 1,
        label: m.label || `Game ${i + 5}`,
        teamA: m.team_a_name ? { name: m.team_a_name } : null,
        teamB: m.team_b_name ? { name: m.team_b_name } : null,
        feeds: "final",
      });
    });

    matches.push({
      id: final?.id || "final",
      round: 2,
      label: final?.label || "Game 7 (Final)",
      teamA: final?.team_a_name ? { name: final.team_a_name } : null,
      teamB: final?.team_b_name ? { name: final.team_b_name } : null,
      feeds: "champion",
    });

    matches.push({ id: "champion", round: 3, label: "Champion", teamA: null, teamB: null, champion: true });
  } else {
    roundTitles = ["Semifinals", "Final", "Champion"];
    roundAccents = ["#f5b942", "#f5b942", "#f5b942"];

    const sfList = semifinals.length > 0 ? semifinals : [
      { id: "sf-1", stage: "semifinal" as const, label: "Semifinal 1", team_a_name: null, team_b_name: null, status: "scheduled" as const, winner_name: null },
      { id: "sf-2", stage: "semifinal" as const, label: "Semifinal 2", team_a_name: null, team_b_name: null, status: "scheduled" as const, winner_name: null },
    ];

    sfList.forEach((m, i) => {
      matches.push({
        id: m.id,
        round: 0,
        label: m.label || `Semifinal ${i + 1}`,
        teamA: m.team_a_name ? { name: m.team_a_name } : null,
        teamB: m.team_b_name ? { name: m.team_b_name } : null,
        feeds: "final",
      });
    });

    matches.push({
      id: final?.id || "final",
      round: 1,
      label: final?.label || "Final",
      teamA: final?.team_a_name ? { name: final.team_a_name } : null,
      teamB: final?.team_b_name ? { name: final.team_b_name } : null,
      feeds: "champion",
    });

    matches.push({ id: "champion", round: 2, label: "Champion", teamA: null, teamB: null, champion: true });
  }

  const championName = final?.status === "completed" ? final.winner_name : null;

  return { matches, championName, roundTitles, roundAccents };
}

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

/* -- Team slot ----------------------------------------------- */
function TeamSlot({ team, accent }: { team: Slot; accent: string }) {
  if (!team) {
    return (
      <div className="flex items-center gap-1.5 rounded-md border border-dashed border-white/10 bg-white/[0.02] px-2 py-1">
        <span className="h-1 w-1 rounded-full bg-white/20" />
        <span className="font-mono-score text-[9px] uppercase tracking-[0.2em] text-ivory-400 opacity-60">TBD</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.05] px-2 py-1">
      <span className="h-1 w-1 rounded-full shrink-0" style={{ background: accent }} />
      <span className="truncate text-xs font-medium text-ivory-100">{team.name}</span>
    </div>
  );
}

/* -- Standard match card ------------------------------------ */
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
      className="relative w-44 shrink-0 rounded-xl p-2.5 transition-all"
      style={{
        background: "linear-gradient(145deg, rgba(16,28,66,0.85), rgba(8,14,36,0.9))",
        border: `1px solid ${CARD_BORDER}`,
        backdropFilter: "blur(14px)",
        boxShadow: `0 0 20px -8px ${CARD_BORDER_GLOW}, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono-score text-[9px] uppercase tracking-[0.2em]" style={{ color: accent }}>
          {match.label}
        </span>
        <Clock size={10} className="text-ivory-400 opacity-50" />
      </div>
      <div className="space-y-1.5">
        <TeamSlot team={match.teamA} accent={accent} />
        <div className="flex items-center justify-center py-0.2">
          <span className="font-mono-score text-[8px] tracking-widest text-ivory-400 opacity-40">VS</span>
        </div>
        <TeamSlot team={match.teamB} accent={accent} />
      </div>
    </motion.div>
  );
}

/* -- Champion card -- Trophy RIGHT of Winner rectangle ------- */
function ChampionCard({
  innerRef,
  championName,
}: {
  innerRef: (el: HTMLDivElement | null) => void;
  championName: string | null;
}) {
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
      className="relative w-36 shrink-0"
    >
      {/* -- Winner card (left — connector line feeds into its left edge) -- */}
      <div
        className="w-full rounded-xl px-3 py-2.5 text-center"
        style={{
          background: "linear-gradient(145deg, rgba(16,28,66,0.9), rgba(8,14,36,0.95))",
          border: `1px solid ${CARD_BORDER}`,
          boxShadow: `0 0 24px -8px ${CARD_BORDER_GLOW}, inset 0 1px 0 rgba(255,255,255,0.04)`,
        }}
      >
        <p className="font-mono-score text-[9px] uppercase tracking-[0.25em]" style={{ color: "#f5b942" }}>Winner</p>
        <p className="mt-0.5 font-display text-lg tracking-wide text-ivory-100">{championName ?? "TBD"}</p>
      </div>

      {/* -- Trophy (right of winner card) -- absolute positioned to sit outside layout flow -- */}
      <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 flex h-16 w-16 shrink-0 items-center justify-center">
        {/* Pulsing glow fills the box */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 rounded-full opacity-60 blur-[24px]"
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
          className="relative z-10 grid h-12 w-12 place-items-center rounded-full"
          style={{
            background: "radial-gradient(circle at 40% 35%, rgba(245,185,66,0.22), rgba(10,17,40,0.95))",
            border: "1px solid rgba(245,185,66,0.5)",
            boxShadow: "0 0 18px -4px rgba(245,185,66,0.6), inset 0 1px 0 rgba(255,255,255,0.09)",
          }}
        >
          <div ref={trophyRef} className="relative h-7 w-7">
            <Image
              src="/images/Trophy.png"
              alt="Trophy"
              fill
              sizes="28px"
              className="object-contain drop-shadow-[0_0_8px_rgba(245,185,66,0.85)]"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* -- Bracket -------------------------------------------------
   Simple, natural layout — no scaling. The page scrolls to show it.
------------------------------------------------------------ */
export default function Bracket({
  matches: playoffMatches,
  totalTeams = 0,
}: {
  matches: PlayoffMatch[];
  totalTeams?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [paths, setPaths] = useState<{ id: string; d: string }[]>([]);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  const { matches: MATCHES, championName, roundTitles, roundAccents } = useMemo(
    () => buildMatchNodes(playoffMatches, totalTeams),
    [playoffMatches, totalTeams]
  );
  const ROUNDS = useMemo(
    () => Array.from({ length: roundTitles.length }, (_, r) => MATCHES.filter((m) => m.round === r)),
    [MATCHES, roundTitles.length]
  );

  const setNodeRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
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
  }, [MATCHES]);

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

        {/* -- Layer 1: outer wide diffuse bloom -- */}
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

        {/* -- Layer 2: mid core bloom -- */}
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

        {/* -- Layer 3: bright crisp core -- */}
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

        {/* -- Layer 4: white-hot center thread -- */}
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

        {/* -- Layer 5: travelling shimmer dash -- */}
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
      <div className="relative z-10 flex min-w-max items-center gap-10 px-4 py-4">
        {ROUNDS.map((round, ri) => (
          <div key={ri} className="flex flex-col items-center gap-3">
            {/* Round label */}
            <div className="mb-2 flex items-center gap-2">
              <div className="h-px w-6" style={{ background: `linear-gradient(90deg, transparent, ${roundAccents[ri] || "#f5b942"})` }} />
              <span className="font-mono-score text-[10px] uppercase tracking-[0.35em]" style={{ color: roundAccents[ri] || "#f5b942" }}>
                {roundTitles[ri]}
              </span>
              <div className="h-px w-6" style={{ background: `linear-gradient(90deg, ${roundAccents[ri] || "#f5b942"}, transparent)` }} />
            </div>

            <div className="flex flex-1 flex-col justify-around gap-10">
              {round.map((match) =>
                match.champion ? (
                  <ChampionCard
                    key={match.id}
                    innerRef={(el) => setNodeRef(match.id, el)}
                    championName={championName}
                  />
                ) : (
                  <MatchCard
                    key={match.id}
                    match={match}
                    accent={roundAccents[match.round] || "#f5b942"}
                    innerRef={(el) => setNodeRef(match.id, el)}
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

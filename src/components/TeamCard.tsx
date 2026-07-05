"use client";

import { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import { Star, Shield, ChevronDown, Calendar, Crown } from "lucide-react";
import type { PublicTeam } from "@/app/api/teams/route";

/* ── Batch colour system ─────────────────────────────────── */
const BATCH_THEME: Record<
  string,
  { label: string; color: string; glow: string; bg: string; border: string; text: string }
> = {
  "1st Year": {
    label: "1st Year",
    color: "#22d3ee",
    glow: "rgba(34,211,238,0.35)",
    bg: "rgba(34,211,238,0.06)",
    border: "rgba(34,211,238,0.25)",
    text: "text-cyan-300",
  },
  "2nd Year": {
    label: "2nd Year",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.35)",
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.25)",
    text: "text-amber-300",
  },
  "3rd Year": {
    label: "3rd Year",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.35)",
    bg: "rgba(167,139,250,0.06)",
    border: "rgba(167,139,250,0.25)",
    text: "text-violet-300",
  },
  "4th Year": {
    label: "4th Year",
    color: "#34d399",
    glow: "rgba(52,211,153,0.35)",
    bg: "rgba(52,211,153,0.06)",
    border: "rgba(52,211,153,0.25)",
    text: "text-emerald-300",
  },
};

const DEFAULT_THEME = {
  label: "Unknown",
  color: "#94a3b8",
  glow: "rgba(148,163,184,0.3)",
  bg: "rgba(148,163,184,0.05)",
  border: "rgba(148,163,184,0.2)",
  text: "text-slate-400",
};

/* ── Helpers ──────────────────────────────────────────────── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

/* ── Single Team Card ────────────────────────────────────── */
export function TeamCard({ team, index }: { team: PublicTeam; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const theme = BATCH_THEME[team.batch] ?? DEFAULT_THEME;

  const cardRef = useRef<HTMLDivElement>(null);

  /* ── 3D tilt + glare, driven by cursor position ── */
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [9, -9]), {
    stiffness: 260,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(px, [0, 1], [-9, 9]), {
    stiffness: 260,
    damping: 22,
  });
  const glareX = useTransform(px, (v) => `${v * 100}%`);
  const glareY = useTransform(py, (v) => `${v * 100}%`);
  const glareBackground = useTransform([glareX, glareY], ([gx, gy]) =>
    `radial-gradient(circle at ${gx} ${gy}, ${theme.color}28, transparent 55%)`
  );

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }
  function handleMouseLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] as const }}
      layout
      style={{ perspective: 1200 }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setExpanded((v) => !v)}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          background: `linear-gradient(135deg, ${theme.bg}, rgba(6,12,26,0.85))`,
          borderColor: theme.border,
        }}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border backdrop-blur-sm transition-shadow duration-300"
        whileHover={{
          boxShadow: `0 24px 70px -12px ${theme.glow}, 0 0 0 1px ${theme.color}55`,
        }}
        transition={{ duration: 0.25 }}
      >
        {/* Holographic glare that tracks the cursor */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glareBackground }}
        />



        <div className="p-6">
          {/* Batch badge */}
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest"
            style={{
              background: `${theme.color}18`,
              border: `1px solid ${theme.color}40`,
              color: theme.color,
            }}
          >
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full"
              style={{ background: theme.color }}
            />
            {team.batch}
          </span>

          {/* Team name */}
          <h3
            className="mb-1 mt-4 font-display text-2xl tracking-wide text-ivory-50 transition-colors duration-200 group-hover:text-white"
          >
            {team.team_name}
          </h3>

          {/* Captain */}
          <div className="mb-5 flex items-center gap-1.5 text-ivory-400">
            <Star size={12} style={{ color: theme.color }} />
            <span className="text-sm">Capt. {team.captain_name}</span>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="ml-auto flex items-center gap-1.5 text-ivory-500">
              <Calendar size={11} />
              <span className="font-mono-score text-[10px] tracking-wide">
                {formatDate(team.registered_at)}
              </span>
            </div>
          </div>

          {/* Expand hint */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-ivory-500">
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={12} />
            </motion.span>
            {expanded ? "Hide Squad" : "View Full Squad"}
          </div>
        </div>

        {/* Expandable — the real, per-team squad roster */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
              className="overflow-hidden"
            >
              <div
                className="mx-6 mb-6 rounded-xl border p-4"
                style={{ background: "rgba(0,0,0,0.3)", borderColor: `${theme.color}20` }}
              >
                <p className="mb-3 font-mono-score text-[10px] uppercase tracking-[0.3em] text-ivory-500">
                  Full Squad ({team.players.length})
                </p>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {team.players.map((p, i) => {
                    const isCaptain = p.fullName === team.captain_name;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.025 }}
                        className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5"
                      >
                        <span
                          className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[9px] font-bold"
                          style={{ background: `${theme.color}22`, color: theme.color }}
                        >
                          {initials(p.fullName)}
                        </span>
                        <span className="flex-1 truncate text-xs text-ivory-200">
                          {p.fullName}
                        </span>
                        {isCaptain && <Crown size={11} className="shrink-0 text-gold-400" />}
                        {p.gender === "female" && (
                          <Shield size={10} className="shrink-0 text-pink-300" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* ── Filter pill ─────────────────────────────────────────── */
export function FilterPill({
  label,
  active,
  count,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  count: number;
  color?: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="relative overflow-hidden rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200"
      style={
        active
          ? {
              background: color ? `${color}20` : "rgba(53,215,255,0.15)",
              borderColor: color ?? "#35d7ff",
              color: color ?? "#35d7ff",
              boxShadow: `0 0 16px -4px ${color ?? "#35d7ff"}60`,
            }
          : {
              background: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.1)",
              color: "#94a3b8",
            }
      }
    >
      {label}
      <span
        className="ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
        style={{
          background: active
            ? color
              ? `${color}30`
              : "rgba(53,215,255,0.2)"
            : "rgba(255,255,255,0.08)",
        }}
      >
        {count}
      </span>
    </motion.button>
  );
}

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import { Star, Shield, ChevronRight, Calendar, Crown, X, Mail, Phone, Users } from "lucide-react";
import type { PublicTeam } from "@/app/api/teams/route";

/* -- Batch colour system ----------------------------------- */
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

/* -- Helpers ------------------------------------------------ */
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

/* -- Team Details Sidebar Drawer ---------------------------- */
export function TeamDrawer({
  team,
  isOpen,
  onClose,
}: {
  team: PublicTeam;
  isOpen: boolean;
  onClose: () => void;
}) {
  const theme = BATCH_THEME[team.batch] ?? DEFAULT_THEME;
  const femaleCount = team.players.filter((p) => p.gender === "female").length;
  const maleCount = team.players.length - femaleCount;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-navy-950/95 backdrop-blur-md"
          />

          {/* Slide-over sidebar container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#070e20] shadow-2xl"
          >
            {/* Drawer Top Header / Navigation */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <span className="font-mono-score text-[10px] uppercase tracking-[0.4em] text-ivory-400">
                Team Profile &amp; Squad
              </span>
              <button
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-ivory-300 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close details"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Badges & Team Name */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
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
                  {team.group_name && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-cyan-300">
                      {team.group_name}
                    </span>
                  )}
                </div>

                <h2 className="font-display text-4xl tracking-wide text-ivory-50">
                  {team.team_name}
                </h2>

                <div className="mt-3 flex flex-col gap-1.5 text-xs text-ivory-300">
                  <div className="flex items-center gap-2">
                    <Crown size={14} className="text-gold-400" />
                    <span>Captain: <strong className="text-ivory-100 font-semibold">{team.captain_name}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-ivory-400">
                    <Calendar size={13} />
                    <span>Registered on {formatDate(team.registered_at)}</span>
                  </div>
                </div>
              </div>

              {/* 4 Summary Stat Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
                  <p className="font-mono-score text-[10px] uppercase tracking-widest text-ivory-500">Squad Size</p>
                  <p className="mt-1 font-display text-2xl text-ivory-100">{team.players.length}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
                  <p className="font-mono-score text-[10px] uppercase tracking-widest text-ivory-500">Gender Ratio</p>
                  <p className="mt-1 font-display text-xl text-cyan-300">{maleCount} M / {femaleCount} F</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
                  <p className="font-mono-score text-[10px] uppercase tracking-widest text-ivory-500">Group Stage</p>
                  <p className="mt-1 font-display text-xl text-gold-400">{team.group_name ?? "Unassigned"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
                  <p className="font-mono-score text-[10px] uppercase tracking-widest text-ivory-500">Batch Year</p>
                  <p className="mt-1 font-display text-xl" style={{ color: theme.color }}>{team.batch}</p>
                </div>
              </div>



              {/* Full Squad Roster List */}
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                  <h3 className="font-mono-score text-xs uppercase tracking-[0.3em] text-ivory-300">
                    Squad Roster ({team.players.length} Players)
                  </h3>
                </div>

                <div className="space-y-2">
                  {[...team.players]
                    .sort((a, b) => {
                      if (a.gender === "female" && b.gender !== "female") return 1;
                      if (a.gender !== "female" && b.gender === "female") return -1;
                      return (a.position || 0) - (b.position || 0);
                    })
                    .map((p, i) => {
                      const isCaptain = p.fullName === team.captain_name;
                      const posNumber = String(i + 1).padStart(2, "0");
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
                        >
                          <span className="font-mono-score text-xs font-bold text-ivory-500">
                            #{posNumber}
                          </span>

                          <span
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold shadow-inner"
                            style={{ background: `${theme.color}22`, color: theme.color }}
                          >
                            {initials(p.fullName)}
                          </span>

                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-ivory-100">
                              {p.fullName}
                            </p>
                          </div>

                          {/* Badges */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isCaptain && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-gold-400/40 bg-gold-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold-400">
                                <Crown size={9} /> Captain
                              </span>
                            )}
                            {p.gender === "female" && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-pink-400/40 bg-pink-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-pink-300">
                                <Shield size={9} /> Female
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Footer button */}
            <div className="border-t border-white/10 px-6 py-4">
              <button
                onClick={onClose}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-center text-sm font-semibold text-ivory-200 transition-colors hover:bg-white/10 hover:text-white"
              >
                Close Profile
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* -- Single Team Card -------------------------------------- */
export function TeamCard({ team, index }: { team: PublicTeam; index: number }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = BATCH_THEME[team.batch] ?? DEFAULT_THEME;

  const cardRef = useRef<HTMLDivElement>(null);

  /* -- 3D tilt + glare, driven by cursor position -- */
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
    <>
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
          onClick={() => setDrawerOpen(true)}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
            background: theme.bg,
            borderColor: theme.border,
          }}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border backdrop-blur-sm transition-shadow duration-300"
          whileHover={{
            boxShadow: `0 24px 70px -12px ${theme.glow}, 0 0 0 1px ${theme.color}55`,
          }}
          transition={{ duration: 0.25 }}
        >
          {/* Subtle cursor highlight tint */}
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ backgroundColor: `${theme.color}10` }}
          />

          <div className="p-6">
            {/* Batch + group badges */}
            <div className="flex flex-wrap items-center gap-2">
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
              {team.group_name && (
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-ivory-300">
                  {team.group_name}
                </span>
              )}
            </div>

            {/* Team name + logo */}
            <div className="mb-1 mt-4 flex items-center gap-3">
              {team.has_logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/teams/${team.id}/logo`}
                  alt={`${team.team_name} logo`}
                  loading="lazy"
                  decoding="async"
                  className="h-10 w-10 shrink-0 rounded-full border border-white/10 object-cover"
                />
              )}
              <h3 className="font-display text-2xl tracking-wide text-ivory-50 transition-colors duration-200 group-hover:text-white">
                {team.team_name}
              </h3>
            </div>

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
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-ivory-400 transition-colors group-hover:text-orange-400">
              <span>View Full Squad</span>
              <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Slide-over Team Details Drawer */}
      <TeamDrawer team={team} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

/* -- Filter pill ------------------------------------------- */
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
            background: color ? `${color}20` : "rgba(255,107,0,0.15)",
            borderColor: color ?? "#FF6B00",
            color: color ?? "#FF6B00",
            boxShadow: `0 0 16px -4px ${color ?? "#FF6B00"}60`,
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

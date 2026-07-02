"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Users, Search } from "lucide-react";
import { TeamCard, FilterPill } from "@/components/TeamCard";
import type { PublicTeam } from "@/app/api/teams/route";

const BATCH_COLORS: Record<string, string> = {
  "1st Year": "#22d3ee",
  "2nd Year": "#f59e0b",
  "3rd Year": "#a78bfa",
  "4th Year": "#34d399",
};

const ALL_BATCHES = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export default function TeamsClient({
  initialTeams,
}: {
  initialTeams: PublicTeam[];
}) {
  const [activeBatch, setActiveBatch] = useState<string>("All");
  const [search, setSearch] = useState("");

  /* Filtered teams */
  const filtered = useMemo(() => {
    let result = initialTeams;
    if (activeBatch !== "All") {
      result = result.filter((t) => t.batch === activeBatch);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.team_name.toLowerCase().includes(q) ||
          t.captain_name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [initialTeams, activeBatch, search]);

  /* Per-batch counts for filter pills */
  const batchCounts = useMemo(() => {
    const counts: Record<string, number> = { All: initialTeams.length };
    for (const b of ALL_BATCHES) {
      counts[b] = initialTeams.filter((t) => t.batch === b).length;
    }
    return counts;
  }, [initialTeams]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060c1a]">
      {/* ── Background ────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(53,215,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(53,215,255,1) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        {/* Batch-colored glow orbs */}
        <div className="absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/8 blur-[180px]" />
        <div className="absolute -right-32 top-1/2 h-[400px] w-[400px] rounded-full bg-violet-500/8 blur-[160px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-amber-500/6 blur-[140px]" />
      </div>

      {/* ── Page header ───────────────────────────────────── */}
      <div className="relative z-10 border-b border-white/[0.06] px-6 pb-12 pt-14 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
        >
          <span className="font-mono-score text-[11px] uppercase tracking-[0.45em] text-gold-400">
            InfoBash V5.0 · Faculty of Computing · SUSL
          </span>

          <h1 className="mt-3 font-display text-5xl tracking-wide text-ivory-50 sm:text-6xl">
            The{" "}
            <span className="text-gradient-cyan">Challengers</span>
          </h1>

          {/* Live count badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
            <span className="font-mono-score text-xs tracking-widest text-cyan-300">
              {initialTeams.length}{" "}
              {initialTeams.length === 1 ? "Team" : "Teams"} Registered
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Controls ──────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Filter pills */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-wrap gap-2"
          >
            <FilterPill
              label="All"
              active={activeBatch === "All"}
              count={batchCounts["All"]}
              onClick={() => setActiveBatch("All")}
            />
            {ALL_BATCHES.map((b) => (
              <FilterPill
                key={b}
                label={b}
                active={activeBatch === b}
                count={batchCounts[b]}
                color={BATCH_COLORS[b]}
                onClick={() => setActiveBatch(b)}
              />
            ))}
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="relative"
          >
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory-500"
            />
            <input
              type="text"
              placeholder="Search teams or captains…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-4 text-sm text-ivory-50 placeholder:text-ivory-500 outline-none transition-colors focus:border-cyan-400/40 focus:bg-white/[0.06] sm:w-72"
            />
          </motion.div>
        </div>

        {/* ── Cards grid ──────────────────────────────────── */}
        <div className="mt-8">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filtered.map((team, i) => (
                  <TeamCard key={team.id} team={team} index={i} />
                ))}
              </motion.div>
            ) : (
              /* Empty state */
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-5 py-28 text-center"
              >
                {initialTeams.length === 0 ? (
                  <>
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/5">
                      <Trophy size={36} className="text-cyan-400/60" />
                    </div>
                    <div>
                      <p className="font-display text-2xl text-ivory-300">
                        No teams yet
                      </p>
                      <p className="mt-1 text-sm text-ivory-500">
                        Be the first batch to step up and register.
      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      <Users size={28} className="text-ivory-500" />
                    </div>
                    <div>
                      <p className="font-display text-xl text-ivory-300">
                        No matches found
                      </p>
                      <p className="mt-1 text-sm text-ivory-500">
                        Try a different search or filter.
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Batch breakdown bar */}
        {initialTeams.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-14 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
          >
            <p className="mb-4 font-mono-score text-[10px] uppercase tracking-[0.4em] text-ivory-500">
              Batch Breakdown
            </p>
            <div className="flex flex-col gap-3">
              {ALL_BATCHES.map((b) => {
                const count = batchCounts[b];
                const pct =
                  initialTeams.length > 0
                    ? Math.round((count / initialTeams.length) * 100)
                    : 0;
                const color = BATCH_COLORS[b];
                return (
                  <div key={b} className="flex items-center gap-3">
                    <span className="w-20 text-right font-mono-score text-[11px] text-ivory-400">
                      {b}
                    </span>
                    <div className="flex-1 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        className="h-2 rounded-full"
                        style={{ background: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                      />
                    </div>
                    <span
                      className="w-8 font-mono-score text-[11px]"
                      style={{ color }}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}

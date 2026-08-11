"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  ChevronRight,
  Trophy,
  Crown,
  Users,
  User,
  CheckCircle2,
  Award,
  Loader2,
  Calendar,
  MapPin,
  Clock,
  Lock,
} from "lucide-react";

import Bracket, { type PlayoffMatch } from "@/components/Matches";
import GroupStandings, { type GroupData, type GroupMatch } from "@/components/GroupStandings";
import type { PublicTeam, Player } from "@/app/api/teams/route";

export interface MatchApiRow {
  id: string;
  stage: "group" | "round1" | "quarterfinal" | "semifinal" | "final" | "custom";
  label: string | null;
  status: "scheduled" | "live" | "completed";
  team_a_score: number | null;
  team_b_score: number | null;
  team_a_wickets?: number | null;
  team_b_wickets?: number | null;
  team_a_overs?: string | number | null;
  team_b_overs?: string | number | null;
  scheduled_at?: string | null;
  venue?: string | null;
  group_name: string | null;
  team_a_id: string | null;
  team_a_name: string | null;
  team_b_id: string | null;
  team_b_name: string | null;
  winner_id: string | null;
  winner_name: string | null;
}

export type StageRound = "round1" | "semifinal" | "final";

export const TOURNAMENT_ROUNDS: { id: StageRound; label: string; shortLabel: string }[] = [
  { id: "round1", label: "1st Round", shortLabel: "Round 1" },
  { id: "semifinal", label: "Semifinals", shortLabel: "SF" },
  { id: "final", label: "Final", shortLabel: "Final" },
];

const STAGE_LEVELS: Record<StageRound, number> = {
  round1: 1,
  semifinal: 2,
  final: 3,
};

const POLL_MS = 15000;

export default function MatchesLive() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [matches, setMatches] = useState<MatchApiRow[]>([]);
  const [registeredTeams, setRegisteredTeams] = useState<PublicTeam[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchApiRow | null>(null);

  // Selected round tab state (defaults to server live round setting)
  const [selectedRound, setSelectedRound] = useState<StageRound>("round1");
  const [serverLiveRound, setServerLiveRound] = useState<StageRound>("round1");
  const [matchesPublished, setMatchesPublished] = useState(false);
  const [userHasSelectedRound, setUserHasSelectedRound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [matchesRes, teamsRes, settingsRes] = await Promise.all([
          fetch("/api/matches"),
          fetch("/api/teams"),
          fetch("/api/settings"),
        ]);
        const matchesJson = await matchesRes.json();
        const teamsJson = await teamsRes.json();
        const settingsJson = await settingsRes.json();

        if (cancelled) return;
        const dbMatches: MatchApiRow[] = matchesJson.matches ?? [];
        setMatches(dbMatches);
        setRegisteredTeams(teamsJson.teams ?? []);
        setMatchesPublished(Boolean(settingsJson.matchesPublished));
        setLoaded(true);

        const activeRoundFromSettings: StageRound = (settingsJson.activeRound as StageRound) || "round1";
        setServerLiveRound(activeRoundFromSettings);

        // If user hasn't manually clicked another round tab, auto-set selectedRound to active live round
        setUserHasSelectedRound((userClicked) => {
          if (!userClicked) {
            setSelectedRound(activeRoundFromSettings);
          }
          return userClicked;
        });
      } catch {
        if (!cancelled) setLoaded(true);
      }
    }

    load();
    const interval = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Detect live match in current database for active/selected round
  const liveMatchInDb = matches.find((m) => m.status === "live");

  // Active LIVE round ID set by Admin (or from live match stage)
  const liveRoundId: StageRound = serverLiveRound || (liveMatchInDb?.stage as StageRound) || "round1";

  // Featured Live Score match for the selected round directly from DB
  const liveMatch =
    matches.find(
      (m) =>
        m.status === "live" &&
        (m.stage === selectedRound || (selectedRound === "round1" && m.stage === "group"))
    ) ?? null;

  // Filter upcoming matches for the selected round directly from DB
  const upcomingMatches = matches.filter(
    (m) =>
      (m.stage === selectedRound || (selectedRound === "round1" && m.stage === "group")) &&
      (liveMatch ? m.id !== liveMatch.id : true) &&
      m.status === "scheduled"
  );

  // Filter completed matches for the selected round directly from DB
  const completedMatches = matches.filter(
    (m) =>
      (m.stage === selectedRound || (selectedRound === "round1" && m.stage === "group")) &&
      m.status === "completed"
  );

  // Fixtures are displayed only when manually published by admin in Admin Panel
  const hasFixtures = matchesPublished && matches.length > 0;

  // Helper function to format date
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d
        .toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .toUpperCase();
    } catch {
      return dateStr;
    }
  };

  // Helper function to format time (e.g., "08:00 PM")
  const formatTime = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  // Helper to calculate victory summary text
  const getResultSummary = (match: MatchApiRow) => {
    const winnerName = match.winner_name;
    const teamAName = match.team_a_name ?? "TEAM A";
    const teamBName = match.team_b_name ?? "TEAM B";

    if (winnerName) {
      if (
        match.team_a_score !== null &&
        match.team_b_score !== null &&
        match.team_a_score !== undefined &&
        match.team_b_score !== undefined
      ) {
        if (winnerName === teamAName && match.team_a_score > match.team_b_score) {
          const runDiff = match.team_a_score - match.team_b_score;
          return `${winnerName} won by ${runDiff} runs`;
        } else if (winnerName === teamBName && match.team_b_score > match.team_a_score) {
          const runDiff = match.team_b_score - match.team_a_score;
          return `${winnerName} won by ${runDiff} runs`;
        } else if (winnerName === teamBName) {
          const wktLeft = 10 - (match.team_b_wickets ?? 0);
          return `${winnerName} won by ${Math.max(wktLeft, 1)} wickets`;
        } else if (winnerName === teamAName) {
          const wktLeft = 10 - (match.team_a_wickets ?? 0);
          return `${winnerName} won by ${Math.max(wktLeft, 1)} wickets`;
        }
      }
      return `${winnerName} won the match`;
    }
    return "Match Completed";
  };

  // Resolve team details from database registered teams
  const getTeamDetails = (teamId: string | null, teamName: string | null) => {
    const found = registeredTeams.find(
      (t) =>
        (teamId && t.id === teamId) ||
        (teamName && t.team_name.toLowerCase() === teamName.toLowerCase())
    );

    if (found) {
      return {
        name: found.team_name,
        batch: found.batch,
        captain: found.captain_name,
        playerCount: found.players?.length ?? 0,
        players:
          found.players?.map((p, i) => {
            const pName = (p as any).fullName || (p as any).full_name || "Player";
            const isCaptain =
              found.captain_name &&
              pName.trim().toLowerCase() === found.captain_name.trim().toLowerCase();
            return `${p.position ?? i + 1}. ${pName}${isCaptain ? " (C)" : ""}`;
          }) ?? [],
      };
    }

    return {
      name: teamName ?? "TBD",
      batch: "N/A",
      captain: "N/A",
      playerCount: 0,
      players: [],
    };
  };

  const teamADetails = selectedMatch
    ? getTeamDetails(selectedMatch.team_a_id, selectedMatch.team_a_name)
    : null;

  const teamBDetails = selectedMatch
    ? getTeamDetails(selectedMatch.team_b_id, selectedMatch.team_b_name)
    : null;

  if (!loaded) {
    return (
      <div className="flex justify-center items-center py-20 text-ivory-400">
        <Loader2 className="animate-spin text-cyan-400 mr-2" size={24} /> Loading Match Center...
      </div>
    );
  }

  if (!hasFixtures) {
    return (
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16 text-center">
        <div className="glass-card glow-border relative overflow-hidden rounded-3xl p-5 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_35px_-5px_rgba(53,215,255,0.4)] sm:h-20 sm:w-20 sm:rounded-3xl">
            <Trophy size={32} className="sm:hidden" />
            <Trophy size={36} className="hidden sm:block" />
          </div>

          <span className="mt-4 sm:mt-6 inline-block font-mono-score text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-gold-400">
            InfoBash V5.0 · Tournament Update
          </span>

          <h2 className="mt-2 font-display text-2xl tracking-wide text-ivory-50 sm:mt-3 sm:text-5xl">
            Matches &amp; Schedules Coming Soon
          </h2>

          <p className="mx-auto mt-3 sm:mt-4 max-w-xl text-xs sm:text-base text-ivory-300 leading-relaxed">
            Team registrations are currently open. Match schedules, fixtures, and live score tracking will be published here as soon as all team registrations are completed!
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <div className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-navy-900/60 px-4 py-2.5 text-xs text-ivory-200">
              <Users size={16} className="text-cyan-400 shrink-0" />
              <span>Registered Teams: <strong className="text-cyan-300 font-bold">{registeredTeams.length} Teams Registered</strong></span>
            </div>
            <div className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-navy-900/60 px-4 py-2.5 text-xs text-ivory-200">
              <Clock size={16} className="text-gold-400 shrink-0" />
              <span>Status: <strong className="text-gold-400 font-bold">Team Registration Open</strong></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Selected round label helper
  const selectedRoundObj =
    TOURNAMENT_ROUNDS.find((r) => r.id === selectedRound) ?? TOURNAMENT_ROUNDS[0];

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* ══════════════════════════════════════════════════════════════
          ROUND SELECTOR NAVIGATION BAR
      ══════════════════════════════════════════════════════════════ */}
      <div className="mb-8 sm:mb-10 flex flex-col items-center justify-center gap-2.5 sm:gap-3">
        <span className="font-mono-score text-[10px] sm:text-[11px] uppercase tracking-[0.25em] sm:tracking-[0.35em] text-ivory-400">
          Select Tournament Round
        </span>

        {/* Round Selector Buttons */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#070e1c]/90 p-1.5 shadow-2xl backdrop-blur-xl sm:gap-3 sm:rounded-full sm:p-2 sm:px-4">
          {TOURNAMENT_ROUNDS.map((round) => {
            const isSelected = selectedRound === round.id;
            const isLiveNow = liveRoundId === round.id;
            const isLocked = (STAGE_LEVELS[round.id] ?? 1) > (STAGE_LEVELS[serverLiveRound] ?? 1);

            return (
              <button
                key={round.id}
                onClick={() => {
                  setSelectedRound(round.id);
                  setUserHasSelectedRound(true);
                }}
                className={`relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 font-mono-score text-[11px] font-bold uppercase tracking-wider transition-all duration-300 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-xs ${isSelected
                    ? "bg-emerald-500 text-navy-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105"
                    : "border border-white/10 bg-white/[0.03] text-ivory-300 hover:border-emerald-500/40 hover:text-white"
                  }`}
              >
                {/* Live Indicator Pulse Badge if this round is live right now */}
                {isLiveNow && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                )}

                {isLocked && !isLiveNow && <Lock size={12} className="text-ivory-400" />}

                <span>{round.label}</span>

                {/* LIVE badge label tag */}
                {isLiveNow && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest ${isSelected
                        ? "bg-navy-950/80 text-emerald-300"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                  >
                    LIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Status Indicator text */}
        <div className="mt-1 text-center font-mono-score text-[10px] sm:text-[11px] text-ivory-400">
          Current Live Round:{" "}
          <strong className="text-emerald-400 uppercase tracking-wider">
            {TOURNAMENT_ROUNDS.find((r) => r.id === liveRoundId)?.label ?? "1st Round"}
          </strong>
        </div>
      </div>

      {/* Lock Guard: Hide semifinals & final teams until that stage is set Live by admin */}
      {(STAGE_LEVELS[selectedRound] ?? 1) > (STAGE_LEVELS[serverLiveRound] ?? 1) ? (
        <div className="mx-auto max-w-2xl py-8 sm:py-12 text-center">
          <div className="relative overflow-hidden rounded-3xl border border-gold-500/30 bg-[#070e1c]/90 p-6 sm:p-12 shadow-2xl backdrop-blur-xl space-y-3 sm:space-y-4">
            <div className="mx-auto grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-2xl bg-gold-400/10 border border-gold-400/30 text-gold-400">
              <Lock size={28} className="sm:hidden" />
              <Lock size={32} className="hidden sm:block" />
            </div>
            <h3 className="font-display text-xl tracking-wide text-ivory-50 sm:text-3xl">
              {selectedRoundObj.label} Stage Coming Soon
            </h3>
            <p className="mx-auto max-w-md text-xs leading-relaxed text-ivory-300">
              Groups, teams, and fixtures for {selectedRoundObj.label} will be unlocked and displayed here automatically as soon as organizers set the {selectedRoundObj.label} stage Live in the Admin Panel!
            </p>
          </div>
        </div>
      ) : (
        <>

      {/* ══════════════════════════════════════════════════════════════
          MATCH SPOTLIGHT / LIVE SCORE SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section className="mb-10 sm:mb-14">
        {/* Section Header */}
        <div className="mb-5 sm:mb-6 flex items-center justify-center gap-3 sm:gap-4 text-center">
          <div className="h-[2px] w-8 bg-emerald-500/40 sm:w-24" />
          <h2 className="flex items-center gap-2 font-display text-base font-bold uppercase tracking-[0.2em] text-emerald-400 sm:text-2xl sm:tracking-[0.3em]">
            <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-500" />
            </span>
            Live Score · {selectedRoundObj.label}
          </h2>
          <div className="h-[2px] w-8 bg-emerald-500/40 sm:w-24" />
        </div>

        {/* Live Score Spotlight Card */}
        {liveMatch ? (
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-emerald-500/30 bg-[#070e1c]/90 p-4 sm:p-10 shadow-[0_0_50px_rgba(16,185,129,0.12)] backdrop-blur-xl">
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />

            {/* Header Info */}
            <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/logo.png"
                  alt="InfoBash logo"
                  width={26}
                  height={26}
                  className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
                />
                <span className="font-display text-xs font-extrabold tracking-[0.15em] sm:tracking-[0.2em] text-ivory-50 sm:text-base">
                  INFO<span className="text-gradient-cyan">BASH</span>{" "}
                  <span className="font-mono-score text-[10px] sm:text-xs font-semibold tracking-wider text-gold-400">
                    V5.0 · {selectedRoundObj.shortLabel}
                  </span>
                </span>
              </div>
              {liveMatch.label && (
                <span className="font-mono-score text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {liveMatch.label}
                </span>
              )}
            </div>

            {/* Teams & Score Display */}
            <div className="grid grid-cols-1 items-center gap-4 sm:gap-6 md:grid-cols-7">
              {/* Team A */}
              <div className="flex flex-col items-center text-center md:col-span-3">
                <h3 className="font-display text-xl sm:text-3xl font-extrabold tracking-wide text-ivory-50 max-w-full truncate px-2">
                  {liveMatch.team_a_name ?? "TBD"}
                </h3>

                <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
                  <span className="font-mono-score text-2xl sm:text-4xl font-bold tracking-tight text-emerald-400">
                    {liveMatch.team_a_score ?? 0}
                    <span className="text-ivory-300">/</span>
                    {liveMatch.team_a_wickets ?? 0}
                  </span>
                  <span className="font-mono-score text-xs sm:text-base text-ivory-400">
                    ({liveMatch.team_a_overs ?? "0.0"} ov)
                  </span>
                </div>
              </div>

              {/* VS Badge */}
              <div className="flex justify-center my-0.5 sm:my-0 md:col-span-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20 font-bold text-emerald-400 text-xs shadow-[0_0_20px_rgba(16,185,129,0.25)] sm:h-14 sm:w-14 sm:text-lg">
                  VS
                </div>
              </div>

              {/* Team B */}
              <div className="flex flex-col items-center text-center md:col-span-3">
                <h3 className="font-display text-xl sm:text-3xl font-extrabold tracking-wide text-ivory-50 max-w-full truncate px-2">
                  {liveMatch.team_b_name ?? "TBD"}
                </h3>

                <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
                  <span className="font-mono-score text-2xl sm:text-4xl font-bold tracking-tight text-emerald-400">
                    {liveMatch.team_b_score ?? 0}
                    <span className="text-ivory-300">/</span>
                    {liveMatch.team_b_wickets ?? 0}
                  </span>
                  <span className="font-mono-score text-xs sm:text-base text-ivory-400">
                    ({liveMatch.team_b_overs ?? "0.0"} ov)
                  </span>
                </div>
              </div>
            </div>

            {/* View Details Button in Spotlight */}
            <div className="mt-5 sm:mt-6 flex justify-center border-t border-white/10 pt-3.5 sm:pt-4">
              <button
                type="button"
                onClick={() => setSelectedMatch(liveMatch)}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 font-mono-score text-xs font-bold tracking-wider text-emerald-400 transition-colors hover:bg-emerald-500/20 hover:text-emerald-300"
              >
                <span>View Live Match Squad &amp; Details</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#070e1c]/60 p-5 sm:p-8 text-center backdrop-blur-md">
            <span className="font-mono-score text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-ivory-400">
              No Live Match currently in progress for {selectedRoundObj.label}
            </span>
            <p className="mt-1.5 text-xs text-ivory-500">
              Live scorecards broadcast automatically here when an admin sets a match to Live in the Admin Panel.
            </p>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════
          UPCOMING MATCHES SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section className="mb-14">
        {/* Section Header */}
        <div className="mb-6 flex items-center justify-center gap-4 text-center">
          <div className="h-[2px] w-12 bg-emerald-500/40 sm:w-24" />
          <h2 className="font-display text-lg font-bold uppercase tracking-[0.3em] text-emerald-400 sm:text-xl">
            Upcoming Matches In {selectedRoundObj.label}
          </h2>
          <div className="h-[2px] w-12 bg-emerald-500/40 sm:w-24" />
        </div>

        {upcomingMatches.length === 0 ? (
          <div className="mx-auto max-w-md rounded-xl border border-white/10 bg-white/[0.02] p-5 text-center text-xs text-ivory-400">
            No scheduled upcoming fixtures in {selectedRoundObj.label} yet.
          </div>
        ) : (
          <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-w-5xl">
            {upcomingMatches.map((match) => (
              <div
                key={match.id}
                className="group relative flex w-full flex-col justify-between rounded-xl border border-white/10 bg-[#070e1c]/80 p-3.5 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]"
              >
                {/* Top Teams Row */}
                <div className="flex items-center justify-between gap-1.5 text-center">
                  <div className="flex-1 min-w-0">
                    <span className="block truncate font-display text-xs font-extrabold tracking-wide text-ivory-50 group-hover:text-white sm:text-sm">
                      {match.team_a_name ?? "TBD"}
                    </span>
                  </div>

                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 font-bold text-[9px] text-ivory-300">
                    VS
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="block truncate font-display text-xs font-extrabold tracking-wide text-ivory-50 group-hover:text-white sm:text-sm">
                      {match.team_b_name ?? "TBD"}
                    </span>
                  </div>
                </div>

                {/* Scheduled Info if present */}
                {(match.venue || match.scheduled_at) && (
                  <div className="mt-2 text-center text-[10px] text-ivory-400 space-y-0.5">
                    {match.venue && <div>📍 {match.venue}</div>}
                    {match.scheduled_at && (
                      <div>📅 {formatDate(match.scheduled_at)} · {formatTime(match.scheduled_at)}</div>
                    )}
                  </div>
                )}

                {/* View Details Link */}
                <div className="mt-3 flex justify-center border-t border-white/10 pt-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedMatch(match)}
                    className="inline-flex items-center gap-1 font-mono-score text-[11px] font-semibold tracking-wider text-emerald-400 transition-colors hover:text-emerald-300"
                  >
                    <span>View Details</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════
          COMPLETED MATCH RESULTS SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section className="mb-12">
        {/* Section Header */}
        <div className="mb-6 flex items-center justify-center gap-3 sm:gap-4 text-center">
          <div className="h-[2px] w-8 bg-gold-400/40 sm:w-24" />
          <h2 className="flex items-center gap-2 font-display text-base font-bold uppercase tracking-[0.2em] text-gold-400 sm:text-xl sm:tracking-[0.3em]">
            <Trophy size={16} className="text-gold-400 shrink-0 sm:hidden" />
            <Trophy size={18} className="text-gold-400 shrink-0 hidden sm:block" />
            Match Results · {selectedRoundObj.label}
          </h2>
          <div className="h-[2px] w-8 bg-gold-400/40 sm:w-24" />
        </div>

        {completedMatches.length === 0 ? (
          <div className="mx-auto max-w-md rounded-xl border border-white/10 bg-white/[0.02] p-5 text-center text-xs text-ivory-400">
            No completed match results in {selectedRoundObj.label} yet.
          </div>
        ) : (
          <div className="mx-auto max-w-4xl space-y-4">
            {completedMatches.map((match) => {
              const isTeamAWinner = match.winner_name === match.team_a_name;
              const isTeamBWinner = match.winner_name === match.team_b_name;

              return (
                <div
                  key={match.id}
                  className="group relative overflow-hidden rounded-2xl border border-gold-400/20 bg-[#070e1c]/90 p-3.5 shadow-xl transition-all duration-300 hover:border-gold-400/50 hover:shadow-[0_0_30px_rgba(245,185,66,0.15)] sm:p-5"
                >
                  {/* Header Row */}
                  <div className="mb-3 sm:mb-4 flex items-center justify-between border-b border-white/10 pb-2 sm:pb-2.5">
                    <span className="font-mono-score text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-gold-400">
                      {match.label || `${selectedRoundObj.shortLabel} MATCH`}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 sm:px-2.5 font-mono-score text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      Completed
                    </span>
                  </div>

                  {/* Scoreboard Grid */}
                  <div className="grid grid-cols-1 items-center gap-2.5 sm:gap-4 sm:grid-cols-7">
                    {/* Team A Scorebox */}
                    <div
                      className={`flex items-center justify-between gap-2 rounded-xl p-2.5 sm:p-3 sm:col-span-3 sm:flex-col sm:justify-center ${isTeamAWinner
                          ? "border border-gold-400/30 bg-gold-400/10 shadow-[0_0_15px_rgba(245,185,66,0.1)]"
                          : "bg-white/[0.02]"
                        }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        {isTeamAWinner && <Crown size={14} className="shrink-0 text-gold-400" />}
                        <span
                          className={`truncate font-display text-xs font-bold sm:text-base ${isTeamAWinner ? "text-gold-300 font-extrabold" : "text-ivory-100"
                            }`}
                        >
                          {match.team_a_name ?? "TBD"}
                        </span>
                      </div>

                      <div className="shrink-0 font-mono-score text-xs font-bold text-ivory-50 sm:mt-1 sm:text-base">
                        <span className={isTeamAWinner ? "text-gold-400 font-extrabold" : "text-ivory-200"}>
                          {match.team_a_score ?? 0}/{match.team_a_wickets ?? 0}
                        </span>{" "}
                        <span className="text-[10px] sm:text-[11px] text-ivory-400">({match.team_a_overs ?? "0.0"} ov)</span>
                      </div>
                    </div>

                    {/* Central VS Badge */}
                    <div className="flex justify-center my-0.5 sm:my-0 sm:col-span-1">
                      <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-gold-400/30 bg-gold-400/10 font-mono-score text-[10px] sm:text-xs font-bold text-gold-400">
                        VS
                      </div>
                    </div>

                    {/* Team B Scorebox */}
                    <div
                      className={`flex items-center justify-between gap-2 rounded-xl p-2.5 sm:p-3 sm:col-span-3 sm:flex-col sm:justify-center ${isTeamBWinner
                          ? "border border-gold-400/30 bg-gold-400/10 shadow-[0_0_15px_rgba(245,185,66,0.1)]"
                          : "bg-white/[0.02]"
                        }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        {isTeamBWinner && <Crown size={14} className="shrink-0 text-gold-400" />}
                        <span
                          className={`truncate font-display text-xs font-bold sm:text-base ${isTeamBWinner ? "text-gold-300 font-extrabold" : "text-ivory-100"
                            }`}
                        >
                          {match.team_b_name ?? "TBD"}
                        </span>
                      </div>

                      <div className="shrink-0 font-mono-score text-xs font-bold text-ivory-50 sm:mt-1 sm:text-base">
                        <span className={isTeamBWinner ? "text-gold-400 font-extrabold" : "text-ivory-200"}>
                          {match.team_b_score ?? 0}/{match.team_b_wickets ?? 0}
                        </span>{" "}
                        <span className="text-[10px] sm:text-[11px] text-ivory-400">({match.team_b_overs ?? "0.0"} ov)</span>
                      </div>
                    </div>
                  </div>

                  {/* Victory Result Banner & Action Button */}
                  <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-t border-white/10 pt-2.5 sm:pt-3">
                    <div className="flex items-center gap-1.5 sm:gap-2 font-mono-score text-[11px] sm:text-xs font-bold text-gold-300">
                      <Award size={14} className="text-gold-400 shrink-0" />
                      <span>{getResultSummary(match)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedMatch(match)}
                      className="inline-flex items-center gap-1 font-mono-score text-[10px] sm:text-[11px] font-semibold tracking-wider text-gold-400 hover:text-gold-300"
                    >
                      <span>Match Squad &amp; Details</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      </>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TEAM DETAILS MODAL OVERLAY
      ══════════════════════════════════════════════════════════════ */}
      {(() => {
        if (!selectedMatch || !mounted) return null;

        const teamAObj = registeredTeams.find(
          (t) =>
            (selectedMatch.team_a_id && t.id === selectedMatch.team_a_id) ||
            (selectedMatch.team_a_name && t.team_name.toLowerCase() === selectedMatch.team_a_name.toLowerCase())
        );

        const teamBObj = registeredTeams.find(
          (t) =>
            (selectedMatch.team_b_id && t.id === selectedMatch.team_b_id) ||
            (selectedMatch.team_b_name && t.team_name.toLowerCase() === selectedMatch.team_b_name.toLowerCase())
        );

        const teamADetails = {
          name: teamAObj?.team_name ?? selectedMatch.team_a_name ?? "Team A",
          batch: teamAObj?.batch ?? "N/A",
          captainName: teamAObj?.captain_name ?? "TBD",
          players: teamAObj?.players ?? [],
        };

        const teamBDetails = {
          name: teamBObj?.team_name ?? selectedMatch.team_b_name ?? "Team B",
          batch: teamBObj?.batch ?? "N/A",
          captainName: teamBObj?.captain_name ?? "TBD",
          players: teamBObj?.players ?? [],
        };

        return createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-navy-950/95 p-3 sm:p-4 backdrop-blur-md">
            <div className="relative my-auto flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-emerald-500/40 bg-[#070e1c] p-4 shadow-2xl sm:p-5">
              <button
                type="button"
                onClick={() => setSelectedMatch(null)}
                className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-ivory-400 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div className="mb-3 shrink-0 text-center pr-6 sm:pr-0">
                <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] text-emerald-400">
                  <Trophy size={12} />
                  <span className="font-mono-score tracking-wider uppercase">
                    {selectedMatch.label || `${selectedMatch.stage.toUpperCase()} MATCH SQUAD & DETAILS`}
                  </span>
                </div>
                <h3 className="font-display text-base font-bold tracking-wide text-ivory-50 sm:text-xl">
                  Match Team Details
                </h3>
              </div>

              {/* Modal Body Container with Smooth Scroll */}
              <div className="overflow-y-auto pr-1 space-y-3">
                {/* Team Details Comparison Grid */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Team A Details Card */}
                  <div className="rounded-xl border border-emerald-500/20 bg-white/[0.02] p-3.5">
                    <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400">Team A</span>
                        <h4 className="truncate font-display text-base font-bold text-ivory-50">{teamADetails.name}</h4>
                      </div>
                      {teamADetails.batch !== "N/A" && (
                        <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono-score text-[10px] text-emerald-300">
                          {teamADetails.batch}
                        </span>
                      )}
                    </div>

                    {/* Captain Info */}
                    <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-emerald-500/10 p-2 text-xs text-emerald-300">
                      <Crown size={14} className="shrink-0 text-emerald-400" />
                      <div className="min-w-0 flex-1">
                        <span className="block text-[8px] font-mono uppercase text-emerald-400 opacity-75">Team Captain</span>
                        <span className="truncate font-semibold block">{teamADetails.captainName}</span>
                      </div>
                    </div>

                    {/* Playing XI List */}
                    <div className="space-y-1">
                      <span className="block text-[9px] font-mono uppercase tracking-wider text-ivory-400">
                        Playing Squad ({teamADetails.players.length})
                      </span>
                      <div className="max-h-40 overflow-y-auto space-y-1 pr-1 text-xs text-ivory-200">
                        {teamADetails.players.length > 0 ? (
                          teamADetails.players.map((p: any, idx: number) => {
                            const pName = typeof p === "string" ? p : p?.fullName || p?.full_name || "Player";
                            const pPos = typeof p === "object" && p?.position ? `${p.position}. ` : `${idx + 1}. `;
                            return (
                              <div key={idx} className="flex items-center gap-1.5 rounded bg-white/5 px-2 py-1">
                                <User size={12} className="shrink-0 text-emerald-400" />
                                <span className="truncate">{pPos}{pName}</span>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-[11px] italic text-ivory-400">No players listed</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Team B Details Card */}
                  <div className="rounded-xl border border-emerald-500/20 bg-white/[0.02] p-3.5">
                    <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400">Team B</span>
                        <h4 className="truncate font-display text-base font-bold text-ivory-50">{teamBDetails.name}</h4>
                      </div>
                      {teamBDetails.batch !== "N/A" && (
                        <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono-score text-[10px] text-emerald-300">
                          {teamBDetails.batch}
                        </span>
                      )}
                    </div>

                    {/* Captain Info */}
                    <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-emerald-500/10 p-2 text-xs text-emerald-300">
                      <Crown size={14} className="shrink-0 text-emerald-400" />
                      <div className="min-w-0 flex-1">
                        <span className="block text-[8px] font-mono uppercase text-emerald-400 opacity-75">Team Captain</span>
                        <span className="truncate font-semibold block">{teamBDetails.captainName}</span>
                      </div>
                    </div>

                    {/* Playing XI List */}
                    <div className="space-y-1">
                      <span className="block text-[9px] font-mono uppercase tracking-wider text-ivory-400">
                        Playing Squad ({teamBDetails.players.length})
                      </span>
                      <div className="max-h-40 overflow-y-auto space-y-1 pr-1 text-xs text-ivory-200">
                        {teamBDetails.players.length > 0 ? (
                          teamBDetails.players.map((p: any, idx: number) => {
                            const pName = typeof p === "string" ? p : p?.fullName || p?.full_name || "Player";
                            const pPos = typeof p === "object" && p?.position ? `${p.position}. ` : `${idx + 1}. `;
                            return (
                              <div key={idx} className="flex items-center gap-1.5 rounded bg-white/5 px-2 py-1">
                                <User size={12} className="shrink-0 text-emerald-400" />
                                <span className="truncate">{pPos}{pName}</span>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-[11px] italic text-ivory-400">No players listed</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Close button */}
              <div className="mt-3 flex shrink-0 items-center justify-end border-t border-white/10 pt-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedMatch(null)}
                  className="rounded-full bg-emerald-500 px-5 py-1.5 text-xs font-bold text-navy-950 hover:bg-emerald-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}
    </div>
  );
}

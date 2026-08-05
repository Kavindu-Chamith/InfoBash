"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Calendar,
  Clock,
  X,
  Radio,
  ChevronRight,
  MapPin,
  Trophy,
  Crown,
  Users,
  User,
  Shield,
  CheckCircle2,
  Award,
  Sparkles,
  Flame,
  Loader2,
} from "lucide-react";

// Retaining Bracket import & component in codebase without deleting
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

export type StageRound = "round1" | "quarterfinal" | "semifinal" | "final";

export const TOURNAMENT_ROUNDS: { id: StageRound; label: string; shortLabel: string }[] = [
  { id: "round1", label: "1st Round", shortLabel: "Round 1" },
  { id: "quarterfinal", label: "Quarterfinals", shortLabel: "QF" },
  { id: "semifinal", label: "Semifinals", shortLabel: "SF" },
  { id: "final", label: "Final", shortLabel: "Final" },
];

const POLL_MS = 15000;

// Sample upcoming matches per round for demo display
const DEFAULT_ROUNDS_UPCOMING: Record<StageRound, MatchApiRow[]> = {
  round1: [
    {
      id: "r1-1",
      stage: "round1",
      label: "1ST ROUND · MATCH 02",
      status: "scheduled",
      team_a_score: null,
      team_b_score: null,
      scheduled_at: "2026-05-28T18:30:00Z",
      venue: "Main Ground",
      group_name: "Group A",
      team_a_id: "t1",
      team_a_name: "MAN UNITED",
      team_b_id: "t2",
      team_b_name: "LIVERPOOL",
      winner_id: null,
      winner_name: null,
    },
    {
      id: "r1-2",
      stage: "round1",
      label: "1ST ROUND · MATCH 03",
      status: "scheduled",
      team_a_score: null,
      team_b_score: null,
      scheduled_at: "2026-05-29T21:00:00Z",
      venue: "Ground B",
      group_name: "Group B",
      team_a_id: "t3",
      team_a_name: "BAYERN MUNICH",
      team_b_id: "t4",
      team_b_name: "DORTMUND",
      winner_id: null,
      winner_name: null,
    },
    {
      id: "r1-3",
      stage: "round1",
      label: "1ST ROUND · MATCH 04",
      status: "scheduled",
      team_a_score: null,
      team_b_score: null,
      scheduled_at: "2026-05-30T19:45:00Z",
      venue: "Main Ground",
      group_name: "Group C",
      team_a_id: "t5",
      team_a_name: "PSG",
      team_b_id: "t6",
      team_b_name: "MARSEILLE",
      winner_id: null,
      winner_name: null,
    },
  ],
  quarterfinal: [
    {
      id: "qf-1",
      stage: "quarterfinal",
      label: "QUARTERFINAL · GAME 01",
      status: "scheduled",
      team_a_score: null,
      team_b_score: null,
      scheduled_at: "2026-05-29T14:00:00Z",
      venue: "Main Ground",
      group_name: "QF 1",
      team_a_id: "q1",
      team_a_name: "PHOENIX LIONS",
      team_b_id: "q2",
      team_b_name: "ROYAL STRIKERS",
      winner_id: null,
      winner_name: null,
    },
    {
      id: "qf-2",
      stage: "quarterfinal",
      label: "QUARTERFINAL · GAME 02",
      status: "scheduled",
      team_a_score: null,
      team_b_score: null,
      scheduled_at: "2026-05-29T16:30:00Z",
      venue: "Main Ground",
      group_name: "QF 2",
      team_a_id: "q3",
      team_a_name: "LEGACY KINGS",
      team_b_id: "q4",
      team_b_name: "BYTE FORCE",
      winner_id: null,
      winner_name: null,
    },
  ],
  semifinal: [
    {
      id: "sf-1",
      stage: "semifinal",
      label: "SEMIFINAL · GAME 01",
      status: "scheduled",
      team_a_score: null,
      team_b_score: null,
      scheduled_at: "2026-05-30T15:00:00Z",
      venue: "Main Stadium",
      group_name: "Semi Final 1",
      team_a_id: "s1",
      team_a_name: "TITAN XI",
      team_b_id: "s2",
      team_b_name: "LEGACY KINGS",
      winner_id: null,
      winner_name: null,
    },
  ],
  final: [
    {
      id: "fn-1",
      stage: "final",
      label: "CHAMPIONSHIP FINAL",
      status: "scheduled",
      team_a_score: null,
      team_b_score: null,
      scheduled_at: "2026-05-30T18:00:00Z",
      venue: "Main Stadium",
      group_name: "Grand Final",
      team_a_id: "fn1",
      team_a_name: "CYBER KNIGHTS",
      team_b_id: "fn2",
      team_b_name: "LEGACY KINGS",
      winner_id: null,
      winner_name: null,
    },
  ],
};

// Sample live match per round for demo display
const DEFAULT_ROUNDS_LIVE: Record<StageRound, MatchApiRow> = {
  round1: {
    id: "live-r1",
    stage: "round1",
    label: "INFOBASH V5.0 · 1ST ROUND",
    status: "live",
    team_a_score: 142,
    team_b_score: 98,
    team_a_wickets: 4,
    team_b_wickets: 2,
    team_a_overs: "18.2",
    team_b_overs: "12.0",
    scheduled_at: "2026-05-26T20:00:00Z",
    venue: "Faculty Stadium",
    group_name: "1st Round Spotlight",
    team_a_id: "barca",
    team_a_name: "FC BARCELONA",
    team_b_id: "real",
    team_b_name: "REAL MADRID",
    winner_id: null,
    winner_name: null,
  },
  quarterfinal: {
    id: "live-qf",
    stage: "quarterfinal",
    label: "INFOBASH V5.0 · QUARTERFINAL",
    status: "live",
    team_a_score: 154,
    team_b_score: 120,
    team_a_wickets: 6,
    team_b_wickets: 3,
    team_a_overs: "20.0",
    team_b_overs: "15.4",
    scheduled_at: "2026-05-27T14:00:00Z",
    venue: "Main Ground",
    group_name: "Quarterfinal Spotlight",
    team_a_id: "ck",
    team_a_name: "CYBER KNIGHTS",
    team_b_id: "tx",
    team_b_name: "TITAN XI",
    winner_id: null,
    winner_name: null,
  },
  semifinal: {
    id: "live-sf",
    stage: "semifinal",
    label: "INFOBASH V5.0 · SEMIFINAL",
    status: "live",
    team_a_score: 178,
    team_b_score: 110,
    team_a_wickets: 4,
    team_b_wickets: 5,
    team_a_overs: "20.0",
    team_b_overs: "14.1",
    scheduled_at: "2026-05-28T16:00:00Z",
    venue: "Main Stadium",
    group_name: "Semifinal Spotlight",
    team_a_id: "ck",
    team_a_name: "CYBER KNIGHTS",
    team_b_id: "pl",
    team_b_name: "PHOENIX LIONS",
    winner_id: null,
    winner_name: null,
  },
  final: {
    id: "live-fn",
    stage: "final",
    label: "INFOBASH V5.0 · GRAND FINAL",
    status: "live",
    team_a_score: 190,
    team_b_score: 165,
    team_a_wickets: 3,
    team_b_wickets: 7,
    team_a_overs: "20.0",
    team_b_overs: "18.5",
    scheduled_at: "2026-05-30T18:00:00Z",
    venue: "Main Stadium",
    group_name: "Championship Final",
    team_a_id: "ck",
    team_a_name: "CYBER KNIGHTS",
    team_b_id: "lk",
    team_b_name: "LEGACY KINGS",
    winner_id: null,
    winner_name: null,
  },
};

// Sample completed matches per round for demo display
const DEFAULT_ROUNDS_COMPLETED: Record<StageRound, MatchApiRow[]> = {
  round1: [
    {
      id: "comp-r1-1",
      stage: "round1",
      label: "1ST ROUND · MATCH 01",
      status: "completed",
      team_a_score: 168,
      team_b_score: 145,
      team_a_wickets: 5,
      team_b_wickets: 8,
      team_a_overs: "20.0",
      team_b_overs: "20.0",
      scheduled_at: "2026-05-26T10:00:00Z",
      venue: "Main Ground",
      group_name: "Group A",
      team_a_id: "t1",
      team_a_name: "CYBER KNIGHTS",
      team_b_id: "t2",
      team_b_name: "CODE BREAKERS",
      winner_id: "t1",
      winner_name: "CYBER KNIGHTS",
    },
    {
      id: "comp-r1-2",
      stage: "round1",
      label: "1ST ROUND · MATCH 02",
      status: "completed",
      team_a_score: 132,
      team_b_score: 133,
      team_a_wickets: 9,
      team_b_wickets: 4,
      team_a_overs: "19.4",
      team_b_overs: "17.2",
      scheduled_at: "2026-05-26T14:00:00Z",
      venue: "Main Ground",
      group_name: "Group B",
      team_a_id: "t3",
      team_a_name: "QUANTUM STRIKERS",
      team_b_id: "t4",
      team_b_name: "TITAN XI",
      winner_id: "t4",
      winner_name: "TITAN XI",
    },
  ],
  quarterfinal: [
    {
      id: "comp-qf-1",
      stage: "quarterfinal",
      label: "QUARTERFINAL · GAME 01",
      status: "completed",
      team_a_score: 172,
      team_b_score: 157,
      team_a_wickets: 4,
      team_b_wickets: 9,
      team_a_overs: "20.0",
      team_b_overs: "20.0",
      scheduled_at: "2026-05-27T11:00:00Z",
      venue: "Ground B",
      group_name: "QF 1",
      team_a_id: "tb",
      team_a_name: "THUNDERBOLTS",
      team_b_id: "rt",
      team_b_name: "RANTHARU",
      winner_id: "tb",
      winner_name: "THUNDERBOLTS",
    },
  ],
  semifinal: [
    {
      id: "comp-sf-1",
      stage: "semifinal",
      label: "SEMIFINAL · GAME 01",
      status: "completed",
      team_a_score: 165,
      team_b_score: 166,
      team_a_wickets: 7,
      team_b_wickets: 6,
      team_a_overs: "20.0",
      team_b_overs: "19.3",
      scheduled_at: "2026-05-28T14:00:00Z",
      venue: "Main Stadium",
      group_name: "Semi Final 1",
      team_a_id: "cb",
      team_a_name: "CODE BREAKERS",
      team_b_id: "bm",
      team_b_name: "BAYERN MUNICH",
      winner_id: "bm",
      winner_name: "BAYERN MUNICH",
    },
  ],
  final: [
    {
      id: "comp-fn-1",
      stage: "final",
      label: "V4.0 CHAMPIONSHIP FINAL",
      status: "completed",
      team_a_score: 185,
      team_b_score: 170,
      team_a_wickets: 4,
      team_b_wickets: 8,
      team_a_overs: "20.0",
      team_b_overs: "20.0",
      scheduled_at: "2026-05-29T18:00:00Z",
      venue: "Main Stadium",
      group_name: "Final",
      team_a_id: "lk",
      team_a_name: "LEGACY KINGS",
      team_b_id: "pl",
      team_b_name: "PHOENIX LIONS",
      winner_id: "lk",
      winner_name: "LEGACY KINGS",
    },
  ],
};

// Fallback sample rosters for default demo teams
const SAMPLE_TEAM_DETAILS: Record<string, { batch: string; captain: string; squad: string[] }> = {
  "FC BARCELONA": {
    batch: "4th Year (Batch 20)",
    captain: "R. Lewandowski",
    squad: [
      "R. Lewandowski (C)",
      "L. Yamal",
      "P. Gavi",
      "P. Pedri",
      "F. de Jong",
      "M. ter Stegen",
      "J. Kounde",
      "R. Araujo",
      "R. Raphinha",
      "A. Balde",
      "I. Martinez",
    ],
  },
  "REAL MADRID": {
    batch: "3rd Year (Batch 21)",
    captain: "L. Modric",
    squad: [
      "L. Modric (C)",
      "K. Mbappe",
      "V. Vinicius Jr",
      "J. Bellingham",
      "F. Valverde",
      "T. Courtois",
      "D. Carvajal",
      "A. Rudiger",
      "E. Camavinga",
      "R. Rodrygo",
      "A. Tchouameni",
    ],
  },
  "CYBER KNIGHTS": {
    batch: "4th Year (Batch 20)",
    captain: "Lasith Malinga",
    squad: [
      "Lasith Malinga (C)",
      "Kumar Sangakkara",
      "Mahela Jayawardene",
      "Tillakaratne Dilshan",
      "Sanath Jayasuriya",
      "Muttiah Muralitharan",
      "Chaminda Vaas",
      "Angelo Mathews",
      "Upul Tharanga",
      "Rangana Herath",
      "Nuwan Kulasekara",
    ],
  },
  "CODE BREAKERS": {
    batch: "2nd Year (Batch 22)",
    captain: "Dimuth Karunaratne",
    squad: [
      "Dimuth Karunaratne (C)",
      "Lahiru Thirimanne",
      "Oshada Fernando",
      "Roshen Silva",
      "Niroshan Dickwella",
      "Suranga Lakmal",
      "Dhananjaya de Silva",
      "Vishwa Fernando",
      "Kasun Rajitha",
      "Asitha Fernando",
      "Prabath Jayasuriya",
    ],
  },
  "QUANTUM STRIKERS": {
    batch: "1st Year (Batch 23)",
    captain: "Dasun Shanaka",
    squad: [
      "Dasun Shanaka (C)",
      "Kusal Mendis",
      "Pathum Nissanka",
      "Charith Asalanka",
      "Bhanuka Rajapaksa",
      "Wanindu Hasaranga",
      "Maheesh Theekshana",
      "Dushmantha Chameera",
      "Lahiru Kumara",
      "Matheesha Pathirana",
      "Dilshan Madushanka",
    ],
  },
  "TITAN XI": {
    batch: "3rd Year (Batch 21)",
    captain: "Kusal Perera",
    squad: [
      "Kusal Perera (C)",
      "Avishka Fernando",
      "Dinesh Chandimal",
      "Sadeera Samarawickrama",
      "Kamindu Mendis",
      "Dunith Wellalage",
      "Chamika Karunaratne",
      "Jeffrey Vandersay",
      "Binura Fernando",
      "Nuwan Thushara",
      "Pramod Madushan",
    ],
  },
};

export default function MatchesLive() {
  const [matches, setMatches] = useState<MatchApiRow[]>([]);
  const [registeredTeams, setRegisteredTeams] = useState<PublicTeam[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchApiRow | null>(null);

  // Selected round tab state (defaults to server live round setting)
  const [selectedRound, setSelectedRound] = useState<StageRound>("round1");
  const [serverLiveRound, setServerLiveRound] = useState<StageRound>("round1");
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

  // Detect live match in current database
  const liveMatchInDb = matches.find((m) => m.status === "live");

  // Active LIVE round ID set by Admin (or from live match stage)
  const liveRoundId: StageRound = serverLiveRound || (liveMatchInDb?.stage as StageRound) || "round1";

  // Featured Live Score match for the selected round
  const liveMatch =
    matches.find((m) => m.status === "live" && (m.stage === selectedRound || (selectedRound === "round1" && m.stage === "group"))) ??
    DEFAULT_ROUNDS_LIVE[selectedRound] ??
    DEFAULT_ROUNDS_LIVE.round1;

  // Filter upcoming matches for the selected round
  const dbUpcomingSelected = matches.filter(
    (m) =>
      (m.stage === selectedRound || (selectedRound === "round1" && m.stage === "group")) &&
      m.id !== liveMatch.id &&
      m.status !== "completed"
  );

  const upcomingMatches =
    dbUpcomingSelected.length > 0
      ? dbUpcomingSelected
      : DEFAULT_ROUNDS_UPCOMING[selectedRound] ?? DEFAULT_ROUNDS_UPCOMING.round1;

  // Filter completed matches for the selected round
  const dbCompletedSelected = matches.filter(
    (m) =>
      (m.stage === selectedRound || (selectedRound === "round1" && m.stage === "group")) &&
      m.status === "completed"
  );

  const completedMatches =
    dbCompletedSelected.length > 0
      ? dbCompletedSelected
      : DEFAULT_ROUNDS_COMPLETED[selectedRound] ?? DEFAULT_ROUNDS_COMPLETED.round1;

  const hasFixtures = matches.length > 0;

  // Helper function to format date
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "08 AUG 2026";
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
    if (!dateStr) return "08:00 PM";
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

  // Helper to calculate or get victory summary text
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
        }
      }
      return `${winnerName} won the match`;
    }
    return "Match Completed";
  };

  // Resolve team details for modal
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
        playerCount: found.players?.length ?? 11,
        players: found.players?.map((p, i) => `${p.position ?? i + 1}. ${p.fullName}`) ?? [],
      };
    }

    const fallbackName = teamName ?? "TEAM";
    const sample = SAMPLE_TEAM_DETAILS[fallbackName.toUpperCase()] ?? {
      batch: "Inter-Batch Squad",
      captain: "Team Captain",
      squad: [
        "1. Captain",
        "2. Vice Captain",
        "3. Wicket Keeper",
        "4. All-Rounder 1",
        "5. All-Rounder 2",
        "6. Batsman 1",
        "7. Batsman 2",
        "8. Bowler 1",
        "9. Bowler 2",
        "10. Bowler 3",
        "11. Fielder",
      ],
    };

    return {
      name: fallbackName,
      batch: sample.batch,
      captain: sample.captain,
      playerCount: sample.squad.length,
      players: sample.squad,
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
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 text-center">
        <div className="glass-card glow-border relative overflow-hidden rounded-3xl p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-blue-600/30 to-cyan-400/30 border border-cyan-400/40 text-cyan-300 shadow-[0_0_35px_-5px_rgba(53,215,255,0.4)]">
            <Trophy size={36} />
          </div>

          <span className="mt-6 inline-block font-mono-score text-xs font-bold uppercase tracking-[0.3em] text-gold-400">
            InfoBash V5.0 · Tournament Update
          </span>

          <h2 className="mt-3 font-display text-4xl tracking-wide text-ivory-50 sm:text-5xl">
            Matches &amp; Schedules Coming Soon
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base text-ivory-300 leading-relaxed">
            Team registrations are currently open. Match schedules, fixtures, and live score tracking will be published here as soon as all team registrations are completed!
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-navy-900/60 px-5 py-3 text-xs text-ivory-200">
              <Users size={16} className="text-cyan-400" />
              <span>Registered Teams: <strong className="text-cyan-300 font-bold">{registeredTeams.length} Teams Registered</strong></span>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-navy-900/60 px-5 py-3 text-xs text-ivory-200">
              <Clock size={16} className="text-gold-400" />
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
          ROUND SELECTOR NAVIGATION BAR (4 BUTTONS WITH LIVE HIGHLIGHT)
      ══════════════════════════════════════════════════════════════ */}
      <div className="mb-10 flex flex-col items-center justify-center gap-3">
        <span className="font-mono-score text-[11px] uppercase tracking-[0.35em] text-ivory-400">
          Select Tournament Round
        </span>

        {/* 4 Round Selector Buttons */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2.5 rounded-full border border-white/10 bg-[#070e1c]/90 p-2 shadow-2xl backdrop-blur-xl sm:gap-3 sm:px-4">
          {TOURNAMENT_ROUNDS.map((round) => {
            const isSelected = selectedRound === round.id;
            const isLiveNow = liveRoundId === round.id;

            return (
              <button
                key={round.id}
                onClick={() => {
                  setSelectedRound(round.id);
                  setUserHasSelectedRound(true);
                }}
                className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono-score text-xs font-bold uppercase tracking-wider transition-all duration-300 sm:px-5 sm:py-2.5 ${
                  isSelected
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-400 text-navy-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105"
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

                <span>{round.label}</span>

                {/* LIVE badge label tag */}
                {isLiveNow && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest ${
                      isSelected
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
        <div className="mt-1 text-center font-mono-score text-[11px] text-ivory-400">
          Current Live Round:{" "}
          <strong className="text-emerald-400 uppercase tracking-wider">
            {TOURNAMENT_ROUNDS.find((r) => r.id === liveRoundId)?.label ?? "1st Round"}
          </strong>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MATCH SPOTLIGHT / LIVE SCORE SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section className="mb-14">
        {/* Section Header */}
        <div className="mb-6 flex items-center justify-center gap-4 text-center">
          <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-emerald-500 sm:w-24" />
          <h2 className="flex items-center gap-2.5 font-display text-xl font-bold uppercase tracking-[0.3em] text-emerald-400 sm:text-2xl">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
            Live Score · {selectedRoundObj.label}
          </h2>
          <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-emerald-500 sm:w-24" />
        </div>

        {/* Live Score Spotlight Card */}
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-emerald-500/30 bg-[#070e1c]/90 p-6 shadow-[0_0_50px_rgba(16,185,129,0.12)] backdrop-blur-xl sm:p-10">
          {/* Subtle decorative background gradient glows */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />

          {/* Card Top Sub-Header: InfoBash Logo & Title */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <Image
              src="/images/logo.png"
              alt="InfoBash logo"
              width={26}
              height={26}
              className="h-6 w-6 object-contain"
            />
            <span className="font-display text-sm font-extrabold tracking-[0.2em] text-ivory-50 sm:text-base">
              INFO<span className="text-gradient-cyan">BASH</span>{" "}
              <span className="font-mono-score text-xs font-semibold tracking-wider text-gold-400">
                V5.0 · {selectedRoundObj.shortLabel}
              </span>
            </span>
          </div>

          {/* Teams & Live Score Display */}
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-7">
            {/* Team A (Left side - No logo) */}
            <div className="flex flex-col items-center text-center md:col-span-3 md:items-center">
              <h3 className="font-display text-2xl font-extrabold tracking-wide text-ivory-50 sm:text-3xl">
                {liveMatch.team_a_name ?? "FC BARCELONA"}
              </h3>

              {/* Cricket Score Display */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-mono-score text-3xl font-bold tracking-tight text-emerald-400 sm:text-4xl">
                  {liveMatch.team_a_score !== null ? liveMatch.team_a_score : 142}
                  <span className="text-ivory-300">/</span>
                  {liveMatch.team_a_wickets !== undefined && liveMatch.team_a_wickets !== null
                    ? liveMatch.team_a_wickets
                    : 4}
                </span>
                <span className="font-mono-score text-sm text-ivory-400 sm:text-base">
                  ({liveMatch.team_a_overs ?? "18.2"} ov)
                </span>
              </div>
            </div>

            {/* VS Badge (Center) */}
            <div className="flex justify-center md:col-span-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20 font-bold text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)] sm:h-14 sm:w-14 sm:text-lg">
                VS
              </div>
            </div>

            {/* Team B (Right side - No logo) */}
            <div className="flex flex-col items-center text-center md:col-span-3 md:items-center">
              <h3 className="font-display text-2xl font-extrabold tracking-wide text-ivory-50 sm:text-3xl">
                {liveMatch.team_b_name ?? "REAL MADRID"}
              </h3>

              {/* Cricket Score Display */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-mono-score text-3xl font-bold tracking-tight text-emerald-400 sm:text-4xl">
                  {liveMatch.team_b_score !== null ? liveMatch.team_b_score : 98}
                  <span className="text-ivory-300">/</span>
                  {liveMatch.team_b_wickets !== undefined && liveMatch.team_b_wickets !== null
                    ? liveMatch.team_b_wickets
                    : 2}
                </span>
                <span className="font-mono-score text-sm text-ivory-400 sm:text-base">
                  ({liveMatch.team_b_overs ?? "12.0"} ov)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          UPCOMING MATCHES SECTION (FILTERED BY SELECTED ROUND)
      ══════════════════════════════════════════════════════════════ */}
      <section className="mb-14">
        {/* Section Header */}
        <div className="mb-6 flex items-center justify-center gap-4 text-center">
          <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-emerald-500 sm:w-24" />
          <h2 className="font-display text-lg font-bold uppercase tracking-[0.3em] text-emerald-400 sm:text-xl">
            Upcoming Matches In {selectedRoundObj.label}
          </h2>
          <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-emerald-500 sm:w-24" />
        </div>

        {/* Upcoming Matches Flex Grid (Narrower Compact Cards) */}
        <div className="mx-auto flex flex-wrap justify-center gap-3.5 max-w-4xl">
          {upcomingMatches.map((match) => (
            <div
              key={match.id}
              className="group relative flex w-full max-w-[240px] sm:max-w-[250px] flex-col justify-between rounded-xl border border-white/10 bg-[#070e1c]/80 p-3.5 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]"
            >
              {/* Top Teams Row (No logos - Compact) */}
              <div className="flex items-center justify-between gap-1.5 text-center">
                {/* Team A */}
                <div className="flex-1 min-w-0">
                  <span className="block truncate font-display text-xs font-extrabold tracking-wide text-ivory-50 group-hover:text-white sm:text-sm">
                    {match.team_a_name ?? "TEAM A"}
                  </span>
                </div>

                {/* VS Badge */}
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 font-bold text-[9px] text-ivory-300">
                  VS
                </div>

                {/* Team B */}
                <div className="flex-1 min-w-0">
                  <span className="block truncate font-display text-xs font-extrabold tracking-wide text-ivory-50 group-hover:text-white sm:text-sm">
                    {match.team_b_name ?? "TEAM B"}
                  </span>
                </div>
              </div>

              {/* View Details Link */}
              <div className="mt-3 flex justify-center border-t border-white/10 pt-2.5">
                <button
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
      </section>

      {/* ══════════════════════════════════════════════════════════════
          COMPLETED MATCH RESULTS SECTION (FILTERED BY SELECTED ROUND)
      ══════════════════════════════════════════════════════════════ */}
      <section className="mb-12">
        {/* Section Header */}
        <div className="mb-6 flex items-center justify-center gap-4 text-center">
          <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-gold-400 sm:w-24" />
          <h2 className="flex items-center gap-2 font-display text-lg font-bold uppercase tracking-[0.3em] text-gold-400 sm:text-xl">
            <Trophy size={18} className="text-gold-400" />
            Match Results · {selectedRoundObj.label}
          </h2>
          <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-gold-400 sm:w-24" />
        </div>

        {/* Completed Match Scorecards Grid */}
        <div className="mx-auto max-w-4xl space-y-4">
          {completedMatches.map((match) => {
            const isTeamAWinner = match.winner_name === match.team_a_name;
            const isTeamBWinner = match.winner_name === match.team_b_name;

            return (
              <div
                key={match.id}
                className="group relative overflow-hidden rounded-2xl border border-gold-400/20 bg-[#070e1c]/90 p-4 shadow-xl transition-all duration-300 hover:border-gold-400/50 hover:shadow-[0_0_30px_rgba(245,185,66,0.15)] sm:p-5"
              >
                {/* Header Row Inside Completed Card */}
                <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="font-mono-score text-[11px] font-semibold uppercase tracking-widest text-gold-400">
                    {match.label || `${selectedRoundObj.shortLabel} MATCH`}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono-score text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    Completed
                  </span>
                </div>

                {/* Scoreboard Grid */}
                <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-7">
                  {/* Team A Scorebox */}
                  <div
                    className={`flex items-center justify-between rounded-xl p-3 sm:col-span-3 sm:flex-col sm:justify-center ${
                      isTeamAWinner
                        ? "border border-gold-400/30 bg-gold-400/10 shadow-[0_0_15px_rgba(245,185,66,0.1)]"
                        : "bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {isTeamAWinner && <Crown size={14} className="text-gold-400" />}
                      <span
                        className={`font-display text-sm font-bold sm:text-base ${
                          isTeamAWinner ? "text-gold-300 font-extrabold" : "text-ivory-100"
                        }`}
                      >
                        {match.team_a_name ?? "TEAM A"}
                      </span>
                    </div>

                    <div className="font-mono-score text-sm font-bold text-ivory-50 sm:mt-1 sm:text-base">
                      <span className={isTeamAWinner ? "text-gold-400 font-extrabold" : "text-ivory-200"}>
                        {match.team_a_score ?? 0}/{match.team_a_wickets ?? 0}
                      </span>{" "}
                      <span className="text-[11px] text-ivory-400">({match.team_a_overs ?? "0.0"} ov)</span>
                    </div>
                  </div>

                  {/* Central VS Badge */}
                  <div className="flex justify-center sm:col-span-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gold-400/30 bg-gold-400/10 font-mono-score text-xs font-bold text-gold-400">
                      VS
                    </div>
                  </div>

                  {/* Team B Scorebox */}
                  <div
                    className={`flex items-center justify-between rounded-xl p-3 sm:col-span-3 sm:flex-col sm:justify-center ${
                      isTeamBWinner
                        ? "border border-gold-400/30 bg-gold-400/10 shadow-[0_0_15px_rgba(245,185,66,0.1)]"
                        : "bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {isTeamBWinner && <Crown size={14} className="text-gold-400" />}
                      <span
                        className={`font-display text-sm font-bold sm:text-base ${
                          isTeamBWinner ? "text-gold-300 font-extrabold" : "text-ivory-100"
                        }`}
                      >
                        {match.team_b_name ?? "TEAM B"}
                      </span>
                    </div>

                    <div className="font-mono-score text-sm font-bold text-ivory-50 sm:mt-1 sm:text-base">
                      <span className={isTeamBWinner ? "text-gold-400 font-extrabold" : "text-ivory-200"}>
                        {match.team_b_score ?? 0}/{match.team_b_wickets ?? 0}
                      </span>{" "}
                      <span className="text-[11px] text-ivory-400">({match.team_b_overs ?? "0.0"} ov)</span>
                    </div>
                  </div>
                </div>

                {/* Victory Result Banner & Action Button */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
                  <div className="flex items-center gap-2 font-mono-score text-xs font-bold text-gold-300">
                    <Award size={15} className="text-gold-400" />
                    <span>{getResultSummary(match)}</span>
                  </div>

                  <button
                    onClick={() => setSelectedMatch(match)}
                    className="inline-flex items-center gap-1 font-mono-score text-[11px] font-semibold tracking-wider text-gold-400 hover:text-gold-300"
                  >
                    <span>Match Squad & Details</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TEAM DETAILS MODAL OVERLAY (Compact & Above Navbar)
      ══════════════════════════════════════════════════════════════ */}
      {selectedMatch && teamADetails && teamBDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/90 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-emerald-500/40 bg-[#070e1c] p-4 shadow-2xl sm:p-5">
            <button
              onClick={() => setSelectedMatch(null)}
              className="absolute right-3 top-3 rounded-full p-1.5 text-ivory-400 hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="mb-4 text-center">
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] text-emerald-400">
                <Trophy size={12} />
                <span className="font-mono-score tracking-wider uppercase">
                  {selectedMatch.label || "MATCH SQUAD & TEAM DETAILS"}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold tracking-wide text-ivory-50 sm:text-xl">
                Match Team Details
              </h3>
            </div>

            {/* Team Details Comparison Grid (2 Compact Columns) */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Team A Details Card */}
              <div className="rounded-xl border border-emerald-500/20 bg-white/[0.02] p-3.5">
                <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400">Team A</span>
                    <h4 className="font-display text-base font-bold text-ivory-50">{teamADetails.name}</h4>
                  </div>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono-score text-[10px] text-emerald-300">
                    {teamADetails.batch}
                  </span>
                </div>

                {/* Captain Info */}
                <div className="mb-2.5 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-2 text-xs text-emerald-300">
                  <Crown size={14} className="text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <span className="block text-[9px] uppercase text-ivory-400">Team Captain</span>
                    <strong className="text-ivory-100 font-semibold text-xs">{teamADetails.captain}</strong>
                  </div>
                </div>

                {/* Squad List */}
                <div>
                  <h5 className="mb-1.5 flex items-center gap-1 font-mono-score text-[11px] font-semibold uppercase tracking-wider text-ivory-300">
                    <Users size={12} className="text-emerald-400" />
                    Playing Squad ({teamADetails.playerCount})
                  </h5>
                  <ul className="max-h-36 space-y-1 overflow-y-auto pr-1 text-[11px] text-ivory-200">
                    {teamADetails.players.map((player, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-1.5 rounded-md bg-white/[0.02] px-2 py-1 border border-white/5 truncate"
                      >
                        <User size={11} className="text-emerald-400 shrink-0" />
                        <span className="font-medium text-ivory-100 truncate">{player}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Team B Details Card */}
              <div className="rounded-xl border border-emerald-500/20 bg-white/[0.02] p-3.5">
                <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400">Team B</span>
                    <h4 className="font-display text-base font-bold text-ivory-50">{teamBDetails.name}</h4>
                  </div>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono-score text-[10px] text-emerald-300">
                    {teamBDetails.batch}
                  </span>
                </div>

                {/* Captain Info */}
                <div className="mb-2.5 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-2 text-xs text-emerald-300">
                  <Crown size={14} className="text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <span className="block text-[9px] uppercase text-ivory-400">Team Captain</span>
                    <strong className="text-ivory-100 font-semibold text-xs">{teamBDetails.captain}</strong>
                  </div>
                </div>

                {/* Squad List */}
                <div>
                  <h5 className="mb-1.5 flex items-center gap-1 font-mono-score text-[11px] font-semibold uppercase tracking-wider text-ivory-300">
                    <Users size={12} className="text-emerald-400" />
                    Playing Squad ({teamBDetails.playerCount})
                  </h5>
                  <ul className="max-h-36 space-y-1 overflow-y-auto pr-1 text-[11px] text-ivory-200">
                    {teamBDetails.players.map((player, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-1.5 rounded-md bg-white/[0.02] px-2 py-1 border border-white/5 truncate"
                      >
                        <User size={11} className="text-emerald-400 shrink-0" />
                        <span className="font-medium text-ivory-100 truncate">{player}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer Close button */}
            <div className="mt-4 flex items-center justify-end border-t border-white/10 pt-3">
              <button
                onClick={() => setSelectedMatch(null)}
                className="rounded-full bg-emerald-500 px-5 py-1.5 text-xs font-bold text-navy-950 hover:bg-emerald-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        NOTE: Tournament Bracket code (Matches.tsx) is retained in codebase for future use per request:
        "remove that match tree. don't delete it keep it not show in the website.."
        Uncomment the line below if bracket needs to be re-enabled:
        <Bracket matches={[]} totalTeams={0} /> 
      */}
    </div>
  );
}

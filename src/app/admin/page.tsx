"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Loader2,
  LogOut,
  Play,
  Plus,
  Shuffle,
  Trash2,
} from "lucide-react";

type Tab = "teams" | "groups" | "matches";

interface AdminTeam {
  id: string;
  team_name: string;
  batch: string;
  captain_name: string;
  captain_contact: string;
  captain_email: string;
  vice_captain_name: string | null;
  created_at: string;
  players: { full_name: string; gender: string }[];
}

interface GroupTeam {
  id: string;
  teamName: string;
  batch: string;
  wins: number;
  losses: number;
}

interface Group {
  id: string;
  name: string;
  teams: GroupTeam[];
}

interface MatchRow {
  id: string;
  stage: "group" | "round1" | "quarterfinal" | "semifinal" | "final" | "custom";
  round: number;
  label: string | null;
  status: "scheduled" | "live" | "completed";
  team_a_score: number | null;
  team_b_score: number | null;
  team_a_wickets?: number | null;
  team_b_wickets?: number | null;
  team_a_overs?: string | null;
  team_b_overs?: string | null;
  scheduled_at: string | null;
  venue: string | null;
  group_name: string | null;
  team_a_id: string | null;
  team_a_name: string | null;
  team_b_id: string | null;
  team_b_name: string | null;
  winner_id: string | null;
  winner_name: string | null;
}

const cardClass = "rounded-2xl border border-white/10 bg-navy-900/50 p-5";
const inputClass =
  "w-full rounded-lg border border-white/10 bg-navy-900/70 px-3 py-2 text-sm text-ivory-50 outline-none focus:border-cyan-400/60";
const btnPrimary =
  "inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 px-4 py-2 text-xs font-semibold text-navy-950 transition-transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100";
const btnGhost =
  "inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-ivory-200 hover:border-white/30";

export default function AdminDashboard() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState<Tab>("teams");

  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [teamsRes, groupsRes, matchesRes] = await Promise.all([
      fetch("/api/admin/teams"),
      fetch("/api/groups"),
      fetch("/api/matches"),
    ]);

    if (teamsRes.status === 401) {
      router.push("/admin/login");
      return;
    }

    const teamsJson = await teamsRes.json();
    const groupsJson = await groupsRes.json();
    const matchesJson = await matchesRes.json();

    setTeams(teamsJson.teams ?? []);
    setGroups(groupsJson.groups ?? []);
    setMatches(matchesJson.matches ?? []);
    setAuthChecked(true);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    loadAll();
  }, [loadAll]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#060c1a] text-ivory-400">
        <Loader2 size={22} className="animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#060c1a] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-mono-score text-[11px] uppercase tracking-[0.4em] text-gold-400">
              InfoBash V5.0 · Organiser Panel
            </span>
            <h1 className="mt-1 font-display text-4xl tracking-wide text-ivory-50">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="/api/admin/export" className={btnGhost}>
              <Download size={14} /> Export CSV
            </a>
            <button onClick={handleLogout} className={btnGhost}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>

        {actionMessage && (
          <div className="mb-6 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-200">
            {actionMessage}
          </div>
        )}

        <div className="mb-6 flex gap-2 border-b border-white/10 pb-px">
          {(["teams", "groups", "matches"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "border-b-2 border-cyan-400 text-cyan-300"
                  : "text-ivory-400 hover:text-ivory-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-ivory-400">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : (
          <>
            {tab === "teams" && <TeamsTab teams={teams} />}
            {tab === "groups" && (
              <GroupsTab
                groups={groups}
                teamCount={teams.length}
                onChanged={(msg) => {
                  setActionMessage(msg);
                  loadAll();
                }}
              />
            )}
            {tab === "matches" && (
              <MatchesTab
                matches={matches}
                teams={teams}
                onChanged={(msg) => {
                  setActionMessage(msg);
                  loadAll();
                }}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}

function TeamsTab({ teams }: { teams: AdminTeam[] }) {
  if (teams.length === 0) {
    return <p className="text-sm text-ivory-400">No teams registered yet.</p>;
  }
  return (
    <div className={`${cardClass} overflow-x-auto`}>
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-ivory-400">
            <th className="pb-3 pr-4">Team</th>
            <th className="pb-3 pr-4">Batch</th>
            <th className="pb-3 pr-4">Captain</th>
            <th className="pb-3 pr-4">Contact</th>
            <th className="pb-3 pr-4">Players</th>
            <th className="pb-3">Registered</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t) => (
            <tr key={t.id} className="border-t border-white/5 text-ivory-100">
              <td className="py-2.5 pr-4 font-medium">{t.team_name}</td>
              <td className="py-2.5 pr-4 text-ivory-300">{t.batch}</td>
              <td className="py-2.5 pr-4 text-ivory-300">{t.captain_name}</td>
              <td className="py-2.5 pr-4 text-ivory-300">
                {t.captain_contact}
                <div className="text-xs text-ivory-400">{t.captain_email}</div>
              </td>
              <td className="py-2.5 pr-4 text-ivory-300">{t.players?.length ?? 0}</td>
              <td className="py-2.5 text-xs text-ivory-400">
                {new Date(t.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GroupsTab({
  groups,
  teamCount,
  onChanged,
}: {
  groups: Group[];
  teamCount: number;
  onChanged: (message: string) => void;
}) {
  const [groupCount, setGroupCount] = useState(Math.max(2, Math.ceil(teamCount / 4) || 2));
  const [busy, setBusy] = useState<"allocate" | "round1" | null>(null);

  async function allocate() {
    setBusy("allocate");
    const res = await fetch("/api/admin/groups/allocate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupCount }),
    });
    const json = await res.json();
    setBusy(null);
    onChanged(res.ok ? `Allocated ${json.groupCount} groups.` : json.error);
  }

  async function generateRound1() {
    setBusy("round1");
    const res = await fetch("/api/admin/matches/generate-round1", { method: "POST" });
    const json = await res.json();
    setBusy(null);
    onChanged(res.ok ? `Created ${json.matchesCreated} round-1 fixtures.` : json.error);
  }

  return (
    <div className="space-y-6">
      <div className={`${cardClass} flex flex-wrap items-end gap-4`}>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ivory-300">
            Number of Groups
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={groupCount}
            onChange={(e) => setGroupCount(Number(e.target.value))}
            className={`${inputClass} w-24`}
          />
        </div>
        <button onClick={allocate} disabled={busy !== null || teamCount === 0} className={btnPrimary}>
          {busy === "allocate" ? <Loader2 size={14} className="animate-spin" /> : <Shuffle size={14} />}
          Randomly Allocate Groups
        </button>
        <button
          onClick={generateRound1}
          disabled={busy !== null || groups.length === 0}
          className={btnGhost}
        >
          {busy === "round1" ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          Generate Round 1 Matches
        </button>
        <p className="w-full text-xs text-ivory-400">
          Re-allocating clears existing groups and any generated round-1 fixtures.
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-ivory-400">No groups allocated yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {groups.map((g) => (
            <div key={g.id} className={cardClass}>
              <h3 className="font-display text-xl tracking-wide text-cyan-300">{g.name}</h3>
              <ul className="mt-3 space-y-1.5 text-sm">
                {g.teams.map((t) => (
                  <li key={t.id} className="flex items-center justify-between text-ivory-200">
                    <span>{t.teamName}</span>
                    <span className="text-xs text-ivory-400">
                      {t.wins}W – {t.losses}L
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MatchesTab({
  matches,
  teams,
  onChanged,
}: {
  matches: MatchRow[];
  teams: AdminTeam[];
  onChanged: (message: string) => void;
}) {
  // Selected Round filter in Admin Matches Tab
  const [adminRound, setAdminRound] = useState<MatchRow["stage"]>("round1");

  // Form for creating fixture
  const [form, setForm] = useState<{
    stage: MatchRow["stage"];
    label: string;
    teamAId: string;
    teamBId: string;
    scheduledAt: string;
    venue: string;
  }>({
    stage: "round1",
    label: "",
    teamAId: "",
    teamBId: "",
    scheduledAt: "",
    venue: "",
  });
  const [creating, setCreating] = useState(false);

  // Sync form stage when adminRound changes
  useEffect(() => {
    setForm((f) => ({ ...f, stage: adminRound }));
  }, [adminRound]);

  // Filter matches by selected round
  const roundMatches = matches.filter(
    (m) => m.stage === adminRound || (adminRound === "round1" && m.stage === "group")
  );

  const upcomingRoundMatches = roundMatches.filter((m) => m.status !== "completed");
  const completedRoundMatches = roundMatches.filter((m) => m.status === "completed");

  // Live Controller state
  const liveMatchInDb = matches.find((m) => m.status === "live");
  const initialLiveId = roundMatches.find((m) => m.status === "live")?.id ?? liveMatchInDb?.id ?? "";

  const [selectedLiveId, setSelectedLiveId] = useState<string>(initialLiveId);
  const [liveWinnerId, setLiveWinnerId] = useState<string>("");
  const [liveRunsA, setLiveRunsA] = useState<string>("");
  const [liveWktsA, setLiveWktsA] = useState<string>("");
  const [liveOversA, setLiveOversA] = useState<string>("");
  const [liveRunsB, setLiveRunsB] = useState<string>("");
  const [liveWktsB, setLiveWktsB] = useState<string>("");
  const [liveOversB, setLiveOversB] = useState<string>("");
  const [updatingLive, setUpdatingLive] = useState(false);

  // Auto-populate inputs when selecting a match in the Live Controller
  const handleLiveSelect = (matchId: string) => {
    setSelectedLiveId(matchId);
    const target = matches.find((m) => m.id === matchId);
    if (target) {
      setLiveWinnerId(target.winner_id ?? "");
      setLiveRunsA(target.team_a_score?.toString() ?? "");
      setLiveWktsA(target.team_a_wickets?.toString() ?? "");
      setLiveOversA(target.team_a_overs?.toString() ?? "");
      setLiveRunsB(target.team_b_score?.toString() ?? "");
      setLiveWktsB(target.team_b_wickets?.toString() ?? "");
      setLiveOversB(target.team_b_overs?.toString() ?? "");
    }
  };

  // Sync initial live match values when match list or round changes
  useEffect(() => {
    if (selectedLiveId) {
      const target = matches.find((m) => m.id === selectedLiveId);
      if (target) {
        setLiveWinnerId(target.winner_id ?? "");
        setLiveRunsA(target.team_a_score?.toString() ?? "");
        setLiveWktsA(target.team_a_wickets?.toString() ?? "");
        setLiveOversA(target.team_a_overs?.toString() ?? "");
        setLiveRunsB(target.team_b_score?.toString() ?? "");
        setLiveWktsB(target.team_b_wickets?.toString() ?? "");
        setLiveOversB(target.team_b_overs?.toString() ?? "");
      }
    }
  }, [selectedLiveId, matches]);

  async function updateLiveMatch(newStatus: "live" | "completed") {
    if (!selectedLiveId) return;
    setUpdatingLive(true);
    const selectedMatchObj = matches.find((m) => m.id === selectedLiveId);

    const res = await fetch(`/api/admin/matches/${selectedLiveId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        teamAScore: liveRunsA === "" ? null : Number(liveRunsA),
        teamAWickets: liveWktsA === "" ? null : Number(liveWktsA),
        teamAOvers: liveOversA === "" ? null : liveOversA,
        teamBScore: liveRunsB === "" ? null : Number(liveRunsB),
        teamBWickets: liveWktsB === "" ? null : Number(liveWktsB),
        teamBOvers: liveOversB === "" ? null : liveOversB,
        winnerId: liveWinnerId === "" ? null : liveWinnerId,
      }),
    });
    const json = await res.json();
    setUpdatingLive(false);
    onChanged(
      res.ok
        ? newStatus === "live"
          ? `Match "${selectedMatchObj?.team_a_name ?? 'Team A'} vs ${selectedMatchObj?.team_b_name ?? 'Team B'}" is now LIVE! Scores broadcasting.`
          : `Match completed! Moved to Match Results section.`
        : json.error
    );
  }

  async function createMatch(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/admin/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stage: form.stage,
        label: form.label || null,
        teamAId: form.teamAId || null,
        teamBId: form.teamBId || null,
        scheduledAt: form.scheduledAt || null,
        venue: form.venue || null,
      }),
    });
    const json = await res.json();
    setCreating(false);
    onChanged(res.ok ? "New match fixture created." : json.error);
    if (res.ok) setForm((f) => ({ ...f, label: "", teamAId: "", teamBId: "" }));
  }

  const [serverActiveRound, setServerActiveRound] = useState<MatchRow["stage"]>("round1");

  // Fetch current active live round from PostgreSQL on mount
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.activeRound) {
          setServerActiveRound(json.activeRound);
          setAdminRound(json.activeRound);
        }
      })
      .catch(() => {});
  }, []);

  const [submittingRound, setSubmittingRound] = useState(false);

  async function submitActiveLiveRound() {
    setSubmittingRound(true);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activeRound: adminRound }),
    });
    const json = await res.json();
    setSubmittingRound(false);

    const roundLabel =
      adminRound === "round1"
        ? "1st Round"
        : adminRound === "quarterfinal"
        ? "Quarterfinals"
        : adminRound === "semifinal"
        ? "Semifinals"
        : "Final";

    if (res.ok) {
      setServerActiveRound(adminRound);
      onChanged(`Successfully published "${roundLabel}" as the Current Live Round on user matches page!`);
    } else {
      onChanged(json.error);
    }
  }

  const selectedMatchObj = matches.find((m) => m.id === selectedLiveId);

  return (
    <div className="space-y-8">
      {/* ══════════════════════════════════════════════════════════════
          1. SELECT ACTIVE LIVE ROUND IN ADMIN DASHBOARD (WITH SUBMIT BUTTON)
      ══════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-cyan-500/30 bg-[#070e1c]/90 p-5 shadow-xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
          <div>
            <label className="block font-mono-score text-xs font-bold uppercase tracking-widest text-cyan-400">
              SELECT TOURNAMENT ROUND TO VIEW & MANAGE
            </label>
            <span className="text-[11px] text-ivory-400">
              Current Live Round on User Page:{" "}
              <strong className="text-emerald-400 font-bold uppercase">
                {serverActiveRound === "round1"
                  ? "1st Round"
                  : serverActiveRound === "quarterfinal"
                  ? "Quarterfinals"
                  : serverActiveRound === "semifinal"
                  ? "Semifinals"
                  : "Final"}
              </strong>
            </span>
          </div>

          {/* Submit Active Round Button on Right Corner */}
          <button
            type="button"
            disabled={submittingRound}
            onClick={submitActiveLiveRound}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 px-4 py-2 font-mono-score text-xs font-bold uppercase tracking-wider text-navy-950 hover:from-emerald-400 hover:to-cyan-300 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105"
          >
            {submittingRound ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Play size={13} className="fill-navy-950" />
            )}
            Set Active Live Round
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {[
            { id: "round1", label: "1st Round" },
            { id: "quarterfinal", label: "Quarterfinals" },
            { id: "semifinal", label: "Semifinals" },
            { id: "final", label: "Final" },
          ].map((r) => {
            const isSelected = adminRound === r.id;
            const isLiveOnWebsite = serverActiveRound === r.id;

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setAdminRound(r.id as MatchRow["stage"]);
                  setSelectedLiveId("");
                }}
                className={`relative inline-flex items-center gap-2 rounded-full px-5 py-2 font-mono-score text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  isSelected
                    ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-navy-950 shadow-[0_0_20px_rgba(34,211,238,0.4)] scale-105"
                    : "border border-white/10 bg-white/[0.03] text-ivory-300 hover:border-cyan-400/40 hover:text-white"
                }`}
              >
                <span>{r.label}</span>
                {isLiveOnWebsite && (
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-extrabold tracking-wider ${
                      isSelected
                        ? "bg-navy-950/80 text-emerald-300 border border-emerald-400/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    ● LIVE NOW
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          2. LIVE SCOREBOARD CONTROLLER (START LIVE, UPDATE SCORE, FINISH & MOVE TO RESULTS)
      ══════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-emerald-500/40 bg-[#070e1c]/90 p-6 shadow-xl relative overflow-hidden">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <h3 className="font-display text-xl font-bold tracking-wide text-emerald-400">
              Live Scoreboard Controller
            </h3>
          </div>
          <span className="font-mono-score text-xs tracking-wider text-ivory-300">
            Real-Time Scorecard Broadcast
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ivory-300">
              Select Match to Set Live or Update Score
            </label>
            <select
              value={selectedLiveId}
              onChange={(e) => handleLiveSelect(e.target.value)}
              className={inputClass}
            >
              <option value="">-- Choose Match in Current Round --</option>
              {roundMatches.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.stage.toUpperCase()}] {m.team_a_name ?? "TBD"} vs {m.team_b_name ?? "TBD"}{" "}
                  — Status: {m.status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {selectedMatchObj && (
            <div className="grid grid-cols-1 gap-4 rounded-xl bg-white/[0.03] p-4 sm:grid-cols-2">
              {/* Team A Live Inputs */}
              <div className="space-y-2 rounded-lg border border-white/10 p-3">
                <span className="block text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Team A: {selectedMatchObj.team_a_name ?? "Team A"}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-ivory-400">Runs</label>
                    <input
                      type="number"
                      value={liveRunsA}
                      onChange={(e) => setLiveRunsA(e.target.value)}
                      placeholder="142"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-ivory-400">Wickets</label>
                    <input
                      type="number"
                      value={liveWktsA}
                      onChange={(e) => setLiveWktsA(e.target.value)}
                      placeholder="4"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-ivory-400">Overs</label>
                    <input
                      type="text"
                      value={liveOversA}
                      onChange={(e) => setLiveOversA(e.target.value)}
                      placeholder="18.2"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Team B Live Inputs */}
              <div className="space-y-2 rounded-lg border border-white/10 p-3">
                <span className="block text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Team B: {selectedMatchObj.team_b_name ?? "Team B"}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-ivory-400">Runs</label>
                    <input
                      type="number"
                      value={liveRunsB}
                      onChange={(e) => setLiveRunsB(e.target.value)}
                      placeholder="98"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-ivory-400">Wickets</label>
                    <input
                      type="number"
                      value={liveWktsB}
                      onChange={(e) => setLiveWktsB(e.target.value)}
                      placeholder="2"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-ivory-400">Overs</label>
                    <input
                      type="text"
                      value={liveOversB}
                      onChange={(e) => setLiveOversB(e.target.value)}
                      placeholder="12.0"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Select Winning Team Dropdown */}
              <div className="col-span-full rounded-lg border border-gold-400/20 bg-gold-400/5 p-3">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gold-400">
                  Select Winning Team (Required before Finishing Match):
                </label>
                <select
                  value={liveWinnerId}
                  onChange={(e) => setLiveWinnerId(e.target.value)}
                  className={`${inputClass} max-w-md text-xs font-bold text-gold-300`}
                >
                  <option value="">-- Auto-Derive Winner from Runs --</option>
                  {selectedMatchObj.team_a_id && (
                    <option value={selectedMatchObj.team_a_id}>
                      🏆 {selectedMatchObj.team_a_name} (WINNER)
                    </option>
                  )}
                  {selectedMatchObj.team_b_id && (
                    <option value={selectedMatchObj.team_b_id}>
                      🏆 {selectedMatchObj.team_b_name} (WINNER)
                    </option>
                  )}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="col-span-full flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={updatingLive}
                  onClick={() => updateLiveMatch("live")}
                  className={btnPrimary}
                >
                  {updatingLive ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                  ⚡ Set Live & Broadcast Score
                </button>

                <button
                  type="button"
                  disabled={updatingLive}
                  onClick={() => updateLiveMatch("completed")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-5 py-2 text-xs font-bold text-navy-950 hover:bg-gold-300 transition-colors shadow-lg"
                >
                  🏁 Finish Match & Move to Results Tab
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          3. NEW FIXTURE CREATOR FOR SELECTED ROUND
      ══════════════════════════════════════════════════════════════ */}
      <form onSubmit={createMatch} className={`${cardClass} grid grid-cols-1 gap-4 sm:grid-cols-2`}>
        <h3 className="col-span-full font-display text-xl tracking-wide text-ivory-50">
          Create Match Fixture ({adminRound.toUpperCase()})
        </h3>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ivory-300">Stage / Round</label>
          <select
            value={form.stage}
            onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value as MatchRow["stage"] }))}
            className={inputClass}
          >
            <option value="round1">1st Round</option>
            <option value="quarterfinal">Quarterfinal</option>
            <option value="semifinal">Semifinal</option>
            <option value="final">Final</option>
            <option value="group">Group Stage</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ivory-300">Label / Name</label>
          <input
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            placeholder="e.g. 1st Round · Match 02"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ivory-300">Team A</label>
          <select
            value={form.teamAId}
            onChange={(e) => setForm((f) => ({ ...f, teamAId: e.target.value }))}
            className={inputClass}
          >
            <option value="">TBD</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.team_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ivory-300">Team B</label>
          <select
            value={form.teamBId}
            onChange={(e) => setForm((f) => ({ ...f, teamBId: e.target.value }))}
            className={inputClass}
          >
            <option value="">TBD</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.team_name}</option>
            ))}
          </select>
        </div>
        <div className="col-span-full">
          <button type="submit" disabled={creating} className={btnPrimary}>
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            + Create Match Fixture
          </button>
        </div>
      </form>

      {/* ══════════════════════════════════════════════════════════════
          4. ALL MATCHES LIST (UPCOMING & RESULTS FOR SELECTED ROUND)
      ══════════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
        <h3 className="font-display text-xl tracking-wide text-ivory-50">
          Match List for {adminRound.toUpperCase()}
        </h3>

        {/* Upcoming / Live Matches list (Compact Cards like User Side) */}
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-400">
            • Live & Scheduled Fixtures ({upcomingRoundMatches.length})
          </h4>
          <div className="flex flex-wrap gap-3.5">
            {upcomingRoundMatches.length === 0 ? (
              <p className="text-xs text-ivory-400">No scheduled or live matches in this round.</p>
            ) : (
              upcomingRoundMatches.map((m) => (
                <CompactAdminMatchCard
                  key={m.id}
                  match={m}
                  teams={teams}
                  onSelectLive={(id) => handleLiveSelect(id)}
                  onChanged={onChanged}
                />
              ))
            )}
          </div>
        </div>

        {/* Completed Match Results list */}
        <div className="pt-2">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-400">
            🏆 Completed Match Results ({completedRoundMatches.length})
          </h4>
          <div className="space-y-3">
            {completedRoundMatches.length === 0 ? (
              <p className="text-xs text-ivory-400">No completed match results in this round yet.</p>
            ) : (
              completedRoundMatches.map((m) => (
                <MatchEditor key={m.id} match={m} teams={teams} onChanged={onChanged} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactAdminMatchCard({
  match,
  teams,
  onSelectLive,
  onChanged,
}: {
  match: MatchRow;
  teams: AdminTeam[];
  onSelectLive: (id: string) => void;
  onChanged: (message: string) => void;
}) {
  const [showEdit, setShowEdit] = useState(false);

  async function remove() {
    if (!confirm(`Are you sure you want to delete fixture "${match.team_a_name ?? 'Team A'} vs ${match.team_b_name ?? 'Team B'}"?`)) return;
    const res = await fetch(`/api/admin/matches/${match.id}`, { method: "DELETE" });
    const json = await res.json();
    onChanged(res.ok ? "Match fixture deleted." : json.error);
  }

  return (
    <div className="group relative flex w-full max-w-[240px] sm:max-w-[250px] flex-col justify-between rounded-xl border border-white/10 bg-[#070e1c]/90 p-3.5 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]">
      {/* Card Header Tag */}
      <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-1.5">
        <span className="font-mono-score text-[10px] font-bold uppercase tracking-wider text-cyan-400 truncate">
          {match.label || match.stage.toUpperCase()}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase ${
            match.status === "live"
              ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
              : match.status === "completed"
              ? "bg-gold-400/20 text-gold-300"
              : "bg-white/5 text-ivory-400"
          }`}
        >
          {match.status === "live" ? "LIVE NOW" : match.status}
        </span>
      </div>

      {/* Teams Row (Compact & Narrow like user side) */}
      <div className="my-2 flex items-center justify-between gap-1.5 text-center">
        {/* Team A */}
        <div className="flex-1 min-w-0">
          <span className="block truncate font-display text-xs font-extrabold tracking-wide text-ivory-50 group-hover:text-white sm:text-sm">
            {match.team_a_name ?? "TEAM A"}
          </span>
          {match.team_a_score !== null && match.team_a_score !== undefined && (
            <span className="font-mono-score text-[11px] font-bold text-emerald-400">
              {match.team_a_score}/{match.team_a_wickets ?? 0}
            </span>
          )}
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
          {match.team_b_score !== null && match.team_b_score !== undefined && (
            <span className="font-mono-score text-[11px] font-bold text-emerald-400">
              {match.team_b_score}/{match.team_b_wickets ?? 0}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 text-[11px]">
        <button
          type="button"
          onClick={() => onSelectLive(match.id)}
          className="inline-flex items-center gap-1 font-mono-score font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <span>⚡ Live Score</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEdit(!showEdit)}
            className="text-ivory-300 hover:text-white"
            title="Edit Match Details"
          >
            ✏️
          </button>
          <button
            type="button"
            onClick={remove}
            className="text-red-400 hover:text-red-300"
            title="Delete Fixture"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Popover Inline Editor when clicking edit */}
      {showEdit && (
        <div className="mt-3 border-t border-white/10 pt-2">
          <MatchEditor match={match} teams={teams} onChanged={onChanged} />
        </div>
      )}
    </div>
  );
}

function MatchEditor({
  match,
  teams,
  onChanged,
}: {
  match: MatchRow;
  teams: AdminTeam[];
  onChanged: (message: string) => void;
}) {
  const [status, setStatus] = useState(match.status);
  const [stage, setStage] = useState(match.stage);
  const [scoreA, setScoreA] = useState(match.team_a_score?.toString() ?? "");
  const [wktsA, setWktsA] = useState(match.team_a_wickets?.toString() ?? "");
  const [oversA, setOversA] = useState(match.team_a_overs?.toString() ?? "");
  const [scoreB, setScoreB] = useState(match.team_b_score?.toString() ?? "");
  const [wktsB, setWktsB] = useState(match.team_b_wickets?.toString() ?? "");
  const [oversB, setOversB] = useState(match.team_b_overs?.toString() ?? "");
  const [winnerId, setWinnerId] = useState(match.winner_id ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/matches/${match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        teamAScore: scoreA === "" ? null : Number(scoreA),
        teamAWickets: wktsA === "" ? null : Number(wktsA),
        teamAOvers: oversA === "" ? null : oversA,
        teamBScore: scoreB === "" ? null : Number(scoreB),
        teamBWickets: wktsB === "" ? null : Number(wktsB),
        teamBOvers: oversB === "" ? null : oversB,
        winnerId: winnerId === "" ? null : winnerId,
      }),
    });
    const json = await res.json();
    setSaving(false);
    onChanged(res.ok ? "Match updated successfully." : json.error);
  }

  async function remove() {
    const res = await fetch(`/api/admin/matches/${match.id}`, { method: "DELETE" });
    const json = await res.json();
    onChanged(res.ok ? "Match deleted." : json.error);
  }

  return (
    <div className={`${cardClass} space-y-3`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-2">
        <div>
          <span className="font-mono-score text-xs uppercase tracking-wide text-cyan-400">
            {match.stage.toUpperCase()} {match.label ? `· ${match.label}` : ""}
          </span>
          <h4 className="text-sm font-bold text-ivory-100">
            {match.team_a_name ?? "TBD"} <span className="text-ivory-400">vs</span> {match.team_b_name ?? "TBD"}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as MatchRow["status"])}
            className={`${inputClass} w-32 font-semibold ${
              status === "live"
                ? "border-emerald-500 text-emerald-400"
                : status === "completed"
                ? "border-gold-400 text-gold-300"
                : ""
            }`}
          >
            <option value="scheduled">Scheduled</option>
            <option value="live">Live Now</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Team A Details Inputs */}
        <div className="rounded-lg bg-white/[0.02] p-2.5 border border-white/5 space-y-1.5">
          <span className="text-xs font-semibold text-ivory-200">
            Team A: {match.team_a_name ?? "TBD"}
          </span>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-ivory-400">Runs</label>
              <input
                type="number"
                value={scoreA}
                onChange={(e) => setScoreA(e.target.value)}
                placeholder="Runs"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[10px] text-ivory-400">Wickets</label>
              <input
                type="number"
                value={wktsA}
                onChange={(e) => setWktsA(e.target.value)}
                placeholder="Wkts"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[10px] text-ivory-400">Overs</label>
              <input
                type="text"
                value={oversA}
                onChange={(e) => setOversA(e.target.value)}
                placeholder="Ov"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Team B Details Inputs */}
        <div className="rounded-lg bg-white/[0.02] p-2.5 border border-white/5 space-y-1.5">
          <span className="text-xs font-semibold text-ivory-200">
            Team B: {match.team_b_name ?? "TBD"}
          </span>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-ivory-400">Runs</label>
              <input
                type="number"
                value={scoreB}
                onChange={(e) => setScoreB(e.target.value)}
                placeholder="Runs"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[10px] text-ivory-400">Wickets</label>
              <input
                type="number"
                value={wktsB}
                onChange={(e) => setWktsB(e.target.value)}
                placeholder="Wkts"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[10px] text-ivory-400">Overs</label>
              <input
                type="text"
                value={oversB}
                onChange={(e) => setOversB(e.target.value)}
                placeholder="Ov"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Winner selection */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-ivory-300">Winner:</label>
          <select
            value={winnerId}
            onChange={(e) => setWinnerId(e.target.value)}
            className={`${inputClass} w-44 text-xs`}
          >
            <option value="">Auto-Derive / None</option>
            {match.team_a_id && <option value={match.team_a_id}>{match.team_a_name}</option>}
            {match.team_b_id && <option value={match.team_b_id}>{match.team_b_name}</option>}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={save} disabled={saving} className={btnPrimary}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : "Save Changes"}
          </button>
          <button onClick={remove} className="text-red-400 hover:text-red-300">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

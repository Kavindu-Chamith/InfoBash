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

  // Live Controller state
  const liveMatchInDb = matches.find((m) => m.status === "live");
  const [selectedLiveId, setSelectedLiveId] = useState<string>(liveMatchInDb?.id ?? "");
  const [liveRunsA, setLiveRunsA] = useState<string>(liveMatchInDb?.team_a_score?.toString() ?? "");
  const [liveWktsA, setLiveWktsA] = useState<string>(liveMatchInDb?.team_a_wickets?.toString() ?? "");
  const [liveOversA, setLiveOversA] = useState<string>(liveMatchInDb?.team_a_overs?.toString() ?? "");
  const [liveRunsB, setLiveRunsB] = useState<string>(liveMatchInDb?.team_b_score?.toString() ?? "");
  const [liveWktsB, setLiveWktsB] = useState<string>(liveMatchInDb?.team_b_wickets?.toString() ?? "");
  const [liveOversB, setLiveOversB] = useState<string>(liveMatchInDb?.team_b_overs?.toString() ?? "");
  const [updatingLive, setUpdatingLive] = useState(false);

  // Sync selected live match when dropdown changes
  const handleLiveSelect = (matchId: string) => {
    setSelectedLiveId(matchId);
    const target = matches.find((m) => m.id === matchId);
    if (target) {
      setLiveRunsA(target.team_a_score?.toString() ?? "");
      setLiveWktsA(target.team_a_wickets?.toString() ?? "");
      setLiveOversA(target.team_a_overs?.toString() ?? "");
      setLiveRunsB(target.team_b_score?.toString() ?? "");
      setLiveWktsB(target.team_b_wickets?.toString() ?? "");
      setLiveOversB(target.team_b_overs?.toString() ?? "");
    }
  };

  async function updateLiveMatch(newStatus: "live" | "completed") {
    if (!selectedLiveId) return;
    setUpdatingLive(true);
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
      }),
    });
    const json = await res.json();
    setUpdatingLive(false);
    onChanged(
      res.ok
        ? newStatus === "live"
          ? "Live score updated & broadcasting!"
          : "Match finished and added to Match Results!"
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
    onChanged(res.ok ? "Match created." : json.error);
    if (res.ok) setForm({ stage: "round1", label: "", teamAId: "", teamBId: "", scheduledAt: "", venue: "" });
  }

  return (
    <div className="space-y-8">
      {/* ══════════════════════════════════════════════════════════════
          LIVE MATCH SCOREBOARD CONTROLLER (ADMIN SUPER CONTROL)
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
            Broadcasting Real-Time Scorecard
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ivory-300">
              Select Match to Control / Broadcast Live
            </label>
            <select
              value={selectedLiveId}
              onChange={(e) => handleLiveSelect(e.target.value)}
              className={inputClass}
            >
              <option value="">-- Select Match --</option>
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.stage.toUpperCase()}] {m.team_a_name ?? "TBD"} vs {m.team_b_name ?? "TBD"}{" "}
                  ({m.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {selectedLiveId && (
            <div className="grid grid-cols-1 gap-4 rounded-xl bg-white/[0.03] p-4 sm:grid-cols-2">
              {/* Team A Live Inputs */}
              <div className="space-y-2 rounded-lg border border-white/10 p-3">
                <span className="block text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {matches.find((m) => m.id === selectedLiveId)?.team_a_name ?? "Team A"}
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
                  {matches.find((m) => m.id === selectedLiveId)?.team_b_name ?? "Team B"}
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

              {/* Action Buttons */}
              <div className="col-span-full flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={updatingLive}
                  onClick={() => updateLiveMatch("live")}
                  className={btnPrimary}
                >
                  {updatingLive ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                  ⚡ Update & Broadcast Live Score
                </button>

                <button
                  type="button"
                  disabled={updatingLive}
                  onClick={() => updateLiveMatch("completed")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-4 py-2 text-xs font-bold text-navy-950 hover:bg-gold-300"
                >
                  🏁 Finish Match & Move to Results
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          NEW UPCOMING MATCH FIXTURE CREATOR
      ══════════════════════════════════════════════════════════════ */}
      <form onSubmit={createMatch} className={`${cardClass} grid grid-cols-1 gap-4 sm:grid-cols-2`}>
        <h3 className="col-span-full font-display text-xl tracking-wide text-ivory-50">
          Create Match Fixture
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
            <option value="custom">Custom</option>
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
          ALL MATCHES EDITOR LIST
      ══════════════════════════════════════════════════════════════ */}
      <div>
        <h3 className="mb-4 font-display text-xl tracking-wide text-ivory-50">
          All Match Fixtures & Results
        </h3>
        <div className="space-y-4">
          {matches.length === 0 ? (
            <p className="text-sm text-ivory-400">No matches created yet.</p>
          ) : (
            matches.map((m) => (
              <MatchEditor key={m.id} match={m} teams={teams} onChanged={onChanged} />
            ))
          )}
        </div>
      </div>
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

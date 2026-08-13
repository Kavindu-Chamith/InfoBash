"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import type { GroupStandingRow } from "@/lib/knockoutProgression";
import {
  Download,
  Loader2,
  LogOut,
  Play,
  Plus,
  Shuffle,
  Trash2,
  ChevronRight,
  Pencil,
  X,
  AlertTriangle,
  Flame,
  Users,
  Phone,
  Mail,
  Calendar,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  User,
  ShieldCheck,
  Crown,
  Trophy,
} from "lucide-react";

type Tab = "teams" | "groups" | "matches";

interface AdminTeamPlayer {
  position?: number;
  full_name: string;
  card?: string;
  student_id?: string;
  gender: "male" | "female" | string;
}

interface AdminTeam {
  id: string;
  team_name: string;
  batch: string;
  captain_name: string;
  captain_contact: string;
  captain_email: string;
  vice_captain_name: string | null;
  notes: string | null;
  created_at: string;
  group_id?: string | null;
  group_name?: string | null;
  players: AdminTeamPlayer[];
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
  group_id?: string | null;
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
  "w-full rounded-lg border border-white/10 bg-navy-900/70 px-3 py-2 text-sm text-ivory-50 outline-none focus:border-orange-500/80 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
const btnPrimary =
  "inline-flex items-center gap-1.5 rounded-full bg-[#FF6B00] px-4 py-2 text-xs font-bold text-white shadow-[0_0_20px_-4px_rgba(255,107,0,0.6)] transition-transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100";
const btnGhost =
  "inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-ivory-200 hover:border-white/30";

function stepCricketOvers(currentVal: string, direction: "up" | "down"): string {
  const clean = currentVal.trim();
  if (!clean || clean === "0" || clean === "0.0") {
    return direction === "up" ? "0.1" : "0.0";
  }

  const parts = clean.split(".");
  let over = parseInt(parts[0], 10);
  let ball = parts[1] ? parseInt(parts[1], 10) : 0;

  if (isNaN(over) || over < 0) over = 0;
  if (isNaN(ball) || ball < 0) ball = 0;

  if (direction === "up") {
    if (ball >= 5) {
      over += 1;
      ball = 0;
    } else {
      ball += 1;
    }
  } else {
    if (ball > 0) {
      ball -= 1;
    } else if (over > 0) {
      over -= 1;
      ball = 5;
    } else {
      over = 0;
      ball = 0;
    }
  }

  return `${over}.${ball}`;
}

function handleRunsWheel(e: React.WheelEvent<HTMLInputElement>, val: string, setter: (v: string) => void) {
  e.preventDefault();
  const current = parseInt(val, 10);
  const base = isNaN(current) ? 0 : current;
  if (e.deltaY < 0) {
    setter((base + 1).toString());
  } else if (e.deltaY > 0) {
    setter(Math.max(0, base - 1).toString());
  }
}

function handleRunsChange(val: string, setter: (v: string) => void) {
  if (val === "") {
    setter("");
    return;
  }
  const n = parseInt(val, 10);
  if (isNaN(n) || n < 0) {
    setter("0");
  } else {
    setter(n.toString());
  }
}

function handleWktsWheel(e: React.WheelEvent<HTMLInputElement>, val: string, setter: (v: string) => void) {
  e.preventDefault();
  const current = parseInt(val, 10);
  const base = isNaN(current) ? 0 : current;
  if (e.deltaY < 0) {
    setter(Math.min(10, base + 1).toString());
  } else if (e.deltaY > 0) {
    setter(Math.max(0, base - 1).toString());
  }
}

function handleWktsChange(val: string, setter: (v: string) => void) {
  if (val === "") {
    setter("");
    return;
  }
  const n = parseInt(val, 10);
  if (isNaN(n) || n < 0) {
    setter("0");
  } else if (n > 10) {
    setter("10");
  } else {
    setter(n.toString());
  }
}

function handleOversWheel(e: React.WheelEvent<HTMLInputElement>, val: string, setter: (v: string) => void) {
  e.preventDefault();
  const direction = e.deltaY < 0 ? "up" : "down";
  setter(stepCricketOvers(val, direction));
}

function handleOversChange(val: string, setter: (v: string) => void) {
  if (val === "") {
    setter("");
    return;
  }
  const cleaned = val.replace("-", "");
  setter(cleaned);
}

function handleOversKeyDown(e: React.KeyboardEvent<HTMLInputElement>, val: string, setter: (v: string) => void) {
  if (e.key === "ArrowUp") {
    e.preventDefault();
    setter(stepCricketOvers(val, "up"));
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    setter(stepCricketOvers(val, "down"));
  }
}

function handleScoreKeyDown(
  e: React.KeyboardEvent<HTMLInputElement>,
  stepUp: () => void,
  stepDown: () => void,
  onSubmit?: () => void
) {
  if (e.key === "Enter") {
    e.preventDefault();
    if (onSubmit) onSubmit();
  } else if (e.key === "ArrowRight") {
    const target = e.currentTarget;
    const container = target.closest(".grid-cols-1") || document;
    const allInputs = Array.from(container.querySelectorAll<HTMLInputElement>("[data-score-input]"));
    const currIdx = allInputs.indexOf(target);
    if (currIdx !== -1 && currIdx < allInputs.length - 1) {
      e.preventDefault();
      const next = allInputs[currIdx + 1];
      next.focus();
      next.select();
    }
  } else if (e.key === "ArrowLeft") {
    const target = e.currentTarget;
    const container = target.closest(".grid-cols-1") || document;
    const allInputs = Array.from(container.querySelectorAll<HTMLInputElement>("[data-score-input]"));
    const currIdx = allInputs.indexOf(target);
    if (currIdx > 0) {
      e.preventDefault();
      const prev = allInputs[currIdx - 1];
      prev.focus();
      prev.select();
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    stepUp();
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    stepDown();
  }
}

function NonPassiveWheelInput({
  type = "text",
  value,
  onChange,
  onWheelStep,
  onKeyDown,
  min,
  max,
  placeholder,
  className,
  dataScoreInput,
}: {
  type?: string;
  value: string;
  onChange: (val: string) => void;
  onWheelStep: (direction: "up" | "down") => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  className?: string;
  dataScoreInput?: boolean;
}) {
  const onWheelStepRef = useRef(onWheelStep);
  onWheelStepRef.current = onWheelStep;

  const setRef = useCallback((node: HTMLInputElement | null) => {
    if (!node) return;
    const handleWheel = (e: WheelEvent) => {
      // Only increase/decrease values when the text box is clicked / focused by admin!
      if (document.activeElement === node) {
        e.preventDefault();
        e.stopPropagation();
        const direction = e.deltaY < 0 ? "up" : "down";
        onWheelStepRef.current(direction);
      }
    };

    node.addEventListener("wheel", handleWheel, { passive: false });
  }, []);

  return (
    <input
      ref={setRef}
      type={type}
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={className}
      data-score-input={dataScoreInput ? "true" : undefined}
    />
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState<Tab>("teams");

  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleChanged = useCallback(
    (message: string, isError: boolean = false, title?: string) => {
      if (isError) {
        showError(message, title || "Action Failed");
      } else {
        showSuccess(message, title || "Success");
        loadAll();
      }
    },
    [showError, showSuccess, loadAll]
  );

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
    <main className="min-h-screen bg-[#060c1a] px-4 pt-24 pb-12 sm:px-8 sm:pt-28">
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

        <div className="mb-6 flex gap-2 border-b border-white/10 pb-px">
          {(["teams", "groups", "matches"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${tab === t
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
            {tab === "teams" && (
              <TeamsTab
                teams={teams}
                onChanged={handleChanged}
              />
            )}
            {tab === "groups" && (
              <GroupsTab
                groups={groups}
                teamCount={teams.length}
                onChanged={handleChanged}
              />
            )}
            {tab === "matches" && (
              <MatchesTab
                matches={matches}
                teams={teams}
                groups={groups}
                onChanged={handleChanged}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}

const BATCH_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  "1st Year": { bg: "bg-cyan-500/10", text: "text-cyan-300", border: "border-cyan-500/30" },
  "2nd Year": { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/30" },
  "3rd Year": { bg: "bg-violet-500/10", text: "text-violet-300", border: "border-violet-500/30" },
  "4th Year": { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/30" },
};

function TeamsTab({
  teams,
  onChanged,
}: {
  teams: AdminTeam[];
  onChanged: (message: string, isError?: boolean, title?: string) => void;
}) {
  const [editingTeam, setEditingTeam] = useState<AdminTeam | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<AdminTeam | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  if (teams.length === 0) {
    return <p className="text-sm text-ivory-400">No teams registered yet.</p>;
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-ivory-400">
          Registered Teams ({teams.length})
        </span>

        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-navy-900/60 p-1">
          <button
            onClick={() => setViewMode("cards")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "cards"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              : "text-ivory-400 hover:text-ivory-200"
              }`}
          >
            <LayoutGrid size={14} /> Cards
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "table"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              : "text-ivory-400 hover:text-ivory-200"
              }`}
          >
            <List size={14} /> Table
          </button>
        </div>
      </div>

      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <AdminTeamCard
              key={t.id}
              team={t}
              onEdit={() => setEditingTeam(t)}
              onDelete={() => setDeletingTeam(t)}
            />
          ))}
        </div>
      ) : (
        <div className={`${cardClass} overflow-x-auto`}>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-ivory-400">
                <th className="pb-3 pr-4">Team</th>
                <th className="pb-3 pr-4">Batch</th>
                <th className="pb-3 pr-4">Captain</th>
                <th className="pb-3 pr-4">Contact</th>
                <th className="pb-3 pr-4">Players</th>
                <th className="pb-3 pr-4">Registered</th>
                <th className="pb-3 text-right">Actions</th>
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
                  <td className="py-2.5 pr-4 text-xs text-ivory-400">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingTeam(t)}
                        className="rounded-lg border border-white/10 bg-navy-800/60 p-1.5 text-cyan-300 transition-colors hover:bg-cyan-500/20 hover:text-cyan-200"
                        title="Edit team details"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingTeam(t)}
                        className="rounded-lg border border-white/10 bg-navy-800/60 p-1.5 text-rose-400 transition-colors hover:bg-rose-500/20 hover:text-rose-300"
                        title="Delete team"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deletingTeam && (
        <DeleteTeamModal
          team={deletingTeam}
          onClose={() => setDeletingTeam(null)}
          onDeleted={(msg) => {
            onChanged(msg);
          }}
        />
      )}

      {editingTeam && (
        <EditTeamModal
          team={editingTeam}
          onClose={() => setEditingTeam(null)}
          onSaved={(msg) => {
            onChanged(msg);
          }}
        />
      )}
    </>
  );
}

function AdminTeamCard({
  team,
  onEdit,
  onDelete,
}: {
  team: AdminTeam;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [showSquad, setShowSquad] = useState(false);

  const batchStyle = BATCH_BADGES[team.batch] || {
    bg: "bg-cyan-500/10",
    text: "text-cyan-300",
    border: "border-cyan-500/30",
  };

  const femaleCount = team.players?.filter((p) => p.gender === "female").length ?? 0;
  const maleCount = (team.players?.length ?? 0) - femaleCount;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-navy-900/60 p-5 shadow-xl transition-all duration-300 hover:border-cyan-400/40 hover:bg-navy-900/80">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className={`inline-block rounded-full border ${batchStyle.border} ${batchStyle.bg} ${batchStyle.text} px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider`}>
              {team.batch}
            </span>
            <h3 className="mt-2 font-display text-2xl tracking-wide text-ivory-50 group-hover:text-cyan-300 transition-colors">
              {team.team_name}
            </h3>
          </div>
        </div>

        <div className="mt-4 space-y-2.5 border-t border-white/5 pt-3 text-xs text-ivory-300">
          <div className="flex items-center gap-2">
            <User size={14} className="text-cyan-400 shrink-0" />
            <span>Captain: <strong className="text-ivory-100">{team.captain_name}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Phone size={14} className="text-cyan-400 shrink-0" />
            <span>{team.captain_contact}</span>
          </div>

          <div className="flex items-center gap-2">
            <Mail size={14} className="text-cyan-400 shrink-0" />
            <span className="truncate">{team.captain_email}</span>
          </div>

          {team.vice_captain_name && (
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-cyan-400 shrink-0" />
              <span>Vice Captain: <strong className="text-ivory-200">{team.vice_captain_name}</strong></span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-ivory-400 shrink-0" />
            <span className="text-ivory-400">Registered: {new Date(team.created_at).toLocaleDateString()}</span>
          </div>

          {team.notes && (
            <div className="rounded-xl border border-white/5 bg-navy-950/50 p-2.5 text-[11px] text-ivory-400">
              <strong className="text-ivory-300">Notes:</strong> {team.notes}
            </div>
          )}
        </div>

        <div className="mt-4 border-t border-white/5 pt-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-medium text-ivory-200">
              <Users size={14} className="text-gold-400" />
              <span>{team.players?.length ?? 0} Players</span>
              <span className="text-[10px] text-ivory-400">({maleCount}M / {femaleCount}F)</span>
            </div>

            <button
              onClick={() => setShowSquad(!showSquad)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:text-cyan-200"
            >
              {showSquad ? "Hide Squad" : "View Squad"}
              {showSquad ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>

          {showSquad && (
            <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-navy-950/70 p-2.5 space-y-1.5 text-xs">
              {team.players
                ? [...team.players]
                  .sort((a, b) => {
                    if (a.gender === "female" && b.gender !== "female") return 1;
                    if (a.gender !== "female" && b.gender === "female") return -1;
                    return (a.position || 0) - (b.position || 0);
                  })
                  .map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-1.5 text-ivory-200 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[10px] font-bold text-gold-400 w-5">#{idx + 1}</span>
                        <span className="truncate">
                          {p.full_name}{" "}
                          {p.card ? <span className="text-[11px] text-orange-400 font-normal">({p.card})</span> : null}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-[10px] font-mono">
                        <span className="text-ivory-400">{p.student_id}</span>
                        <span className={`rounded px-1.5 py-0.5 font-semibold text-[9px] ${p.gender === "female" ? "bg-pink-500/20 text-pink-300 border border-pink-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"}`}>
                          {p.gender === "female" ? "Female" : "Male"}
                        </span>
                      </div>
                    </div>
                  ))
                : null}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2 border-t border-white/10 pt-3">
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 transition-colors hover:bg-cyan-400/20 hover:text-cyan-200"
        >
          <Pencil size={13} /> Edit Team
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/20 hover:text-rose-300"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  );
}

function DeleteTeamModal({
  team,
  onClose,
  onDeleted,
}: {
  team: AdminTeam;
  onClose: () => void;
  onDeleted: (msg: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/teams/${team.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete team");
      }
      onDeleted(data.message || `Deleted ${team.team_name}`);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error deleting team");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#070e1c] p-6 shadow-2xl space-y-4 text-left">
        <div className="flex items-center gap-3 text-rose-400">
          <AlertTriangle size={24} />
          <h3 className="font-display text-xl font-bold tracking-wide text-ivory-50">Delete Team</h3>
        </div>
        <p className="text-sm leading-relaxed text-ivory-300">
          Are you sure you want to delete <strong className="text-white font-semibold">{team.team_name}</strong>? This will permanently delete the team squad and remove it from any allocated groups or matches.
        </p>

        {error && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-2.5 text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs font-semibold text-ivory-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-rose-600/30 transition-all hover:bg-rose-500 active:scale-95 disabled:opacity-60"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            Delete Team
          </button>
        </div>
      </div>
    </div>
  );
}

function EditTeamModal({
  team,
  onClose,
  onSaved,
}: {
  team: AdminTeam;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const [teamName, setTeamName] = useState(team.team_name);
  const [batch, setBatch] = useState(team.batch);
  const [captainName, setCaptainName] = useState(team.captain_name);
  const [captainContact, setCaptainContact] = useState(team.captain_contact);
  const [captainEmail, setCaptainEmail] = useState(team.captain_email);
  const [viceCaptainName, setViceCaptainName] = useState(team.vice_captain_name || "");
  const [notes, setNotes] = useState(team.notes || "");

  const [players, setPlayers] = useState(() => {
    const arr = [];
    for (let i = 1; i <= 10; i++) {
      const existing = team.players?.find((p) => p.position === i) || team.players?.[i - 1];
      arr.push({
        position: i,
        full_name: existing?.full_name || "",
        card: existing?.card || "",
        student_id: existing?.student_id || "",
        gender: existing?.gender === "female" ? "female" : "male",
      });
    }
    return arr;
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePlayer = (index: number, field: string, value: string) => {
    setPlayers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/teams/${team.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_name: teamName,
          batch,
          captain_name: captainName,
          captain_contact: captainContact,
          captain_email: captainEmail,
          vice_captain_name: viceCaptainName,
          notes,
          players,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update team");
      }

      onSaved(data.message || "Team details updated successfully");
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving team details");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="my-8 w-full max-w-3xl rounded-2xl border border-white/10 bg-navy-950 p-6 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <h3 className="font-display text-2xl tracking-wide text-ivory-50">
            Edit Team Details
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-ivory-400 hover:bg-white/10 hover:text-ivory-100"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300 shrink-0">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6 overflow-y-auto pr-1">
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Team Overview
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-ivory-300">Team Name</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-ivory-300">Batch</label>
                <select
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className={inputClass}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-ivory-300">Captain Name</label>
                <input
                  type="text"
                  required
                  value={captainName}
                  onChange={(e) => setCaptainName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-ivory-300">Captain Contact</label>
                <input
                  type="text"
                  required
                  value={captainContact}
                  onChange={(e) => setCaptainContact(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-ivory-300">Captain Email</label>
                <input
                  type="email"
                  required
                  value={captainEmail}
                  onChange={(e) => setCaptainEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-ivory-300">Vice Captain Name</label>
                <input
                  type="text"
                  value={viceCaptainName}
                  onChange={(e) => setViceCaptainName(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-xs text-ivory-300">Notes / Remarks</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Squad Roster (10 Players)
            </h4>
            <div className="max-h-[280px] overflow-y-auto rounded-xl border border-white/10 bg-navy-900/40 p-3 space-y-3">
              {players.map((p, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-2 text-xs">
                  <span className="w-6 font-mono font-semibold text-gold-400">
                    #{p.position}
                  </span>
                  <input
                    type="text"
                    placeholder="Student Name"
                    value={p.full_name}
                    onChange={(e) => updatePlayer(idx, "full_name", e.target.value)}
                    className="flex-1 min-w-[130px] rounded border border-white/10 bg-navy-950 px-2 py-1 text-ivory-100 outline-none focus:border-cyan-400"
                  />
                  <input
                    type="text"
                    placeholder="Card (Optional)"
                    value={p.card || ""}
                    onChange={(e) => updatePlayer(idx, "card", e.target.value)}
                    className="w-28 rounded border border-white/10 bg-navy-950 px-2 py-1 text-ivory-100 outline-none focus:border-cyan-400"
                  />
                  <input
                    type="text"
                    placeholder="Student ID"
                    value={p.student_id}
                    onChange={(e) => updatePlayer(idx, "student_id", e.target.value)}
                    className="w-28 rounded border border-white/10 bg-navy-950 px-2 py-1 text-ivory-100 outline-none focus:border-cyan-400"
                  />
                  <select
                    value={p.gender}
                    onChange={(e) => updatePlayer(idx, "gender", e.target.value)}
                    className="w-24 rounded border border-white/10 bg-navy-950 px-2 py-1 text-ivory-100 outline-none focus:border-cyan-400"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4 shrink-0">
            <button type="button" onClick={onClose} disabled={saving} className={btnGhost}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
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
  onChanged: (message: string, isError?: boolean, title?: string) => void;
}) {
  const [busy, setBusy] = useState<"allocate" | "round1" | null>(null);
  const [confirmModal, setConfirmModal] = useState<"allocate" | "round1" | null>(null);

  const isTwoGroupMode = teamCount < 12;
  const isValidTeamCount = teamCount >= 4 && teamCount <= 16;

  async function allocate() {
    setBusy("allocate");
    try {
      const res = await fetch("/api/admin/groups/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      setBusy(null);
      if (res.ok) {
        onChanged(json.message || `Successfully allocated ${isTwoGroupMode ? "2 groups" : "4 groups"}.`, false, "Group Allocation");
      } else {
        onChanged(json.error || "Failed to allocate groups.", true, "Allocation Error");
      }
    } catch {
      setBusy(null);
      onChanged("Failed to allocate groups. Please try again.", true, "Connection Error");
    }
  }

  async function generateRound1() {
    setBusy("round1");
    try {
      const res = await fetch("/api/admin/matches/generate-round1", { method: "POST" });
      const json = await res.json();
      setBusy(null);
      if (res.ok) {
        onChanged(`Created ${json.matchesCreated} round-1 fixtures.`, false, "Matches Generated");
      } else {
        onChanged(json.error || "Failed to generate round 1 matches.", true, "Fixture Error");
      }
    } catch {
      setBusy(null);
      onChanged("Failed to generate round 1 matches.", true, "Connection Error");
    }
  }

  return (
    <div className="space-y-6">
      <div className={`${cardClass} space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-display text-2xl tracking-wide text-ivory-50">
              {isTwoGroupMode ? "Two-Group Tournament System" : "Four-Group Tournament System"}
            </h3>
            <p className="mt-1 text-xs text-ivory-300">
              {isTwoGroupMode
                ? "Allocates teams into Group A and Group B (top team in each group advances directly to Final)."
                : "Allocates teams into Group A, Group B, Group C, and Group D (top team in each group advances to Semifinals)."}
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold border ${isValidTeamCount
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-amber-500/40 bg-amber-500/10 text-amber-300"
              }`}
          >
            <Users size={14} />
            <span>
              {teamCount} Teams Registered
            </span>
          </div>
        </div>

        {!isValidTeamCount && (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            ⚠️ Group allocation requires between <strong>4 and 16</strong> registered teams. Currently, there are <strong>{teamCount}</strong> team(s) registered.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={() => setConfirmModal("allocate")}
            disabled={busy !== null || !isValidTeamCount}
            className={btnPrimary}
          >
            {busy === "allocate" ? <Loader2 size={14} className="animate-spin" /> : <Shuffle size={14} />}
            {isTwoGroupMode ? "Randomly Allocate 2 Groups" : "Randomly Allocate 4 Groups"}
          </button>

          <button
            onClick={() => setConfirmModal("round1")}
            disabled={busy !== null || groups.length === 0}
            className={btnGhost}
          >
            {busy === "round1" ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            Generate Round 1 Matches
          </button>
        </div>

        <p className="text-[11px] text-ivory-400">
          * Re-allocating randomly redistributes teams into {isTwoGroupMode ? "Group A & B" : "Group A–D"} and resets any existing group fixtures.
        </p>
      </div>

      {groups.length === 0 ? (
        <div className={`${cardClass} py-12 text-center`}>
          <Users size={32} className="mx-auto text-ivory-500 mb-3 opacity-60" />
          <p className="text-sm font-medium text-ivory-300">No groups allocated yet.</p>
          <p className="mt-1 text-xs text-ivory-400">
            {isValidTeamCount
              ? `Click '${isTwoGroupMode ? "Randomly Allocate 2 Groups" : "Randomly Allocate 4 Groups"}' to split registered teams into ${isTwoGroupMode ? "Group A and B" : "Group A, B, C, and D"}.`
              : "Register at least 4 teams to enable group allocation."}
          </p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${groups.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-4"}`}>
          {groups.map((g) => (
            <div key={g.id} className={`${cardClass} flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
                  <h3 className="font-display text-xl tracking-wide text-cyan-300">{g.name}</h3>
                  <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 font-mono-score text-[10px] font-bold text-cyan-300">
                    {g.teams.length} Teams
                  </span>
                </div>
                <ul className="space-y-2 text-sm">
                  {g.teams.map((t, idx) => (
                    <li key={t.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-ivory-200">
                      <span className="flex items-center gap-2 font-medium text-xs">
                        <span className="font-mono-score text-[10px] text-ivory-500">#{idx + 1}</span>
                        {t.teamName}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal for Group Allocation */}
      {confirmModal === "allocate" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-cyan-500/30 bg-navy-950 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-cyan-400">
              <Shuffle size={24} />
              <h3 className="font-display text-xl tracking-wide text-ivory-50">Allocate Groups</h3>
            </div>
            <p className="mt-3 text-sm text-ivory-300 leading-relaxed">
              Are you sure you want to randomly allocate groups? This will divide the registered teams into <strong className="text-cyan-300">{isTwoGroupMode ? "Group A and Group B" : "Group A, Group B, Group C, and Group D"}</strong>. Any existing group assignments or round-1 fixtures will be reset.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                disabled={busy !== null}
                className={btnGhost}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await allocate();
                  setConfirmModal(null);
                }}
                disabled={busy !== null}
                className={btnPrimary}
              >
                {busy === "allocate" ? <Loader2 size={14} className="animate-spin" /> : <Shuffle size={14} />}
                Allocate Groups
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Round 1 Match Generation */}
      {confirmModal === "round1" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-cyan-500/30 bg-navy-950 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-400">
              <Play size={24} />
              <h3 className="font-display text-xl tracking-wide text-ivory-50">Generate Round 1 Matches</h3>
            </div>
            <p className="mt-3 text-sm text-ivory-300 leading-relaxed">
              Are you sure you want to generate Round 1 matches? This will clear any existing Round 1 fixtures and regenerate match pairings for all groups.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                disabled={busy !== null}
                className={btnGhost}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await generateRound1();
                  setConfirmModal(null);
                }}
                disabled={busy !== null}
                className={btnPrimary}
              >
                {busy === "round1" ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                Generate Round 1 Matches
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MatchesTab({
  matches,
  teams,
  groups,
  onChanged,
}: {
  matches: MatchRow[];
  teams: AdminTeam[];
  groups: Group[];
  onChanged: (message: string, isError?: boolean, title?: string) => void;
}) {
  const isTwoGroupMode = groups.length <= 2;

  // Selected Round filter in Admin Matches Tab
  const [adminRound, setAdminRound] = useState<MatchRow["stage"]>("round1");
  const [selectedMatchForDetails, setSelectedMatchForDetails] = useState<MatchRow | null>(null);
  const [editingMatchModal, setEditingMatchModal] = useState<MatchRow | null>(null);
  const [deletingMatchModal, setDeletingMatchModal] = useState<MatchRow | null>(null);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("all");

  useEffect(() => {
    if (isTwoGroupMode && adminRound === "semifinal") {
      setAdminRound("round1");
    }
  }, [isTwoGroupMode, adminRound]);

  useEffect(() => {
    setSelectedGroupFilter("all");
  }, [adminRound]);

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

  const availableGroupNames = Array.from(
    new Set(
      roundMatches
        .map((m) => m.group_name)
        .filter((name): name is string => Boolean(name))
    )
  ).sort();

  const filteredMatches = roundMatches.filter(
    (m) =>
      selectedGroupFilter === "all" ||
      m.group_name === selectedGroupFilter ||
      m.label?.includes(selectedGroupFilter)
  );

  const upcomingRoundMatches = filteredMatches.filter((m) => m.status !== "completed");
  const completedRoundMatches = filteredMatches.filter((m) => m.status === "completed");

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
  const [showFinishMatchModal, setShowFinishMatchModal] = useState(false);
  const [standingsData, setStandingsData] = useState<Record<string, GroupStandingRow[]>>({});

  const fetchStandings = useCallback(() => {
    fetch("/api/admin/standings")
      .then((res) => res.json())
      .then((json) => {
        if (json.standings) setStandingsData(json.standings);
      })
      .catch(() => { });
  }, []);

  const handleSetQualifier = async (groupName: string, teamId: string | null) => {
    try {
      const res = await fetch("/api/admin/qualifiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName, teamId }),
      });
      if (res.ok) {
        fetchStandings();
        const qualifierStage = isTwoGroupMode ? "Final" : "Semifinal";
        onChanged(
          teamId ? `Set ${groupName} ${qualifierStage} qualifier manually.` : `Reset ${groupName} to automatic Points & Run Rate ranking.`,
          false,
          "Qualifier Updated"
        );
      }
    } catch (err) {
      console.error("Set qualifier error:", err);
    }
  };

  useEffect(() => {
    fetchStandings();
  }, [matches, fetchStandings]);

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

  // Only sync inputs when selectedLiveId changes (e.g. admin selects another match in dropdown)
  const prevSelectedLiveIdRef = useRef<string>("");

  useEffect(() => {
    if (selectedLiveId && selectedLiveId !== prevSelectedLiveIdRef.current) {
      prevSelectedLiveIdRef.current = selectedLiveId;
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
    if (res.ok) {
      prevSelectedLiveIdRef.current = "";
      if (newStatus === "completed") {
        setSelectedLiveId("");
      }
    }
    onChanged(
      res.ok
        ? newStatus === "live"
          ? `Match "${selectedMatchObj?.team_a_name ?? 'Team A'} vs ${selectedMatchObj?.team_b_name ?? 'Team B'}" is now LIVE! Scores broadcasting.`
          : `Match completed! Moved to Match Results section.`
        : json.error,
      !res.ok,
      res.ok ? "Match Updated" : "Match Error"
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
    onChanged(
      res.ok ? "New match fixture created." : json.error,
      !res.ok,
      res.ok ? "Match Created" : "Fixture Error"
    );
    if (res.ok) setForm((f) => ({ ...f, label: "", teamAId: "", teamBId: "" }));
  }

  const [serverActiveRound, setServerActiveRound] = useState<MatchRow["stage"]>("round1");
  const [matchesPublished, setMatchesPublished] = useState(false);
  const [togglingPublish, setTogglingPublish] = useState(false);

  // Fetch current active live round and matchesPublished setting from PostgreSQL on mount
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.activeRound) {
          setServerActiveRound(json.activeRound);
          setAdminRound(json.activeRound);
        }
        if (typeof json.matchesPublished === "boolean") {
          setMatchesPublished(json.matchesPublished);
        }
      })
      .catch(() => { });
  }, []);

  const [submittingRound, setSubmittingRound] = useState(false);

  async function toggleMatchesPublished() {
    setTogglingPublish(true);
    const newValue = !matchesPublished;
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchesPublished: newValue }),
    });
    const json = await res.json();
    setTogglingPublish(false);
    if (res.ok) {
      setMatchesPublished(newValue);
      onChanged(
        newValue
          ? "Matches & Schedules are now UNHIDDEN and PUBLICLY VISIBLE to users on /matches!"
          : "Matches page is now HIDDEN in 'Coming Soon' mode for users.",
        false,
        "Visibility Setting"
      );
    } else {
      onChanged(json.error || "Failed to update visibility setting", true, "Visibility Error");
    }
  }

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
        : adminRound === "semifinal"
          ? "Semifinals"
          : "Final";

    if (res.ok) {
      setServerActiveRound(adminRound);
      onChanged(`Successfully published "${roundLabel}" as the Current Live Round on user matches page!`, false, "Live Round Published");
    } else {
      onChanged(json.error || "Failed to publish active round", true, "Publish Error");
    }
  }

  const selectedMatchObj = matches.find((m) => m.id === selectedLiveId);

  const roundButtonOptions = isTwoGroupMode
    ? [
        { id: "round1", label: "1st Round" },
        { id: "final", label: "Final" },
      ]
    : [
        { id: "round1", label: "1st Round" },
        { id: "semifinal", label: "Semifinals" },
        { id: "final", label: "Final" },
      ];

  return (
    <div className="space-y-8">
      {/* ══════════════════════════════════════════════════════════════
          0. MANUAL MATCHES VISIBILITY CONTROL (UNHIDE / HIDE)
      ══════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-gold-500/30 bg-[#070e1c] p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${matchesPublished ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            <h3 className="font-mono-score text-xs font-bold uppercase tracking-widest text-gold-400">
              PUBLIC MATCHES PAGE VISIBILITY CONTROL
            </h3>
          </div>
          <p className="mt-1 text-xs text-ivory-300">
            {matchesPublished
              ? "Matches & Schedules are currently UNHIDDEN & PUBLICLY VISIBLE"
              : "Matches & Schedules are currently HIDDEN"}
          </p>
        </div>

        <button
          type="button"
          onClick={toggleMatchesPublished}
          disabled={togglingPublish}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-lg ${matchesPublished
            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
            }`}
        >
          {togglingPublish ? (
            <Loader2 size={15} className="animate-spin" />
          ) : matchesPublished ? (
            <>Hide Matches (Set &apos;Coming Soon&apos; Mode)</>
          ) : (
            <>Unhide &amp; Publish Matches for Users</>
          )}
        </button>
      </div>

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
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 font-mono-score text-xs font-bold uppercase tracking-wider text-navy-950 hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105"
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
          {roundButtonOptions.map((r) => {
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
                className={`relative inline-flex items-center gap-2 rounded-full px-5 py-2 font-mono-score text-xs font-bold uppercase tracking-wider transition-all duration-200 ${isSelected
                  ? "bg-cyan-500 text-navy-950 shadow-[0_0_20px_rgba(34,211,238,0.4)] scale-105 font-extrabold"
                  : "border border-white/10 bg-white/[0.03] text-ivory-300 hover:border-cyan-400/40 hover:text-white"
                  }`}
              >
                <span>{r.label}</span>
                {isLiveOnWebsite && (
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-extrabold tracking-wider ${isSelected
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
              {roundMatches
                .filter((m) => m.status !== "completed")
                .map((m) => {
                  if (adminRound === "semifinal" || adminRound === "final") {
                    const teamAObj = teams.find((t) => t.id === m.team_a_id);
                    const teamBObj = teams.find((t) => t.id === m.team_b_id);

                    const grpA = teamAObj?.group_name || teamAObj?.batch || "";
                    const grpB = teamBObj?.group_name || teamBObj?.batch || "";

                    const labelA = grpA ? ` (${grpA})` : "";
                    const labelB = grpB ? ` (${grpB})` : "";

                    const matchLabel = m.label ? `[${m.label}] ` : "";

                    return (
                      <option key={m.id} value={m.id}>
                        {matchLabel}{m.team_a_name ?? "TBD"}{labelA} vs {m.team_b_name ?? "TBD"}{labelB}
                      </option>
                    );
                  } else {
                    const groupName =
                      m.group_name ||
                      (m.label && m.label.toLowerCase().includes("group") ? m.label : "") ||
                      teams.find((t) => t.id === m.team_a_id || t.id === m.team_b_id)?.group_name ||
                      teams.find((t) => t.id === m.team_a_id || t.id === m.team_b_id)?.batch ||
                      "";
                    const prefix = groupName ? `[${groupName}] ` : "";

                    return (
                      <option key={m.id} value={m.id}>
                        {prefix}{m.team_a_name ?? "TBD"} vs {m.team_b_name ?? "TBD"}
                      </option>
                    );
                  }
                })}
            </select>
          </div>

          {selectedMatchObj && (
            <div className="grid grid-cols-1 gap-4 rounded-xl bg-white/[0.03] p-4 sm:grid-cols-2">
              {/* Team A Live Inputs */}
              <div className="space-y-2 rounded-lg border border-white/10 p-3">
                <span className="block text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {selectedMatchObj.team_a_name ?? "Team A"}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="mb-1.5 block text-[10px] text-ivory-400">Runs</label>
                    <NonPassiveWheelInput
                      type="number"
                      min={0}
                      value={liveRunsA}
                      onChange={(val) => handleRunsChange(val, setLiveRunsA)}
                      onWheelStep={(dir) =>
                        setLiveRunsA((prev) => {
                          const n = parseInt(prev, 10);
                          const base = isNaN(n) ? 0 : n;
                          return dir === "up" ? (base + 1).toString() : Math.max(0, base - 1).toString();
                        })
                      }
                      onKeyDown={(e) =>
                        handleScoreKeyDown(
                          e,
                          () => setLiveRunsA((prev) => (Math.max(0, parseInt(prev, 10) || 0) + 1).toString()),
                          () => setLiveRunsA((prev) => Math.max(0, (parseInt(prev, 10) || 0) - 1).toString()),
                          () => updateLiveMatch("live")
                        )
                      }
                      placeholder="142"
                      className={inputClass}
                      dataScoreInput
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] text-ivory-400">Wickets</label>
                    <NonPassiveWheelInput
                      type="number"
                      min={0}
                      max={10}
                      value={liveWktsA}
                      onChange={(val) => handleWktsChange(val, setLiveWktsA)}
                      onWheelStep={(dir) =>
                        setLiveWktsA((prev) => {
                          const n = parseInt(prev, 10);
                          const base = isNaN(n) ? 0 : n;
                          return dir === "up" ? Math.min(10, base + 1).toString() : Math.max(0, base - 1).toString();
                        })
                      }
                      onKeyDown={(e) =>
                        handleScoreKeyDown(
                          e,
                          () => setLiveWktsA((prev) => Math.min(10, (parseInt(prev, 10) || 0) + 1).toString()),
                          () => setLiveWktsA((prev) => Math.max(0, (parseInt(prev, 10) || 0) - 1).toString()),
                          () => updateLiveMatch("live")
                        )
                      }
                      placeholder="4"
                      className={inputClass}
                      dataScoreInput
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] text-ivory-400">Overs</label>
                    <NonPassiveWheelInput
                      type="text"
                      value={liveOversA}
                      onChange={(val) => handleOversChange(val, setLiveOversA)}
                      onWheelStep={(dir) => setLiveOversA((prev) => stepCricketOvers(prev, dir))}
                      onKeyDown={(e) =>
                        handleScoreKeyDown(
                          e,
                          () => setLiveOversA((prev) => stepCricketOvers(prev, "up")),
                          () => setLiveOversA((prev) => stepCricketOvers(prev, "down")),
                          () => updateLiveMatch("live")
                        )
                      }
                      placeholder="18.2"
                      className={inputClass}
                      dataScoreInput
                    />
                  </div>
                </div>
              </div>

              {/* Team B Live Inputs */}
              <div className="space-y-2 rounded-lg border border-white/10 p-3">
                <span className="block text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {selectedMatchObj.team_b_name ?? "Team B"}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="mb-1.5 block text-[10px] text-ivory-400">Runs</label>
                    <NonPassiveWheelInput
                      type="number"
                      min={0}
                      value={liveRunsB}
                      onChange={(val) => handleRunsChange(val, setLiveRunsB)}
                      onWheelStep={(dir) =>
                        setLiveRunsB((prev) => {
                          const n = parseInt(prev, 10);
                          const base = isNaN(n) ? 0 : n;
                          return dir === "up" ? (base + 1).toString() : Math.max(0, base - 1).toString();
                        })
                      }
                      onKeyDown={(e) =>
                        handleScoreKeyDown(
                          e,
                          () => setLiveRunsB((prev) => (Math.max(0, parseInt(prev, 10) || 0) + 1).toString()),
                          () => setLiveRunsB((prev) => Math.max(0, (parseInt(prev, 10) || 0) - 1).toString()),
                          () => updateLiveMatch("live")
                        )
                      }
                      placeholder="98"
                      className={inputClass}
                      dataScoreInput
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] text-ivory-400">Wickets</label>
                    <NonPassiveWheelInput
                      type="number"
                      min={0}
                      max={10}
                      value={liveWktsB}
                      onChange={(val) => handleWktsChange(val, setLiveWktsB)}
                      onWheelStep={(dir) =>
                        setLiveWktsB((prev) => {
                          const n = parseInt(prev, 10);
                          const base = isNaN(n) ? 0 : n;
                          return dir === "up" ? Math.min(10, base + 1).toString() : Math.max(0, base - 1).toString();
                        })
                      }
                      onKeyDown={(e) =>
                        handleScoreKeyDown(
                          e,
                          () => setLiveWktsB((prev) => Math.min(10, (parseInt(prev, 10) || 0) + 1).toString()),
                          () => setLiveWktsB((prev) => Math.max(0, (parseInt(prev, 10) || 0) - 1).toString()),
                          () => updateLiveMatch("live")
                        )
                      }
                      placeholder="2"
                      className={inputClass}
                      dataScoreInput
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] text-ivory-400">Overs</label>
                    <NonPassiveWheelInput
                      type="text"
                      value={liveOversB}
                      onChange={(val) => handleOversChange(val, setLiveOversB)}
                      onWheelStep={(dir) => setLiveOversB((prev) => stepCricketOvers(prev, dir))}
                      onKeyDown={(e) =>
                        handleScoreKeyDown(
                          e,
                          () => setLiveOversB((prev) => stepCricketOvers(prev, "up")),
                          () => setLiveOversB((prev) => stepCricketOvers(prev, "down")),
                          () => updateLiveMatch("live")
                        )
                      }
                      placeholder="12.0"
                      className={inputClass}
                      dataScoreInput
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
                      {selectedMatchObj.team_a_name} (WINNER)
                    </option>
                  )}
                  {selectedMatchObj.team_b_id && (
                    <option value={selectedMatchObj.team_b_id}>
                      {selectedMatchObj.team_b_name} (WINNER)
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
                  Set Live & Broadcast Score
                </button>

                <button
                  type="button"
                  disabled={updatingLive}
                  onClick={() => setShowFinishMatchModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-5 py-2 text-xs font-bold text-navy-950 hover:bg-gold-300 transition-colors shadow-lg"
                >
                  Finish Match & Move to Results Tab
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          3. NEW FIXTURE CREATOR FOR SELECTED ROUND
      ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const sfTeamIds = new Set<string>();
        if (form.stage === "semifinal" && !isTwoGroupMode) {
          Object.values(standingsData).forEach((groupTeams) => {
            const qualified = groupTeams.find((t) => t.isQualified) ?? groupTeams[0];
            if (qualified) sfTeamIds.add(qualified.teamId);
          });
        }

        const finalTeamIds = new Set<string>();
        if (form.stage === "final") {
          if (isTwoGroupMode) {
            Object.values(standingsData).forEach((groupTeams) => {
              const qualified = groupTeams.find((t) => t.isQualified) ?? groupTeams[0];
              if (qualified) finalTeamIds.add(qualified.teamId);
            });
          } else {
            const sfMatches = matches.filter((m) => m.stage === "semifinal");
            sfMatches.forEach((m) => {
              if (m.winner_id) {
                finalTeamIds.add(m.winner_id);
              } else {
                if (m.team_a_id) finalTeamIds.add(m.team_a_id);
                if (m.team_b_id) finalTeamIds.add(m.team_b_id);
              }
            });
          }
        }

        const selectableFixtureTeams =
          form.stage === "semifinal" && sfTeamIds.size > 0
            ? teams.filter((t) => sfTeamIds.has(t.id))
            : form.stage === "final" && finalTeamIds.size > 0
              ? teams.filter((t) => finalTeamIds.has(t.id))
              : teams;

        return (
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
                {!isTwoGroupMode && <option value="semifinal">Semifinal</option>}
                <option value="final">Final</option>
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
                <option value="">Select Team ({selectableFixtureTeams.length} available)</option>
                {selectableFixtureTeams.map((t) => {
                  const grp = t.group_name || t.batch ? ` [${t.group_name || t.batch}]` : "";
                  return (
                    <option key={t.id} value={t.id}>
                      {t.team_name}{grp}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ivory-300">Team B</label>
              <select
                value={form.teamBId}
                onChange={(e) => setForm((f) => ({ ...f, teamBId: e.target.value }))}
                className={inputClass}
              >
                <option value="">Select Team ({selectableFixtureTeams.length} available)</option>
                {selectableFixtureTeams.map((t) => {
                  const grp = t.group_name || t.batch ? ` [${t.group_name || t.batch}]` : "";
                  return (
                    <option key={t.id} value={t.id}>
                      {t.team_name}{grp}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="col-span-full">
              <button type="submit" disabled={creating} className={btnPrimary}>
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Create Match Fixture
              </button>
            </div>
          </form>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          4. ALL MATCHES LIST (UPCOMING & RESULTS FOR SELECTED ROUND)
      ══════════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-display text-2xl tracking-wide text-ivory-50">
              Match List for {adminRound.toUpperCase()}
            </h3>
            <p className="mt-1 text-xs text-ivory-300">
              {selectedGroupFilter === "all"
                ? `Showing all ${roundMatches.length} matches for ${adminRound.toUpperCase()}.`
                : `Showing fixtures for ${selectedGroupFilter}.`}
            </p>
          </div>

          {/* Group Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-navy-950 p-1">
            <button
              type="button"
              onClick={() => setSelectedGroupFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${selectedGroupFilter === "all"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-ivory-400 hover:text-ivory-200"
                }`}
            >
              All Groups ({roundMatches.length})
            </button>
            {(availableGroupNames.length > 0 ? availableGroupNames : ["Group A", "Group B", "Group C", "Group D"]).map((gName) => {
              const count = roundMatches.filter(
                (m) => m.group_name === gName || m.label?.includes(gName)
              ).length;
              return (
                <button
                  key={gName}
                  type="button"
                  onClick={() => setSelectedGroupFilter(gName)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${selectedGroupFilter === gName
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-ivory-400 hover:text-ivory-200"
                    }`}
                >
                  {gName} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Upcoming / Live Matches list (Compact Cards like User Side) */}
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-400">
            • Live & Scheduled Fixtures ({upcomingRoundMatches.length})
          </h4>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {upcomingRoundMatches.length === 0 ? (
              <p className="text-xs text-ivory-400">No scheduled or live matches in this round.</p>
            ) : (
              upcomingRoundMatches.map((m) => (
                <CompactAdminMatchCard
                  key={m.id}
                  match={m}
                  teams={teams}
                  onSelectLive={(id) => handleLiveSelect(id)}
                  onViewDetails={(match) => setSelectedMatchForDetails(match)}
                  onEditMatch={(match) => setEditingMatchModal(match)}
                  onDeleteMatch={(match) => setDeletingMatchModal(match)}
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
                <MatchEditor
                  key={m.id}
                  match={m}
                  teams={teams}
                  onViewDetails={(match) => setSelectedMatchForDetails(match)}
                  onChanged={onChanged}
                />
              ))
            )}
          </div>
        </div>

        {/* 1st Round Group Standings & Run Rate Table (Shown ONLY in 1st Round Tab) */}
        {adminRound === "round1" && (
          <div className="pt-4 border-t border-white/10">
            <div className="rounded-2xl border border-cyan-500/30 bg-[#070e1c]/90 p-5 shadow-xl space-y-4 text-left">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <h4 className="font-display text-xl font-bold tracking-wide text-ivory-50 flex items-center gap-2">
                    1st Round Group Standings &amp; Run Rate
                  </h4>
                  <p className="mt-0.5 text-xs text-ivory-300">
                    {isTwoGroupMode
                      ? "Automatically calculated from completed 1st Round matches. Ranked by Points, then Run Rate tie-breaker. Highest team in each group qualifies directly for the Final."
                      : "Automatically calculated from completed 1st Round matches. Ranked by Points, then Run Rate tie-breaker. Highest team in each group qualifies for Semifinals."}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/15 bg-navy-950/80 text-ivory-300 font-mono uppercase tracking-wider">
                      <th className="p-3 border border-white/10 font-semibold w-28 text-center">Group</th>
                      <th className="p-3 border border-white/10 font-semibold">Team Name</th>
                      <th className="p-3 border border-white/10 font-semibold text-center w-20">Points</th>
                      <th className="p-3 border border-white/10 font-semibold text-center w-24">Run Rate</th>
                      <th className="p-3 border border-white/10 font-semibold text-center w-36">Qualifier Selection</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(standingsData).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-ivory-400">
                          No 1st Round group standings available yet.
                        </td>
                      </tr>
                    ) : (
                      Object.entries(standingsData).map(([groupName, groupTeams]) =>
                        groupTeams.map((t, idx) => {
                          const isQualified = t.isQualified ?? (idx === 0);
                          const isManual = t.isManualOverride ?? false;

                          return (
                            <tr
                              key={t.teamId}
                              className={`border-b border-white/5 transition-colors ${isQualified
                                  ? "bg-emerald-500/10 text-emerald-300 font-semibold"
                                  : "hover:bg-white/[0.02] text-ivory-200"
                                }`}
                            >
                              {idx === 0 && (
                                <td
                                  rowSpan={groupTeams.length}
                                  className="p-3 border border-white/10 align-middle text-center font-bold text-cyan-400 bg-navy-950/40 text-sm"
                                >
                                  {groupName}
                                </td>
                              )}
                              <td className="p-3 border border-white/10 font-medium">
                                <div className="flex items-center gap-2">
                                  {isQualified && (
                                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                      <span>{isTwoGroupMode ? "FINAL QUALIFIED" : "SF QUALIFIED"}</span>
                                      {isManual && <span className="text-[8px] text-amber-300 font-bold">(MANUAL)</span>}
                                    </span>
                                  )}
                                  <span>{t.teamName}</span>
                                </div>
                              </td>
                              <td className="p-3 border border-white/10 text-center font-mono font-bold text-gold-400 text-sm">
                                {t.points}
                              </td>
                              <td className="p-3 border border-white/10 text-center font-mono text-cyan-300 font-semibold">
                                {t.runRate.toFixed(1)}
                              </td>
                              <td className="p-3 border border-white/10 text-center">
                                {isQualified ? (
                                  isManual ? (
                                    <button
                                      type="button"
                                      onClick={() => handleSetQualifier(groupName, null)}
                                      className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-300 hover:bg-amber-500/20"
                                      title="Reset to automatic points & run-rate calculation"
                                    >
                                      Reset to Auto
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-emerald-400 font-mono italic">
                                      Auto-Selected
                                    </span>
                                  )
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleSetQualifier(groupName, t.teamId)}
                                    className="rounded border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:text-white"
                                  >
                                    Set as Qualifier
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Match Team Details Modal Overlay */}
      {selectedMatchForDetails && (
        <MatchTeamDetailsModal
          match={selectedMatchForDetails}
          teams={teams}
          onClose={() => setSelectedMatchForDetails(null)}
        />
      )}

      {/* Standalone Match Edit Modal Overlay */}
      {editingMatchModal && (
        <EditMatchModal
          match={editingMatchModal}
          teams={teams}
          onClose={() => setEditingMatchModal(null)}
          onChanged={onChanged}
        />
      )}

      {/* Standalone Match Delete Modal Overlay */}
      {deletingMatchModal && (
        <DeleteMatchModal
          match={deletingMatchModal}
          onClose={() => setDeletingMatchModal(null)}
          onDeleted={onChanged}
        />
      )}

      {/* Finish Live Match Confirmation Modal Overlay */}
      {showFinishMatchModal && selectedMatchObj && (
        <FinishMatchModal
          matchTitle={`${selectedMatchObj.team_a_name ?? "Team A"} vs ${selectedMatchObj.team_b_name ?? "Team B"}`}
          loading={updatingLive}
          onClose={() => setShowFinishMatchModal(false)}
          onConfirm={async () => {
            await updateLiveMatch("completed");
            setShowFinishMatchModal(false);
          }}
        />
      )}
    </div>
  );
}

function FinishMatchModal({
  matchTitle,
  loading,
  onClose,
  onConfirm,
}: {
  matchTitle: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#070e1c] p-6 shadow-2xl space-y-4 text-left">
        <div className="flex items-center gap-3 text-rose-400">
          <AlertTriangle size={24} />
          <h3 className="font-display text-xl font-bold tracking-wide text-ivory-50">Finish Match</h3>
        </div>

        <p className="text-sm leading-relaxed text-ivory-300">
          Are you sure you want to finish <strong className="text-white font-semibold">{matchTitle}</strong>? This will conclude live score tracking and move this match fixture into the completed match results section.
        </p>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs font-semibold text-ivory-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-rose-600/30 transition-all hover:bg-rose-500 active:scale-95 disabled:opacity-60"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : "Finish Match"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CompactAdminMatchCard({
  match,
  teams,
  onSelectLive,
  onViewDetails,
  onEditMatch,
  onDeleteMatch,
  onChanged,
}: {
  match: MatchRow;
  teams: AdminTeam[];
  onSelectLive: (id: string) => void;
  onViewDetails?: (match: MatchRow) => void;
  onEditMatch?: (match: MatchRow) => void;
  onDeleteMatch?: (match: MatchRow) => void;
  onChanged: (message: string, isError?: boolean, title?: string) => void;
}) {
  async function remove() {
    if (!confirm(`Are you sure you want to delete fixture "${match.team_a_name ?? 'Team A'} vs ${match.team_b_name ?? 'Team B'}"?`)) return;
    const res = await fetch(`/api/admin/matches/${match.id}`, { method: "DELETE" });
    const json = await res.json();
    onChanged(
      res.ok ? "Match fixture deleted." : json.error,
      !res.ok,
      res.ok ? "Match Deleted" : "Delete Error"
    );
  }

  return (
    <div className="group relative flex w-full flex-col justify-between rounded-xl border border-white/10 bg-[#070e1c]/80 p-3.5 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]">
      {/* Top Teams Row */}
      <div className="my-1 flex items-center justify-between gap-1.5 text-center">
        {/* Team A */}
        <div className="flex-1 min-w-0">
          <span className="block truncate font-display text-xs font-extrabold tracking-wide text-ivory-50 group-hover:text-white sm:text-sm">
            {match.team_a_name ?? "TEAM A"}
          </span>
        </div>

        {/* VS Badge Pill */}
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

      {/* Card Footer Divider & Actions */}
      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5">
        <button
          type="button"
          onClick={() => {
            onSelectLive(match.id);
            onViewDetails?.(match);
          }}
          className="inline-flex items-center gap-1 font-mono-score text-[11px] font-semibold tracking-wider text-emerald-400 transition-colors hover:text-emerald-300"
          title="View Squad & Team Details"
        >
          <span>View Details</span>
          <ChevronRight size={12} />
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEditMatch?.(match)}
            className="text-ivory-300 hover:text-white text-xs"
            title="Edit Fixture Allocation"
          >
            ✏️
          </button>
          <button
            type="button"
            onClick={() => (onDeleteMatch ? onDeleteMatch(match) : remove())}
            className="text-red-400 hover:text-red-300 transition-colors"
            title="Delete Fixture"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function EditMatchModal({
  match,
  teams,
  onClose,
  onChanged,
}: {
  match: MatchRow;
  teams: AdminTeam[];
  onClose: () => void;
  onChanged: (message: string, isError?: boolean, title?: string) => void;
}) {
  const [teamAId, setTeamAId] = useState(match.team_a_id ?? "");
  const [teamBId, setTeamBId] = useState(match.team_b_id ?? "");
  const [label, setLabel] = useState(match.label ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (teamAId && teamBId && teamAId === teamBId) {
      onChanged("Team A and Team B cannot be the same team.", true, "Invalid Allocation");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/matches/${match.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamAId: teamAId === "" ? null : teamAId,
          teamBId: teamBId === "" ? null : teamBId,
          label: label === "" ? null : label,
        }),
      });
      const json = await res.json();
      setSaving(false);
      if (res.ok) {
        onChanged("Match fixture updated successfully.", false, "Fixture Saved");
        onClose();
      } else {
        onChanged(json.error || "Failed to update match fixture.", true, "Update Error");
      }
    } catch {
      setSaving(false);
      onChanged("Connection error updating match fixture.", true, "Connection Error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-cyan-500/30 bg-navy-950 p-6 shadow-2xl space-y-4 text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Pencil size={18} />
            <h3 className="font-display text-xl tracking-wide text-ivory-50">Reallocate Fixture Teams</h3>
          </div>
          <button onClick={onClose} className="text-ivory-400 hover:text-ivory-200">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-ivory-300 mb-1">Match Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Round 1 · Match 1"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block font-semibold text-ivory-300 mb-1">Team A</label>
            <select
              value={teamAId}
              onChange={(e) => setTeamAId(e.target.value)}
              className={inputClass}
            >
              <option value="">-- Select Team A --</option>
              {(match.group_id ? teams.filter((t) => t.group_id === match.group_id) : teams).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.team_name} ({t.group_name || t.batch})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-ivory-300 mb-1">Team B</label>
            <select
              value={teamBId}
              onChange={(e) => setTeamBId(e.target.value)}
              className={inputClass}
            >
              <option value="">-- Select Team B --</option>
              {(match.group_id ? teams.filter((t) => t.group_id === match.group_id) : teams).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.team_name} ({t.group_name || t.batch})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className={btnGhost}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={btnPrimary}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteMatchModal({
  match,
  onClose,
  onDeleted,
}: {
  match: MatchRow;
  onClose: () => void;
  onDeleted: (msg: string, isError?: boolean, title?: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matchTitle = `${match.team_a_name ?? "Team A"} vs ${match.team_b_name ?? "Team B"}`;

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/matches/${match.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to delete match fixture");
      }
      onDeleted("Match fixture deleted successfully.", false, "Match Deleted");
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error deleting match fixture");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#070e1c] p-6 shadow-2xl space-y-4 text-left">
        <div className="flex items-center gap-3 text-rose-400">
          <AlertTriangle size={24} />
          <h3 className="font-display text-xl font-bold tracking-wide text-ivory-50">Delete Fixture</h3>
        </div>

        <p className="text-sm leading-relaxed text-ivory-300">
          Are you sure you want to delete <strong className="text-white font-semibold">{matchTitle}</strong>? This will permanently remove this match fixture from the tournament schedule.
        </p>

        {error && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-2.5 text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs font-semibold text-ivory-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-rose-600/30 transition-all hover:bg-rose-500 active:scale-95 disabled:opacity-60"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            Delete Fixture
          </button>
        </div>
      </div>
    </div>
  );
}

function MatchEditor({
  match,
  teams,
  onViewDetails,
  onChanged,
}: {
  match: MatchRow;
  teams: AdminTeam[];
  onViewDetails?: (match: MatchRow) => void;
  onChanged: (message: string, isError?: boolean, title?: string) => void;
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
    onChanged(
      res.ok ? "Match updated successfully." : json.error,
      !res.ok,
      res.ok ? "Match Updated" : "Update Error"
    );
  }

  async function remove() {
    const res = await fetch(`/api/admin/matches/${match.id}`, { method: "DELETE" });
    const json = await res.json();
    onChanged(
      res.ok ? "Match deleted." : json.error,
      !res.ok,
      res.ok ? "Match Deleted" : "Delete Error"
    );
  }

  return (
    <div className={`${cardClass} space-y-3`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-score text-xs uppercase tracking-wide text-cyan-400">
              {match.stage.toUpperCase()} {match.label ? `· ${match.label}` : ""}
            </span>
            {onViewDetails && (
              <button
                type="button"
                onClick={() => onViewDetails(match)}
                className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                title="View Team Squad Details"
              >
                <span>View Details</span>
                <ChevronRight size={11} />
              </button>
            )}
          </div>
          <h4 className="text-sm font-bold text-ivory-100">
            {match.team_a_name ?? "TBD"} <span className="text-ivory-400">vs</span> {match.team_b_name ?? "TBD"}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as MatchRow["status"])}
            className={`${inputClass} w-32 font-semibold ${status === "live"
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
              <label className="mb-1.5 block text-[10px] text-ivory-400">Runs</label>
              <NonPassiveWheelInput
                type="number"
                min={0}
                value={scoreA}
                onChange={(val) => handleRunsChange(val, setScoreA)}
                onWheelStep={(dir) =>
                  setScoreA((prev) => {
                    const n = parseInt(prev, 10);
                    const base = isNaN(n) ? 0 : n;
                    return dir === "up" ? (base + 1).toString() : Math.max(0, base - 1).toString();
                  })
                }
                onKeyDown={(e) =>
                  handleScoreKeyDown(
                    e,
                    () => setScoreA((prev) => (Math.max(0, parseInt(prev, 10) || 0) + 1).toString()),
                    () => setScoreA((prev) => Math.max(0, (parseInt(prev, 10) || 0) - 1).toString()),
                    () => save()
                  )
                }
                placeholder="Runs"
                className={inputClass}
                dataScoreInput
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] text-ivory-400">Wickets</label>
              <NonPassiveWheelInput
                type="number"
                min={0}
                max={10}
                value={wktsA}
                onChange={(val) => handleWktsChange(val, setWktsA)}
                onWheelStep={(dir) =>
                  setWktsA((prev) => {
                    const n = parseInt(prev, 10);
                    const base = isNaN(n) ? 0 : n;
                    return dir === "up" ? Math.min(10, base + 1).toString() : Math.max(0, base - 1).toString();
                  })
                }
                onKeyDown={(e) =>
                  handleScoreKeyDown(
                    e,
                    () => setWktsA((prev) => Math.min(10, (parseInt(prev, 10) || 0) + 1).toString()),
                    () => setWktsA((prev) => Math.max(0, (parseInt(prev, 10) || 0) - 1).toString()),
                    () => save()
                  )
                }
                placeholder="Wkts"
                className={inputClass}
                dataScoreInput
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] text-ivory-400">Overs</label>
              <NonPassiveWheelInput
                type="text"
                value={oversA}
                onChange={(val) => handleOversChange(val, setOversA)}
                onWheelStep={(dir) => setOversA((prev) => stepCricketOvers(prev, dir))}
                onKeyDown={(e) =>
                  handleScoreKeyDown(
                    e,
                    () => setOversA((prev) => stepCricketOvers(prev, "up")),
                    () => setOversA((prev) => stepCricketOvers(prev, "down")),
                    () => save()
                  )
                }
                placeholder="Ov"
                className={inputClass}
                dataScoreInput
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
              <label className="mb-1.5 block text-[10px] text-ivory-400">Runs</label>
              <NonPassiveWheelInput
                type="number"
                min={0}
                value={scoreB}
                onChange={(val) => handleRunsChange(val, setScoreB)}
                onWheelStep={(dir) =>
                  setScoreB((prev) => {
                    const n = parseInt(prev, 10);
                    const base = isNaN(n) ? 0 : n;
                    return dir === "up" ? (base + 1).toString() : Math.max(0, base - 1).toString();
                  })
                }
                onKeyDown={(e) =>
                  handleScoreKeyDown(
                    e,
                    () => setScoreB((prev) => (Math.max(0, parseInt(prev, 10) || 0) + 1).toString()),
                    () => setScoreB((prev) => Math.max(0, (parseInt(prev, 10) || 0) - 1).toString()),
                    () => save()
                  )
                }
                placeholder="Runs"
                className={inputClass}
                dataScoreInput
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] text-ivory-400">Wickets</label>
              <NonPassiveWheelInput
                type="number"
                min={0}
                max={10}
                value={wktsB}
                onChange={(val) => handleWktsChange(val, setWktsB)}
                onWheelStep={(dir) =>
                  setWktsB((prev) => {
                    const n = parseInt(prev, 10);
                    const base = isNaN(n) ? 0 : n;
                    return dir === "up" ? Math.min(10, base + 1).toString() : Math.max(0, base - 1).toString();
                  })
                }
                onKeyDown={(e) =>
                  handleScoreKeyDown(
                    e,
                    () => setWktsB((prev) => Math.min(10, (parseInt(prev, 10) || 0) + 1).toString()),
                    () => setWktsB((prev) => Math.max(0, (parseInt(prev, 10) || 0) - 1).toString()),
                    () => save()
                  )
                }
                placeholder="Wkts"
                className={inputClass}
                dataScoreInput
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] text-ivory-400">Overs</label>
              <NonPassiveWheelInput
                type="text"
                value={oversB}
                onChange={(val) => handleOversChange(val, setOversB)}
                onWheelStep={(dir) => setOversB((prev) => stepCricketOvers(prev, dir))}
                onKeyDown={(e) =>
                  handleScoreKeyDown(
                    e,
                    () => setOversB((prev) => stepCricketOvers(prev, "up")),
                    () => setOversB((prev) => stepCricketOvers(prev, "down")),
                    () => save()
                  )
                }
                placeholder="Ov"
                className={inputClass}
                dataScoreInput
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

function MatchTeamDetailsModal({
  match,
  teams,
  onClose,
}: {
  match: MatchRow;
  teams: AdminTeam[];
  onClose: () => void;
}) {
  const teamA = teams.find((t) => (match.team_a_id && t.id === match.team_a_id) || (match.team_a_name && t.team_name.toLowerCase() === match.team_a_name.toLowerCase()));
  const teamB = teams.find((t) => (match.team_b_id && t.id === match.team_b_id) || (match.team_b_name && t.team_name.toLowerCase() === match.team_b_name.toLowerCase()));

  const teamAPlayers = teamA?.players && teamA.players.length > 0
    ? [...teamA.players].sort((a, b) => (a.position || 0) - (b.position || 0))
    : [];

  const teamBPlayers = teamB?.players && teamB.players.length > 0
    ? [...teamB.players].sort((a, b) => (a.position || 0) - (b.position || 0))
    : [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/90 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-emerald-500/40 bg-[#070e1c] p-4 sm:p-5 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 rounded-full p-1.5 text-ivory-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-4 text-center">
          <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-bold text-emerald-400 font-mono-score tracking-wider uppercase">
            <Trophy size={12} />
            <span>{match.label || `${match.stage.toUpperCase()} MATCH`}</span>
          </div>
          <h3 className="font-display text-xl font-bold tracking-wide text-ivory-50 sm:text-2xl">
            Match Team Details
          </h3>
        </div>

        {/* Team Details Comparison Grid (2 Columns) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Team A Details Card */}
          <div className="rounded-xl border border-emerald-500/20 bg-white/[0.02] p-3.5">
            <div className="mb-2.5 flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-400">TEAM A</span>
                <h4 className="font-display text-base font-bold text-ivory-50">{teamA?.team_name ?? match.team_a_name ?? "Team A"}</h4>
              </div>
              {teamA?.batch && (
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono-score text-[10px] font-bold text-emerald-300">
                  {teamA.batch}
                </span>
              )}
            </div>

            {/* Captain Info */}
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-2 text-xs text-emerald-300 border border-emerald-500/20">
              <Crown size={14} className="text-emerald-400 shrink-0" />
              <div className="truncate">
                <span className="block text-[9px] uppercase font-mono text-ivory-400">TEAM CAPTAIN</span>
                <strong className="text-ivory-100 font-semibold text-xs">{teamA?.captain_name || "N/A"}</strong>
              </div>
            </div>

            {/* Squad List */}
            <div>
              <h5 className="mb-2 flex items-center gap-1.5 font-mono-score text-[11px] font-bold uppercase tracking-wider text-ivory-300">
                <Users size={12} className="text-emerald-400" />
                PLAYING SQUAD ({teamAPlayers.length})
              </h5>
              {teamAPlayers.length === 0 ? (
                <p className="text-[11px] text-ivory-500 italic">No registered squad players found.</p>
              ) : (
                <ul className="max-h-44 space-y-1.5 overflow-y-auto pr-1 text-xs">
                  {teamAPlayers.map((p, idx) => {
                    const isCaptain = teamA && p.full_name.trim().toLowerCase() === teamA.captain_name.trim().toLowerCase();
                    return (
                      <li
                        key={idx}
                        className="flex items-center gap-2 rounded-lg bg-white/[0.02] px-2.5 py-1.5 border border-white/5 text-ivory-100"
                      >
                        <User size={12} className="text-emerald-400 shrink-0" />
                        <span className="font-medium truncate">
                          {idx + 1}. {p.full_name}{" "}
                          {p.card ? <span className="text-[11px] font-normal text-orange-400">({p.card})</span> : null}{" "}
                          {isCaptain ? "(C)" : ""}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Team B Details Card */}
          <div className="rounded-xl border border-emerald-500/20 bg-white/[0.02] p-3.5">
            <div className="mb-2.5 flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-400">TEAM B</span>
                <h4 className="font-display text-base font-bold text-ivory-50">{teamB?.team_name ?? match.team_b_name ?? "Team B"}</h4>
              </div>
              {teamB?.batch && (
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono-score text-[10px] font-bold text-emerald-300">
                  {teamB.batch}
                </span>
              )}
            </div>

            {/* Captain Info */}
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-2 text-xs text-emerald-300 border border-emerald-500/20">
              <Crown size={14} className="text-emerald-400 shrink-0" />
              <div className="truncate">
                <span className="block text-[9px] uppercase font-mono text-ivory-400">TEAM CAPTAIN</span>
                <strong className="text-ivory-100 font-semibold text-xs">{teamB?.captain_name || "N/A"}</strong>
              </div>
            </div>

            {/* Squad List */}
            <div>
              <h5 className="mb-2 flex items-center gap-1.5 font-mono-score text-[11px] font-bold uppercase tracking-wider text-ivory-300">
                <Users size={12} className="text-emerald-400" />
                PLAYING SQUAD ({teamBPlayers.length})
              </h5>
              {teamBPlayers.length === 0 ? (
                <p className="text-[11px] text-ivory-500 italic">No registered squad players found.</p>
              ) : (
                <ul className="max-h-44 space-y-1.5 overflow-y-auto pr-1 text-xs">
                  {teamBPlayers.map((p, idx) => {
                    const isCaptain = teamB && p.full_name.trim().toLowerCase() === teamB.captain_name.trim().toLowerCase();
                    return (
                      <li
                        key={idx}
                        className="flex items-center gap-2 rounded-lg bg-white/[0.02] px-2.5 py-1.5 border border-white/5 text-ivory-100"
                      >
                        <User size={12} className="text-emerald-400 shrink-0" />
                        <span className="font-medium truncate">
                          {idx + 1}. {p.full_name}{" "}
                          {p.card ? <span className="text-[11px] font-normal text-orange-400">({p.card})</span> : null}{" "}
                          {isCaptain ? "(C)" : ""}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="mt-5 flex items-center justify-end border-t border-white/10 pt-3">
          <button
            onClick={onClose}
            className="rounded-full bg-emerald-500 hover:bg-emerald-400 px-6 py-2 text-xs font-bold text-navy-950 transition-transform hover:scale-105"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

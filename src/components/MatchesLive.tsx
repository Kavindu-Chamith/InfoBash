"use client";

import { useEffect, useState } from "react";
import Bracket, { type PlayoffMatch } from "@/components/Matches";
import GroupStandings, { type GroupData, type GroupMatch } from "@/components/GroupStandings";

interface MatchApiRow {
  id: string;
  stage: "group" | "semifinal" | "final" | "custom";
  label: string | null;
  status: "scheduled" | "live" | "completed";
  team_a_score: number | null;
  team_b_score: number | null;
  group_name: string | null;
  team_a_name: string | null;
  team_b_name: string | null;
  winner_name: string | null;
}

const POLL_MS = 15000;

export default function MatchesLive() {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [matches, setMatches] = useState<MatchApiRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [groupsRes, matchesRes] = await Promise.all([
          fetch("/api/groups"),
          fetch("/api/matches"),
        ]);
        const groupsJson = await groupsRes.json();
        const matchesJson = await matchesRes.json();
        if (cancelled) return;
        setGroups(groupsJson.groups ?? []);
        setMatches(matchesJson.matches ?? []);
        setLoaded(true);
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

  const groupMatches: GroupMatch[] = matches.filter((m) => m.stage === "group");
  const playoffMatches: PlayoffMatch[] = matches.filter(
    (m): m is MatchApiRow & { stage: "semifinal" | "final" } =>
      m.stage === "semifinal" || m.stage === "final"
  );
  const customMatches = matches.filter((m) => m.stage === "custom");
  const hasFixtures = matches.length > 0;

  return (
    <>
      <div className="mt-5 flex justify-center">
        {hasFixtures ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
            <span className="font-mono-score text-xs tracking-widest text-cyan-300">
              Live Updates · Refreshes automatically
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/20 bg-gold-400/5 px-4 py-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-gold-400" />
            <span className="font-mono-score text-xs tracking-widest text-gold-300">
              Fixtures Coming Soon
            </span>
          </div>
        )}
      </div>

      {loaded && groups.length > 0 && (
        <div className="relative z-10 py-12">
          <GroupStandings groups={groups} matches={groupMatches} />
        </div>
      )}

      {loaded && playoffMatches.length > 0 && (
        <div className="relative z-10 px-4 py-12 sm:px-8">
          <h2 className="mb-6 text-center font-display text-3xl tracking-wide text-ivory-50">
            Playoffs
          </h2>
          <Bracket matches={playoffMatches} />
        </div>
      )}

      {loaded && customMatches.length > 0 && (
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-8">
          <h2 className="mb-4 text-center font-display text-2xl tracking-wide text-ivory-50">
            Other Fixtures
          </h2>
          <div className="space-y-2">
            {customMatches.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-ivory-200"
              >
                <span>
                  {m.label ? `${m.label}: ` : ""}
                  {m.team_a_name ?? "TBD"} vs {m.team_b_name ?? "TBD"}
                </span>
                <span className="font-mono-score text-[10px] uppercase tracking-widest text-ivory-400">
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

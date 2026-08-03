"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

export interface GroupTeam {
  id: string;
  teamName: string;
  batch: string;
  wins: number;
  losses: number;
}

export interface GroupData {
  id: string;
  name: string;
  teams: GroupTeam[];
}

export interface GroupMatch {
  id: string;
  status: "scheduled" | "live" | "completed";
  team_a_name: string | null;
  team_b_name: string | null;
  team_a_score: number | null;
  team_b_score: number | null;
  group_name: string | null;
  label: string | null;
}

const statusStyles: Record<GroupMatch["status"], string> = {
  scheduled: "border-white/15 text-ivory-400",
  live: "border-gold-400/40 text-gold-300",
  completed: "border-cyan-400/30 text-cyan-300",
};

function StatusBadge({ status }: { status: GroupMatch["status"] }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono-score text-[9px] uppercase tracking-widest ${statusStyles[status]}`}>
      {status === "live" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400" />}
      {status}
    </span>
  );
}

export default function GroupStandings({
  groups,
  matches,
}: {
  groups: GroupData[];
  matches: GroupMatch[];
}) {
  if (groups.length === 0) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-8">
      <h2 className="mb-6 text-center font-display text-3xl tracking-wide text-ivory-50">
        Groups &amp; Standings
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {groups.map((g, i) => {
          const groupMatches = matches.filter((m) => m.group_name === g.name);
          const sortedTeams = [...g.teams].sort((a, b) => b.wins - a.wins || a.losses - b.losses);
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <h3 className="font-display text-xl tracking-wide text-gold-400">{g.name}</h3>

              <table className="mt-3 w-full text-left text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wide text-ivory-400">
                    <th className="pb-2 font-normal">Team</th>
                    <th className="pb-2 text-right font-normal">W</th>
                    <th className="pb-2 text-right font-normal">L</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTeams.map((t, idx) => (
                    <tr key={t.id} className="border-t border-white/5 text-ivory-100">
                      <td className="flex items-center gap-1.5 py-1.5">
                        {idx === 0 && t.wins > 0 && <Trophy size={12} className="text-gold-400" />}
                        {t.teamName}
                      </td>
                      <td className="py-1.5 text-right text-cyan-300">{t.wins}</td>
                      <td className="py-1.5 text-right text-ivory-400">{t.losses}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {groupMatches.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-white/5 pt-3">
                  {groupMatches.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-xs">
                      <span className="text-ivory-200">
                        {m.team_a_name ?? "TBD"}
                        {m.status === "completed" && m.team_a_score !== null ? ` (${m.team_a_score})` : ""}
                        {" vs "}
                        {m.team_b_name ?? "Bye"}
                        {m.status === "completed" && m.team_b_score !== null ? ` (${m.team_b_score})` : ""}
                      </span>
                      <StatusBadge status={m.status} />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

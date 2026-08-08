import type { Metadata } from "next";
import Link from "next/link";
import {
  Trophy,
  Users,
  Calendar,
  Clock,
  ExternalLink,
  ShieldAlert,
  Flame,
  Star,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Official Rules & Regulations — InfoBash V5.0",
  description:
    "Official tournament rules, registration guidelines, team compositions, match schedules, and over limits for InfoBash V5.0 — Faculty of Computing, SUSL.",
};

const matchSequence = [
  { num: "01", match: "1st Match of Group A", stage: "Group Stage" },
  { num: "02", match: "1st Match of Group B", stage: "Group Stage" },
  { num: "03", match: "1st Match of Group C", stage: "Group Stage" },
  { num: "04", match: "1st Match of Group D", stage: "Group Stage" },
  { num: "05", match: "2nd Match of Group A", stage: "Group Stage" },
  { num: "06", match: "2nd Match of Group B", stage: "Group Stage" },
  { num: "07", match: "2nd Match of Group C", stage: "Group Stage" },
  { num: "08", match: "2nd Match of Group D", stage: "Group Stage" },
  { num: "09", match: "3rd Match of Group A", stage: "Group Stage" },
  { num: "10", match: "3rd Match of Group B", stage: "Group Stage" },
  { num: "11", match: "3rd Match of Group C", stage: "Group Stage" },
  { num: "12", match: "3rd Match of Group D", stage: "Group Stage" },
  { num: "13", match: "Semi-Final 1 (Group A Winner vs Group C Winner)", stage: "Semi-Finals" },
  { num: "14", match: "Semi-Final 2 (Group B Winner vs Group D Winner)", stage: "Semi-Finals" },
  { num: "15", match: "Championship Final (Semi-Final 1 Winner vs Semi-Final 2 Winner)", stage: "Final" },
];

export default function RulesPage() {
  return (
    <main className="relative min-h-screen bg-[#060c1a] text-ivory-50 pb-20">
      {/* Background grid + glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,107,0,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,0,1) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-orange-500/8 blur-[180px]" />
        <div className="absolute -right-32 top-2/3 h-[400px] w-[400px] rounded-full bg-amber-500/8 blur-[160px]" />
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-gold-400/6 blur-[140px]" />
      </div>

      {/* Page Header */}
      <div className="relative z-10 border-b border-white/[0.06] px-6 pb-10 pt-20 sm:pt-24 text-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.45em] text-gold-400 font-bold">
          InfoBash V5.0 · Faculty of Computing · SUSL
        </span>

        <h1 className="mt-3 font-display text-5xl tracking-wide text-ivory-50 sm:text-6xl">
          Rules &amp; <span className="text-gradient-gold">Regulations</span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-ivory-400">
          Official guidelines for team registration, group stage allocations, match scheduling, player composition, and over rules for InfoBash V5.0.
        </p>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-12 space-y-12">

        {/* 5.1 Registration */}
        <section className="rounded-3xl border border-orange-500/25 bg-navy-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <span className="font-mono text-sm font-bold">5.1</span>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wide text-ivory-50 sm:text-3xl">
                Registration Guidelines
              </h2>
              <p className="text-xs text-ivory-400">Team eligibility and registration rules</p>
            </div>
          </div>

          <ul className="space-y-4 text-sm leading-relaxed text-ivory-200">
            <li className="flex gap-3">
              <CheckCircle2 size={18} className="text-orange-400 shrink-0 mt-0.5" />
              <span>
                Team registration must be completed through the{" "}
                <Link href="/register" className="text-orange-400 font-semibold underline underline-offset-4 hover:text-white transition-colors">
                  INFO BASH 5.0 Web Application
                </Link>{" "}
                within the registration period announced by the organizing committee.
              </span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 size={18} className="text-cyan-400 shrink-0 mt-0.5" />
              <span>Each team must register under a unique team name.</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 size={18} className="text-cyan-400 shrink-0 mt-0.5" />
              <span>A player is permitted to represent only one team throughout the tournament.</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 size={18} className="text-cyan-400 shrink-0 mt-0.5" />
              <span>
                If a registered player is unable to participate on the tournament day due to unavoidable circumstances, the team may nominate a replacement player who has not registered for any other team, subject to the prior approval of the organizing committee.
              </span>
            </li>
          </ul>
        </section>

        {/* 5.2 Matches & Tournament Format */}
        <section className="rounded-3xl border border-white/10 bg-navy-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 border border-blue-400/30 text-blue-300">
              <span className="font-mono text-sm font-bold">5.2</span>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wide text-ivory-50 sm:text-3xl">
                Tournament Format &amp; Group Stage
              </h2>
              <p className="text-xs text-ivory-400">12 Teams · 4 Groups · Points System</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-navy-950/70 p-4 text-center">
              <span className="font-mono text-xs uppercase tracking-widest text-ivory-400">Total Teams</span>
              <p className="mt-1 font-display text-3xl text-cyan-300 font-bold">12 Teams</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-navy-950/70 p-4 text-center">
              <span className="font-mono text-xs uppercase tracking-widest text-ivory-400">Group Division</span>
              <p className="mt-1 font-display text-3xl text-gold-400 font-bold">4 Groups (A,B,C,D)</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-navy-950/70 p-4 text-center">
              <span className="font-mono text-xs uppercase tracking-widest text-ivory-400">Per Group</span>
              <p className="mt-1 font-display text-3xl text-cyan-300 font-bold">3 Teams Each</p>
            </div>
          </div>

          <ul className="space-y-4 text-sm leading-relaxed text-ivory-200">
            <li className="flex gap-3">
              <CheckCircle2 size={18} className="text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Group allocation will be conducted using a random team generator or a transparent draw conducted by the organizing committee.
              </span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 size={18} className="text-cyan-400 shrink-0 mt-0.5" />
              <span>Each team shall play two (02) matches during the group stage of the tournament.</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 size={18} className="text-cyan-400 shrink-0 mt-0.5" />
              <span>A team shall be awarded <strong>two (02) points</strong> for each match won.</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 size={18} className="text-cyan-400 shrink-0 mt-0.5" />
              <span>The team obtaining the highest number of points in each group shall qualify for the Semi-Final stage.</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 size={18} className="text-cyan-400 shrink-0 mt-0.5" />
              <span>
                In the event that all teams within a group finish with an equal number of points, the <strong>Net Run Rate (NRR)</strong> shall be used to determine the group winner and advancing team.
              </span>
            </li>
          </ul>

          {/* Matches within groups & Knockout structure */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pt-4 border-t border-white/10">
            <div className="rounded-2xl border border-white/10 bg-navy-950/70 p-5 space-y-3">
              <h3 className="font-mono text-xs uppercase tracking-widest text-gold-400 font-bold flex items-center gap-2">
                <Trophy size={14} /> Group Match Structure (Groups A, B, C, D)
              </h3>
              <div className="space-y-2 text-xs text-ivory-200">
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-ivory-400">Match 1:</span>
                  <span className="font-semibold text-ivory-100">Team 1 vs Team 2</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-ivory-400">Match 2:</span>
                  <span className="font-semibold text-ivory-100">Team 1 vs Team 3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory-400">Match 3:</span>
                  <span className="font-semibold text-ivory-100">Team 2 vs Team 3</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-navy-950/70 p-5 space-y-3">
              <h3 className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-2">
                <Flame size={14} /> Knockout Stage Matches
              </h3>
              <div className="space-y-2 text-xs text-ivory-200">
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-ivory-400">Semi-Final 1:</span>
                  <span className="font-semibold text-cyan-300">Winner Group A vs Winner Group C</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-ivory-400">Semi-Final 2:</span>
                  <span className="font-semibold text-cyan-300">Winner Group B vs Winner Group D</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory-400">Final:</span>
                  <span className="font-semibold text-gold-400">Semi-Final 1 Winner vs Semi-Final 2 Winner</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5.2.1 Match Schedule Table */}
        <section className="rounded-3xl border border-white/10 bg-navy-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold-500/10 border border-gold-400/30 text-gold-400">
                <span className="font-mono text-sm font-bold">5.2.1</span>
              </div>
              <div>
                <h2 className="font-display text-2xl tracking-wide text-ivory-50 sm:text-3xl">
                  Official Match Schedule Sequence
                </h2>
                <p className="text-xs text-ivory-400">Sequential order of all 15 tournament matches</p>
              </div>
            </div>
            <Calendar className="text-gold-400 hidden sm:block" size={24} />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-navy-950/80">
            <table className="w-full text-left text-xs text-ivory-200">
              <thead className="border-b border-white/10 bg-white/5 font-mono uppercase tracking-wider text-ivory-400">
                <tr>
                  <th className="px-4 py-3">Match #</th>
                  <th className="px-4 py-3">Match Description</th>
                  <th className="px-4 py-3 text-right">Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {matchSequence.map((m) => (
                  <tr key={m.num} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2.5 font-mono font-bold text-cyan-300">Match {m.num}</td>
                    <td className="px-4 py-2.5 font-medium text-ivory-100">{m.match}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-[11px]">
                      <span className={`rounded-md px-2 py-0.5 font-semibold ${m.stage === "Final"
                        ? "bg-gold-500/20 text-gold-300 border border-gold-500/30"
                        : m.stage === "Semi-Finals"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          : "bg-white/5 text-ivory-400"
                        }`}>
                        {m.stage}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5.3 Teams Composition */}
        <section className="rounded-3xl border border-pink-500/20 bg-navy-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-pink-500/10 border border-pink-400/30 text-pink-300">
              <span className="font-mono text-sm font-bold">5.3</span>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wide text-ivory-50 sm:text-3xl">
                Team Composition &amp; Equipment
              </h2>
              <p className="text-xs text-ivory-400">10 Players per squad · 7 Male &amp; 3 Female Players</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-navy-950/70 p-4 text-center">
              <span className="font-mono text-xs uppercase tracking-widest text-ivory-400">Squad Size</span>
              <p className="mt-1 font-display text-3xl text-ivory-50 font-bold">10 Players</p>
            </div>
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-center">
              <span className="font-mono text-xs uppercase tracking-widest text-blue-300">Boys</span>
              <p className="mt-1 font-display text-3xl text-blue-400 font-bold">7 Players</p>
            </div>
            <div className="rounded-2xl border border-pink-500/30 bg-pink-500/10 p-4 text-center">
              <span className="font-mono text-xs uppercase tracking-widest text-pink-300">Girls</span>
              <p className="mt-1 font-display text-3xl text-pink-300 font-bold">3 Players</p>
            </div>
          </div>

          <ul className="space-y-3 text-sm leading-relaxed text-ivory-200 pt-2">
            <li className="flex gap-3">
              <CheckCircle2 size={18} className="text-cyan-400 shrink-0 mt-0.5" />
              <span>Each team shall consist of <strong>10 registered players</strong>.</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 size={18} className="text-cyan-400 shrink-0 mt-0.5" />
              <span>The exact team gender composition is <strong>7 Boys and 3 Girls</strong>.</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 size={18} className="text-cyan-400 shrink-0 mt-0.5" />
              <span>All teams shall use only the official cricket balls provided by the Organizing Committee during the tournament.</span>
            </li>
          </ul>
        </section>

        {/* 5.4 Overs & Special Rules */}
        <section className="rounded-3xl border border-gold-500/20 bg-navy-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold-500/10 border border-gold-400/30 text-gold-400">
              <span className="font-mono text-sm font-bold">5.4</span>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wide text-ivory-50 sm:text-3xl">
                Overs &amp; Special Female Player Rule
              </h2>
              <p className="text-xs text-ivory-400">Bowling limits, ball counts, and female player opening over rule</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-navy-950/70 p-5 space-y-2">
              <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-2">
                <Clock size={14} /> Group Stage Overs
              </span>
              <p className="font-display text-2xl text-ivory-50 font-bold">5 Overs · 4 Balls / Over</p>
              <p className="text-xs text-ivory-400">Each bowler may bowl a maximum of 1 over per match.</p>
            </div>

            <div className="rounded-2xl border border-gold-400/20 bg-navy-950/70 p-5 space-y-2">
              <span className="font-mono text-xs uppercase tracking-widest text-gold-400 font-bold flex items-center gap-2">
                <Trophy size={14} /> Semi-Finals &amp; Final Overs
              </span>
              <p className="font-display text-2xl text-ivory-50 font-bold">5 Overs · 6 Balls / Over</p>
              <p className="text-xs text-ivory-400">Standard 6-ball overs for playoff knockout matches.</p>
            </div>
          </div>

          {/* Highlighted Special Rule Box */}
          <div className="rounded-2xl border border-gold-400/30 bg-gradient-to-r from-gold-500/10 via-amber-500/10 to-gold-500/10 p-5 text-ivory-100 flex items-start gap-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold-400/20 border border-gold-400/40 text-gold-300 shrink-0">
              <Star size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="font-mono text-xs uppercase tracking-widest text-gold-300 font-bold">
                SPECIAL FEMALE PLAYER OPENING OVER RULE
              </h3>
              <p className="text-sm text-ivory-200 leading-relaxed">
                <strong>The first over of both batting and bowling in each match MUST be played by female team members.</strong>
              </p>
            </div>
          </div>

          <ul className="space-y-3 text-sm leading-relaxed text-ivory-200">
            <li className="flex gap-3">
              <CheckCircle2 size={18} className="text-cyan-400 shrink-0 mt-0.5" />
              <span>A player may bowl <strong>only one (01) over</strong> in any single match.</span>
            </li>
          </ul>
        </section>

      </div>
    </main>
  );
}
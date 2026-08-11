import type { Metadata } from "next";
import Link from "next/link";
import {
  Trophy,
  Clock,
  Flame,
  Star,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Official Rules & Regulations — InfoBash V5.0",
  description:
    "Official tournament rules, registration guidelines, team compositions, match schedules, and over limits for InfoBash V5.0 — Faculty of Computing, SUSL.",
};


export default function RulesPage() {
  return (
    <main className="relative min-h-screen bg-[#060c1a] text-ivory-50 pb-20">
      {/* Background grid + glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.06]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="rules-grid" width="44" height="44" patternUnits="userSpaceOnUse">
                <path d="M 44 0 L 0 0 0 44" fill="none" stroke="#dd830a" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#rules-grid)" />
          </svg>
        </div>
        <div className="absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-orange-500/8 blur-[180px]" />
        <div className="absolute -right-32 top-2/3 h-[400px] w-[400px] rounded-full bg-amber-500/8 blur-[160px]" />
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-gold-400/6 blur-[140px]" />
      </div>

      {/* Page Header */}
      <div className="relative z-10 border-b border-white/[0.06] px-4 sm:px-6 pb-8 sm:pb-10 pt-16 sm:pt-24 text-center">
        <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.3em] sm:tracking-[0.45em] text-gold-400 font-bold">
          InfoBash V5.0 · Faculty of Computing · SUSL
        </span>

        <h1 className="mt-3 font-display text-3xl sm:text-5xl lg:text-6xl tracking-wide text-ivory-50">
          Rules &amp; <span className="text-gradient-gold">Regulations</span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-sm leading-relaxed text-ivory-400 px-2">
          Official guidelines for team registration, group stage allocations, match scheduling, player composition, and over rules for InfoBash V5.0.
        </p>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 mx-auto max-w-5xl px-3 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12">

        {/* 5.1 Registration */}
        <section className="rounded-2xl sm:rounded-3xl border border-orange-500/25 bg-navy-900/60 p-4 sm:p-8 backdrop-blur-xl shadow-xl space-y-5 sm:space-y-6">
          <div className="flex items-start sm:items-center gap-3 border-b border-white/10 pb-4">
            <div className="grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <span className="font-mono text-xs sm:text-sm font-bold">5.1</span>
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-xl sm:text-2xl lg:text-3xl tracking-wide text-ivory-50">
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
        <section className="rounded-2xl sm:rounded-3xl border border-white/10 bg-navy-900/60 p-4 sm:p-8 backdrop-blur-xl shadow-xl space-y-5 sm:space-y-6">
          <div className="flex items-start sm:items-center gap-3 border-b border-white/10 pb-4">
            <div className="grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10 border border-blue-400/30 text-blue-300">
              <span className="font-mono text-xs sm:text-sm font-bold">5.2</span>
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-xl sm:text-2xl lg:text-3xl tracking-wide text-ivory-50">
                Tournament Format &amp; Group Stage
              </h2>
              <p className="text-xs text-ivory-400">12 Teams · 4 Groups · Points System</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-navy-950/70 p-3 sm:p-4 text-center">
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-ivory-400 leading-tight block">Total Teams</span>
              <p className="mt-1 font-display text-xl sm:text-3xl text-cyan-300 font-bold">12</p>
              <p className="text-[10px] sm:hidden text-ivory-400">Teams</p>
            </div>
            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-navy-950/70 p-3 sm:p-4 text-center">
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-ivory-400 leading-tight block">Groups</span>
              <p className="mt-1 font-display text-xl sm:text-3xl text-gold-400 font-bold">4</p>
              <p className="text-[10px] sm:hidden text-ivory-400">A, B, C, D</p>
            </div>
            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-navy-950/70 p-3 sm:p-4 text-center">
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-ivory-400 leading-tight block">Per Group</span>
              <p className="mt-1 font-display text-xl sm:text-3xl text-cyan-300 font-bold">3</p>
              <p className="text-[10px] sm:hidden text-ivory-400">Teams</p>
            </div>
          </div>

          {/* Desktop shows full text in stat cards */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-4 -mt-2">
            <div className="text-center">
              <p className="font-display text-lg text-cyan-300 font-bold hidden sm:block">Teams</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg text-gold-400 font-bold hidden sm:block">Groups (A, B, C, D)</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg text-cyan-300 font-bold hidden sm:block">Teams Each</p>
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
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 pt-4 border-t border-white/10">
            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-navy-950/70 p-4 sm:p-5 space-y-3">
              <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-gold-400 font-bold flex items-center gap-2">
                <Trophy size={14} /> Group Match Structure (A, B, C, D)
              </h3>
              <div className="space-y-2 text-xs text-ivory-200">
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-ivory-400 shrink-0">Match 1:</span>
                  <span className="font-semibold text-ivory-100 text-right ml-2">Team 1 vs Team 2</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-ivory-400 shrink-0">Match 2:</span>
                  <span className="font-semibold text-ivory-100 text-right ml-2">Team 1 vs Team 3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory-400 shrink-0">Match 3:</span>
                  <span className="font-semibold text-ivory-100 text-right ml-2">Team 2 vs Team 3</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-navy-950/70 p-4 sm:p-5 space-y-3">
              <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-2">
                <Flame size={14} /> Knockout Stage Matches
              </h3>
              <div className="space-y-2 text-xs text-ivory-200">
                <div className="flex justify-between border-b border-white/5 pb-1.5 gap-2">
                  <span className="text-ivory-400 shrink-0">Semi-Final 1:</span>
                  <span className="font-semibold text-cyan-300 text-right">Winner A vs Winner C</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5 gap-2">
                  <span className="text-ivory-400 shrink-0">Semi-Final 2:</span>
                  <span className="font-semibold text-cyan-300 text-right">Winner B vs Winner D</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-ivory-400 shrink-0">Final:</span>
                  <span className="font-semibold text-gold-400 text-right">SF1 Winner vs SF2 Winner</span>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* 5.3 Teams Composition */}
        <section className="rounded-2xl sm:rounded-3xl border border-pink-500/20 bg-navy-900/60 p-4 sm:p-8 backdrop-blur-xl shadow-xl space-y-5 sm:space-y-6">
          <div className="flex items-start sm:items-center gap-3 border-b border-white/10 pb-4">
            <div className="grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-xl bg-pink-500/10 border border-pink-400/30 text-pink-300">
              <span className="font-mono text-xs sm:text-sm font-bold">5.3</span>
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-xl sm:text-2xl lg:text-3xl tracking-wide text-ivory-50">
                Team Composition &amp; Equipment
              </h2>
              <p className="text-xs text-ivory-400">10 Players per squad · 7 Male &amp; 3 Female Players</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-navy-950/70 p-3 sm:p-4 text-center">
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-ivory-400 block leading-tight">Squad</span>
              <p className="mt-1 font-display text-xl sm:text-3xl text-ivory-50 font-bold">10</p>
              <p className="text-[10px] text-ivory-400">Players</p>
            </div>
            <div className="rounded-xl sm:rounded-2xl border border-blue-500/30 bg-blue-500/10 p-3 sm:p-4 text-center">
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-blue-300 block leading-tight">Boys</span>
              <p className="mt-1 font-display text-xl sm:text-3xl text-blue-400 font-bold">7</p>
              <p className="text-[10px] text-blue-300">Players</p>
            </div>
            <div className="rounded-xl sm:rounded-2xl border border-pink-500/30 bg-pink-500/10 p-3 sm:p-4 text-center">
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-pink-300 block leading-tight">Girls</span>
              <p className="mt-1 font-display text-xl sm:text-3xl text-pink-300 font-bold">3</p>
              <p className="text-[10px] text-pink-300">Players</p>
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
        <section className="rounded-2xl sm:rounded-3xl border border-gold-500/20 bg-navy-900/60 p-4 sm:p-8 backdrop-blur-xl shadow-xl space-y-5 sm:space-y-6">
          <div className="flex items-start sm:items-center gap-3 border-b border-white/10 pb-4">
            <div className="grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-xl bg-gold-500/10 border border-gold-400/30 text-gold-400">
              <span className="font-mono text-xs sm:text-sm font-bold">5.4</span>
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-xl sm:text-2xl lg:text-3xl tracking-wide text-ivory-50">
                Overs &amp; Special Female Player Rule
              </h2>
              <p className="text-xs text-ivory-400">Bowling limits, ball counts, and female player opening over rule</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-navy-950/70 p-4 sm:p-5 space-y-2">
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-2">
                <Clock size={14} /> Group Stage Overs
              </span>
              <p className="font-display text-xl sm:text-2xl text-ivory-50 font-bold">5 Overs · 4 Balls / Over</p>
              <p className="text-xs text-ivory-400">Each bowler may bowl a maximum of 1 over per match.</p>
            </div>

            <div className="rounded-xl sm:rounded-2xl border border-gold-400/20 bg-navy-950/70 p-4 sm:p-5 space-y-2">
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-gold-400 font-bold flex items-center gap-2">
                <Trophy size={14} /> Semi-Finals &amp; Final Overs
              </span>
              <p className="font-display text-xl sm:text-2xl text-ivory-50 font-bold">5 Overs · 6 Balls / Over</p>
              <p className="text-xs text-ivory-400">Standard 6-ball overs for playoff knockout matches.</p>
            </div>
          </div>

          {/* Highlighted Special Rule Box */}
          <div className="rounded-xl sm:rounded-2xl border border-gold-400/30 bg-amber-500/10 p-4 sm:p-5 text-ivory-100 flex items-start gap-3 sm:gap-4">
            <div className="grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-xl bg-gold-400/20 border border-gold-400/40 text-gold-300">
              <Star size={18} />
            </div>
            <div className="space-y-1 min-w-0">
              <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-gold-300 font-bold leading-tight">
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
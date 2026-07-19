import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Match Bracket — InfoBash V5.0",
  description:
    "Follow the single-elimination tournament bracket for InfoBash V5.0 — the Faculty of Computing, SUSL's inter-batch cricket championship.",
};

const ruleSections = [
  {
    number: "01",
    title: "Tournament Format",
    rules: [
      "InfoBash V5.0 follows a single-elimination knockout format across all batches.",
      "Each match consists of 6 overs per side (subject to change based on number of entries).",
      "A minimum of 8 players and a maximum of 12 (including substitutes) may be registered per team.",
      "Every team need to have at least 2 female players.",
      "In case of a tie, a Super Over will be used to determine the winner.",
    ],
  },
  {
    number: "02",
    title: "Player Eligibility",
    rules: [
      "Only currently enrolled students of the Faculty of Computing, SUSL are eligible to play.",
      "A player may represent only one batch/team throughout the tournament.",
      "Any player found guilty of misrepresentation will result in the team's immediate disqualification.",
    ],
  },
  {
    number: "03",
    title: "Match Conduct",
    rules: [
      "Teams must report to the ground at least 15 minutes before the scheduled start time.",
      "A walkover will be awarded if a team fails to field a minimum of 8 players within 10 minutes of the scheduled time.",
    ],
  },
  {
    number: "04",
    title: "Scoring & Points",
    rules: [
      "Win: 2 points · Tie/No Result: 1 point each · Loss: 0 points.",
      "Net Run Rate (NRR) will be used as the first tiebreaker in group-stage standings.",
      "Head-to-head result will be used as the second tiebreaker if NRR is equal.",
      "The official scorer's decision on runs and dismissals is final.",
    ],
  },
  {
    number: "05",
    title: "Code of Conduct",
    rules: [
      "Any form of dissent towards umpiring decisions will result in a formal warning or penalty runs.",
      "Abusive language, unsportsmanlike behavior, or physical altercations will lead to immediate disqualification.",
      "Team captains are responsible for the conduct of their players and supporters on the ground.",
      "Decisions made by the on-field umpires and match referee are final and binding.",
    ],
  },
];

export default function RulesPage() {
  return (
    <main className="relative min-h-screen bg-[#060c1a]">
      {/* ── Background grid + glow ─────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(53,215,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(53,215,255,1) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/8 blur-[180px]" />
        <div className="absolute -right-32 top-2/3 h-[400px] w-[400px] rounded-full bg-blue-500/8 blur-[160px]" />
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-gold-400/6 blur-[140px]" />
      </div>

      {/* ── Page header ────────────────────────────────────────── */}
      <div className="relative z-10 border-b border-white/[0.06] px-6 pb-10 pt-14 text-center">
        <span className="font-mono-score text-[11px] uppercase tracking-[0.45em] text-gold-400">
          InfoBash V5.0 · Faculty of Computing · SUSL
        </span>

        <h1 className="mt-3 font-display text-5xl tracking-wide text-ivory-50 sm:text-6xl">
          Rule <span className="text-gradient-cyan">Book</span>
        </h1>

        {/* Status badge */}
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
          <span className="font-mono-score text-xs tracking-widest text-cyan-300">
            Rulebook Under Review
          </span>
        </div>
      </div>

      {/* ── Rule sections ──────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16">
        <div className="space-y-6">
          {ruleSections.map((section) => (
            <div
              key={section.number}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:border-cyan-400/20 sm:p-8"
            >
              <div className="flex items-baseline gap-4">
                <span className="font-mono-score text-sm tracking-widest text-cyan-400/50">
                  {section.number}
                </span>
                <h2 className="font-display text-2xl tracking-wide text-ivory-50 sm:text-3xl">
                  {section.title}
                </h2>
              </div>

              <ul className="mt-5 space-y-3 border-t border-white/[0.06] pt-5">
                {section.rules.map((rule, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm leading-relaxed text-ivory-50/70 sm:text-base"
                  >
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400/60 " />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Footnote ──────────────────────────────────────────── */}
        <p className="mt-10 text-center font-mono-score text-xs tracking-wider text-ivory-50/40">
          The organizing committee reserves the right to amend these rules at
          any time. Final rulebook will be shared before the opening match.
        </p>
      </div>
    </main>
  );
}
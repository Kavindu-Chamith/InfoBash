import type { Metadata } from "next";
import Bracket from "@/components/Matches";

export const metadata: Metadata = {
  title: "Match Bracket — InfoBash V5.0",
  description:
    "Follow the single-elimination tournament bracket for InfoBash V5.0 — the Faculty of Computing, SUSL's inter-batch cricket championship.",
};

export default function MatchesPage() {
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
          Match{" "}
          <span className="text-gradient-cyan">Bracket</span>
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ivory-400">
          Single-elimination knockout draw. Fixtures will be updated once the
          official schedule is announced.
        </p>

        {/* Status badge */}
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold-400/20 bg-gold-400/5 px-4 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-gold-400" />
          <span className="font-mono-score text-xs tracking-widest text-gold-300">
            Fixtures Coming Soon
          </span>
        </div>
      </div>

      {/* ── Bracket ─────────────────────────────────────────────── */}
      <div className="relative z-10 px-4 py-12 sm:px-8">
        <Bracket />
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import RegistrationForm from "@/components/RegistrationForm";

export const metadata: Metadata = {
  title: "Register Your Team — InfoBash V5.0",
  description:
    "Register your batch cricket team for InfoBash V5.0 — the Faculty of Computing, SUSL's flagship inter-batch cricket tournament.",
};

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060c1a]">
      {/* ── Ambient background ── */}
      <div className="pointer-events-none absolute inset-0">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(53,215,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(53,215,255,1) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-400/10 blur-[140px]" />
      </div>

      {/* ── Page header ── */}
      <div className="relative z-10 border-b border-cyan-400/10 px-6 py-14 text-center">
        <span className="font-mono-score text-[11px] uppercase tracking-[0.45em] text-gold-400">
          InfoBash V5.0 · Faculty of Computing · SUSL
        </span>
        <h1 className="mt-3 font-display text-5xl tracking-wide text-ivory-50 sm:text-6xl">
          Register Your{" "}
          <span className="text-gradient-cyan">Team</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ivory-400">
          Fill in your team details and squad roster below. Make sure you have
          at least 2 female players in your squad before submitting.
        </p>
      </div>

      {/* ── Form ── */}
      <div className="relative z-10 px-4 py-16 sm:px-6">
        <RegistrationForm />
      </div>
    </main>
  );
}

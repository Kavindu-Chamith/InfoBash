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
      {/* -- Ambient background -- */}
      <div className="pointer-events-none absolute inset-0">
        {/* Grid with solid SVG lines */}
        <div className="absolute inset-0 opacity-[0.06]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="register-grid" width="44" height="44" patternUnits="userSpaceOnUse">
                <path d="M 44 0 L 0 0 0 44" fill="none" stroke="#dd830a" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#register-grid)" />
          </svg>
        </div>
        {/* Glow orbs */}
        <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-[#FF6B00]/15 blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-[140px]" />
      </div>

      {/* -- Page header -- */}
      <div className="relative z-10 border-b border-orange-500/15 px-6 pb-12 pt-20 sm:pt-24 text-center">
        <span className="font-mono-score text-[11px] uppercase tracking-[0.45em] text-gold-400">
          InfoBash V5.0 · Faculty of Computing · SUSL
        </span>
        <h1 className="mt-3 font-display text-5xl tracking-wide text-ivory-50 sm:text-6xl">
          Register Your{" "}
          <span className="text-gradient-gold">Team</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ivory-400">
          Fill in your team details and squad roster below. Make sure you have
          at least 2 female players in your squad before submitting.
        </p>
      </div>

      {/* -- Form -- */}
      <div className="relative z-10 px-4 py-16 sm:px-6">
        <RegistrationForm />
      </div>
    </main>
  );
}

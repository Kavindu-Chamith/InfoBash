"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [state, setState] = useState<{ status: "idle" | "submitting"; error?: string }>({
    status: "idle",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ status: "submitting" });
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setState({ status: "idle", error: json.error ?? "Incorrect password" });
        return;
      }
      router.push("/admin");
    } catch {
      setState({ status: "idle", error: "Couldn't reach the server. Try again." });
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060c1a] px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-[#FF6B00]/15 blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-[140px]" />
      </div>

      <form
        onSubmit={submit}
        className="glass-card glow-border relative z-10 w-full max-w-sm rounded-3xl p-8 sm:p-10"
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#FF6B00] text-white shadow-[0_0_20px_rgba(255,107,0,0.5)]">
          <ShieldCheck size={24} />
        </div>
        <h1 className="mt-5 text-center font-display text-3xl tracking-wide text-ivory-50">
          Organiser Sign In
        </h1>
        <p className="mt-2 text-center text-sm text-ivory-400">
          Manage teams, groups, and match fixtures for InfoBash V5.0.
        </p>

        <div className="mt-6">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ivory-300" htmlFor="password">
            Admin Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-navy-900/70 px-4 py-3 text-sm text-ivory-50 outline-none transition-colors focus:border-orange-500/80"
            placeholder="••••••••"
          />
        </div>

        {state.error && (
          <p className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            <ShieldAlert size={14} /> {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={state.status === "submitting"}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#FF6B00] px-6 py-3 text-sm font-bold text-white shadow-[0_0_20px_-6px_rgba(255,107,0,0.8)] transition-transform hover:scale-105 disabled:opacity-70"
        >
          {state.status === "submitting" ? <Loader2 size={16} className="animate-spin" /> : "Sign In"}
        </button>
      </form>
    </main>
  );
}

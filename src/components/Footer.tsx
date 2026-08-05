import Link from "next/link";
import Image from "next/image";
import { Trophy, Shield, ChevronRight } from "lucide-react";

export default function Footer() {
  const links = [
    { href: "/", label: "Home" },
    { href: "/register", label: "Register Team" },
    { href: "/teams", label: "Teams & Squads" },
    { href: "/matches", label: "Match Center" },
    { href: "/rules", label: "Rules & Guidelines" },
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <footer className="relative border-t border-cyan-400/15 bg-[#050b18] overflow-hidden text-ivory-300">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="pitch-lines absolute inset-0 opacity-25" />
        <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute -right-20 top-0 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-12 sm:px-8">
        {/* Main Content Layout */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          {/* Brand Info */}
          <div className="max-w-xl">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-cyan-500/10 border border-cyan-400/30 p-1.5 transition-all group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(53,215,255,0.3)]">
                <Image
                  src="/images/logo.png"
                  alt="InfoBash v5.0 logo"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <span className="font-display text-2xl tracking-wide text-ivory-50">
                  INFO<span className="text-gradient-cyan">BASH</span>{" "}
                  <span className="font-mono text-xs text-gold-400 font-bold ml-1">V5.0</span>
                </span>
                <p className="text-[11px] font-mono tracking-wider text-ivory-400 uppercase">
                  Faculty of Computing · SUSL
                </p>
              </div>
            </Link>

            <p className="mt-4 text-sm leading-relaxed text-ivory-400">
              The premier annual inter-batch cricket championship of the Faculty of Computing, Sabaragamuwa University of Sri Lanka — bringing batches together in high-octane sportsmanship.
            </p>
          </div>

          {/* Quick Links Navigation Pills */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-400 font-bold">
              Quick Navigation
            </span>
            <nav className="flex flex-wrap gap-2.5 sm:gap-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center gap-1.5 rounded-xl border border-white/10 bg-navy-900/60 px-4 py-2 text-xs text-ivory-200 transition-all hover:border-cyan-400/50 hover:bg-navy-800 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(53,215,255,0.15)]"
                >
                  <span>{link.label}</span>
                  <ChevronRight size={12} className="text-ivory-400 transition-transform group-hover:translate-x-0.5 group-hover:text-cyan-300" />
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Divider with Central Tournament Badge */}
        <div className="relative my-8 flex items-center justify-center">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute flex items-center gap-2 rounded-full border border-white/10 bg-[#070e1c] px-4 py-1.5 text-[11px] font-mono text-ivory-400 shadow-xl backdrop-blur-md">
            <Trophy size={13} className="text-gold-400" />
            <span>INTER-BATCH CRICKET CHAMPIONSHIP</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-3 text-center text-xs text-ivory-400 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} InfoBash V5.0. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-ivory-400">
            <Shield size={13} className="text-cyan-400" />
            <span>Faculty of Computing, Sabaragamuwa University of Sri Lanka</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

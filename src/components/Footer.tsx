import Link from "next/link";
import Image from "next/image";
import { MapPin, Trophy, ShieldCheck, ArrowUpRight, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-cyan-400/15 bg-[#050b18] text-ivory-300 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0">
        <div className="pitch-lines absolute inset-0 opacity-20" />
        <div className="absolute left-1/4 -top-24 h-72 w-72 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute right-1/4 -bottom-24 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pt-14 pb-8 sm:px-8">
        {/* Balanced 4-Column Grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Column 1: Brand & Overview */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <Image
                src="/images/logo.png"
                alt="InfoBash v5.0 logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain transition-transform group-hover:scale-105"
              />
              <div>
                <span className="font-display text-xl tracking-wide text-ivory-50">
                  INFO<span className="text-gradient-cyan">BASH</span>
                </span>
                <span className="ml-2 font-mono text-[10px] font-bold text-gold-400">V5.0</span>
              </div>
            </Link>
            
            <p className="text-xs leading-relaxed text-ivory-400">
              The premier annual inter-batch cricket championship of the Faculty of Computing, Sabaragamuwa University of Sri Lanka.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-[11px] font-mono text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Season 2026 Active</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-display text-sm uppercase tracking-wider text-ivory-100 flex items-center gap-1.5">
              <Sparkles size={14} className="text-cyan-400" />
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2 text-xs text-ivory-300">
              <li>
                <Link href="/register" className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors">
                  <span className="text-cyan-400">›</span> Register Your Team
                </Link>
              </li>
              <li>
                <Link href="/teams" className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors">
                  <span className="text-cyan-400">›</span> Teams &amp; Squads
                </Link>
              </li>
              <li>
                <Link href="/matches" className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors">
                  <span className="text-cyan-400">›</span> Match Schedule &amp; Scores
                </Link>
              </li>
              <li>
                <Link href="/rules" className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors">
                  <span className="text-cyan-400">›</span> Tournament Rules
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Faculty & Info */}
          <div>
            <h3 className="font-display text-sm uppercase tracking-wider text-ivory-100 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-cyan-400" />
              Faculty &amp; Links
            </h3>
            <ul className="mt-4 space-y-2 text-xs text-ivory-300">
              <li>
                <Link href="/contact" className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors">
                  <span className="text-cyan-400">›</span> Contact Organizers
                </Link>
              </li>
              <li>
                <a
                  href="https://www.sab.ac.lk/computing/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                >
                  <span className="text-cyan-400">›</span> Faculty of Computing <ArrowUpRight size={11} />
                </a>
              </li>
              <li>
                <a
                  href="https://www.sab.ac.lk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                >
                  <span className="text-cyan-400">›</span> SUSL Main Portal <ArrowUpRight size={11} />
                </a>
              </li>
              <li>
                <Link href="/admin" className="inline-flex items-center gap-1.5 text-ivory-400 hover:text-gold-400 transition-colors">
                  <span className="text-gold-400">›</span> Organizer Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Tournament Highlights Card */}
          <div className="rounded-2xl border border-white/10 bg-navy-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-gold-400 font-bold">
                CHAMPIONSHIP VENUE
              </span>
              <Trophy size={14} className="text-gold-400" />
            </div>

            <div className="space-y-2 text-xs text-ivory-300">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                <span>University Main Grounds, SUSL, Belihuloya</span>
              </div>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-ivory-400 border-t border-white/5">
                <span>Inter-Batch Knockout &amp; Group Format</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-ivory-400 sm:flex-row">
          <p>© {new Date().getFullYear()} InfoBash V5.0 — Faculty of Computing, Sabaragamuwa University of Sri Lanka.</p>
          <p className="font-mono text-[11px]">InfoBash V5.0 · All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
}

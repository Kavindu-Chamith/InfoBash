import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative border-t border-cyan-400/10 bg-navy-900">
      <div className="pitch-lines absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-6 py-14 sm:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="InfoBash v5.0 logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
              <span className="font-display text-xl text-ivory-50">
                INFO<span className="text-gradient-cyan">BASH</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ivory-400 max-w-md">
              The Faculty of Computing&apos;s annual one-day cricket tournament —
              batches battling it out for the trophy since v1.0.
            </p>
          </div>

          <div>
            <h3 className="font-display text-lg tracking-wide text-ivory-50">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-ivory-400">
              <li><Link href="/register" className="transition-colors hover:text-cyan-300">Register Your Team</Link></li>
              <li><Link href="/teams" className="transition-colors hover:text-cyan-300">Teams &amp; Squads</Link></li>
              <li><Link href="/matches" className="transition-colors hover:text-cyan-300">Match Schedule</Link></li>
              <li><Link href="/rules" className="transition-colors hover:text-cyan-300">Rules &amp; Guidelines</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-cyan-300">Contact Organizers</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-xs text-ivory-400 sm:flex-row">
          <p>© {new Date().getFullYear()} InfoBash — Faculty of Computing, Sabaragamuwa University of Sri Lanka.</p>
          <p>Built by the Faculty of Computing for InfoBash v5.0</p>
        </div>
      </div>
    </footer>
  );
}

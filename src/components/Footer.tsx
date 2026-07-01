import Link from "next/link";
import Image from "next/image";
import { AtSign, Send, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-cyan-400/10 bg-navy-900">
      <div className="pitch-lines absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-6 py-14 sm:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
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
            <p className="mt-4 text-sm leading-relaxed text-ivory-400">
              The Faculty of Computing&apos;s annual one-day cricket tournament —
              batches battling it out for the trophy since v1.0.
            </p>
          </div>

          <div>
            <h3 className="font-display text-lg tracking-wide text-ivory-50">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-ivory-400">
              <li><Link href="/register" className="hover:text-cyan-300">Register Your Team</Link></li>
              <li><Link href="/rules" className="hover:text-cyan-300">Rules &amp; Guidelines</Link></li>
              <li><Link href="/schedule" className="hover:text-cyan-300">Match Schedule</Link></li>
              <li><Link href="/gallery" className="hover:text-cyan-300">Gallery</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg tracking-wide text-ivory-50">
              Tournament
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-ivory-400">
              <li><Link href="/sponsors" className="hover:text-cyan-300">Sponsors</Link></li>
              <li><Link href="/contact" className="hover:text-cyan-300">Contact Organizers</Link></li>
              <li><Link href="/admin" className="hover:text-cyan-300">Organizer Login</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg tracking-wide text-ivory-50">
              Get In Touch
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-ivory-400">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-cyan-400" /> infobash@focsab.lk
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-cyan-400" /> +94 71 234 5678
              </li>
            </ul>
            <div className="mt-4 flex gap-3">
              <a
                href="#"
                aria-label="InfoBash on Facebook"
                className="grid h-9 w-9 place-items-center rounded-full border border-cyan-400/20 text-ivory-200 transition-colors hover:border-cyan-400 hover:text-cyan-300"
              >
                <Send size={16} />
              </a>
              <a
                href="#"
                aria-label="InfoBash on Instagram"
                className="grid h-9 w-9 place-items-center rounded-full border border-cyan-400/20 text-ivory-200 transition-colors hover:border-cyan-400 hover:text-cyan-300"
              >
                <AtSign size={16} />
              </a>
            </div>
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

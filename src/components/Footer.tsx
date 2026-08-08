import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-navy-950 border-t border-white/5">
      {/* Upper Section: Logo & Brand */}
      <div className="mx-auto max-w-7xl px-6 py-6 text-center">
        {/* Logo & Brand Title */}
        <Link href="/" className="inline-flex items-center justify-center gap-3 group">
          <Image
            src="/images/logo.png"
            alt="InfoBash v5.0 logo"
            width={36}
            height={36}
            className="h-9 w-9 object-contain transition-transform group-hover:scale-105"
          />
          <span className="font-display text-2xl tracking-wider text-ivory-50">
            INFO<span className="text-gradient-cyan">BASH</span>{" "}
            <span className="font-mono text-xs text-gold-400 font-bold ml-1">V5.0</span>
          </span>
        </Link>
      </div>

      {/* Lower Section: Site Theme Color Accent Bar (Orange/Gold/Navy Gradient) */}
      <div className="relative border-t border-orange-500/20 bg-navy-950 px-6 py-6 text-center shadow-lg">
        {/* Orange Glow Line on top of accent bar */}
        <div className="pointer-events-none absolute top-0 left-1/2 h-[1px] w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#FF6B00] to-transparent" />

        <div className="mx-auto max-w-7xl space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-orange-400 sm:text-sm">
            FACULTY OF COMPUTING · ANNUAL CRICKET CHAMPIONSHIP
          </p>
          <p className="text-[11px] uppercase tracking-wider text-ivory-400 sm:text-xs">
            © {new Date().getFullYear()} INFOBASH V5.0 · FACULTY OF COMPUTING, SUSL · ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </footer>
  );
}

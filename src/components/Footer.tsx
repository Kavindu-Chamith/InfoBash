import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const navLinks = [
    { href: "/", label: "HOME" },
    { href: "/teams", label: "TEAMS" },
    { href: "/matches", label: "MATCHES" },
    { href: "/rules", label: "RULES" },
    { href: "/register", label: "REGISTER" },
    { href: "/contact", label: "CONTACT" },
  ];

  return (
    <footer className="w-full bg-[#050914] border-t border-white/5">
      {/* Upper Section: Minimal Centered Navigation */}
      <div className="mx-auto max-w-7xl px-6 py-10 text-center">
        {/* Logo & Brand Title */}
        <Link href="/" className="inline-flex items-center justify-center gap-3 mb-6 group">
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

        {/* Centered Horizontal Navigation Links */}
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-medium tracking-wider text-ivory-300 sm:gap-x-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-cyan-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Lower Section: Site Theme Color Accent Bar (Cyan/Navy Gradient) */}
      <div className="relative border-t border-cyan-400/20 bg-gradient-to-r from-[#0a142c] via-[#0f214a] to-[#0a142c] px-6 py-6 text-center shadow-lg">
        {/* Cyan Glow Line on top of accent bar */}
        <div className="pointer-events-none absolute top-0 left-1/2 h-[1px] w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

        <div className="mx-auto max-w-7xl space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-cyan-300 sm:text-sm">
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

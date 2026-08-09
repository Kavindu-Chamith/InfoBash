"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShieldCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/teams", label: "Teams" },
  { href: "/matches", label: "Matches" },
  { href: "/rules", label: "Rules" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close mobile menu on route change
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-navy-950/85 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="InfoBash v5.0 logo"
            width={44}
            height={44}
            className="h-10 w-10 object-contain sm:h-11 sm:w-11 drop-shadow-[0_0_12px_rgba(255,107,0,0.4)]"
            priority
          />
          <span className="font-display text-2xl tracking-wide text-ivory-50 sm:text-[26px]">
            INFO<span className="text-gradient-cyan font-bold">BASH</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-colors ${active ? "text-orange-400" : "text-ivory-200 hover:text-white"
                    }`}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      initial={{ opacity: 0, scaleX: 0.85 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-orange-500 to-amber-400 shadow-[0_0_8px_#FF6B00]"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/admin/login"
            title="Organiser Dashboard"
            className="text-ivory-400 transition-colors hover:text-orange-400"
          >
            <ShieldCheck size={18} />
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_20px_-3px_rgba(255,107,0,0.6)] transition-transform hover:scale-105"
          >
            Register Now
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-ivory-50 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden bg-navy-950/95 backdrop-blur-md lg:hidden"
          >
            <ul className="flex flex-col gap-1 px-5 py-4">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block rounded-lg px-3 py-3 text-base font-medium ${pathname === link.href
                        ? "bg-navy-800 text-orange-400 font-bold"
                        : "text-ivory-200"
                      }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href="/register"
                  className="block rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-center text-sm font-bold text-white shadow-[0_0_20px_-3px_rgba(255,107,0,0.6)]"
                >
                  Register Now
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="flex items-center justify-center gap-1.5 py-3 text-xs text-ivory-500"
                >
                  <ShieldCheck size={13} /> Organiser Dashboard
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

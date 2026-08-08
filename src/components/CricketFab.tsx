"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function CricketFab() {
  const pathname = usePathname();
  if (pathname === "/register") return null;

  return (
    <Link
      href="/register"
      aria-label="Register your team"
      className="group fixed bottom-6 right-6 z-40"
    >
      {/* pulse ring */}
      <motion.span
        className="absolute inset-0 rounded-full bg-[#FF6B00]/40"
        animate={{ scale: [1, 1.6, 1.6], opacity: [0.6, 0, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
      />
      {/* button */}
      <motion.span
        className="relative block h-16 w-16 overflow-hidden rounded-full border-2 border-orange-500/80 bg-white shadow-[0_0_28px_-4px_rgba(255,107,0,0.85)] transition-transform group-hover:scale-110"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/cricket.jpg"
          alt=""
          fill
          sizes="64px"
          className="object-contain p-1.5"
        />
      </motion.span>
    </Link>
  );
}

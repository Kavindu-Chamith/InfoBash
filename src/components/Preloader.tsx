"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MIN_DISPLAY_MS = 1100;

export default function Preloader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const start = Date.now();
    const finish = () => {
      const remaining = Math.max(MIN_DISPLAY_MS - (Date.now() - start), 0);
      window.setTimeout(() => setVisible(false), remaining);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish);
      return () => window.removeEventListener("load", finish);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = visible ? "hidden" : "";
    document.body.style.overflow = visible ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-navy-950"
        >
          {/* Pitch grid with solid SVG lines */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
              <defs>
                <pattern id="preloader-grid" width="44" height="44" patternUnits="userSpaceOnUse">
                  <path d="M 44 0 L 0 0 0 44" fill="none" stroke="#dd830a" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#preloader-grid)" />
            </svg>
          </div>

          {/* Ambient glow */}
          <div className="pointer-events-none absolute h-[420px] w-[420px] rounded-full bg-[#dd830a]/15 blur-[130px]" />

          {/* Logo + spinning rings */}
          <div className="relative z-10 flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36">
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-orange-500/80 border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            />
            <motion.span
              className="absolute inset-2 rounded-full border-2 border-amber-400/70 border-b-transparent"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="relative flex h-20 w-20 items-center justify-center rounded-full bg-navy-900/60 shadow-[0_0_40px_-6px_rgba(255,107,0,0.6)] sm:h-24 sm:w-24"
            >
              <Image
                src="/images/logo.webp"
                alt="InfoBash logo"
                width={72}
                height={72}
                priority
                className="h-16 w-16 object-contain sm:h-[72px] sm:w-[72px]"
              />
            </motion.div>
          </div>

          {/* Wordmark */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative z-10 mt-6 flex flex-col items-center gap-3"
          >
            <span className="font-display text-3xl tracking-wide text-ivory-50 sm:text-4xl">
              INFO<span className="text-gradient-gold">BASH</span>
            </span>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-orange-500"
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    delay: i * 0.18,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

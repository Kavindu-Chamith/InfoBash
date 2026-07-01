"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOURNAMENT_DATE } from "@/lib/config";

function getTimeLeft() {
  const diff = Math.max(0, TOURNAMENT_DATE.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Digit({ value }: { value: string }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-top">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Unit({ value, label }: { value: number; label: string }) {
  const str = value.toString().padStart(2, "0");
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="glass-card glow-border flex rounded-2xl px-3 py-3 font-mono-score text-3xl font-bold text-cyan-300 sm:px-5 sm:py-4 sm:text-5xl">
        {str.split("").map((d, i) => (
          <Digit key={i} value={d} />
        ))}
      </div>
      <span className="text-[10px] uppercase tracking-[0.3em] text-ivory-400 sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export default function Countdown() {
  const [time, setTime] = useState<ReturnType<typeof getTimeLeft> | null>(
    null
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial client-only sync, avoids SSR/CSR mismatch
    setTime(getTimeLeft());
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) {
    // Avoid hydration mismatch — render nothing until mounted on the client.
    return <div className="h-[92px] sm:h-[124px]" aria-hidden="true" />;
  }

  return (
    <div className="flex items-start justify-center gap-3 sm:gap-6">
      <Unit value={time.days} label="Days" />
      <Unit value={time.hours} label="Hours" />
      <Unit value={time.minutes} label="Mins" />
      <Unit value={time.seconds} label="Secs" />
    </div>
  );
}

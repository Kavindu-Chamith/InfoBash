import { TICKER_ITEMS } from "@/lib/config";

export default function ScoreTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="relative overflow-hidden border-y border-cyan-400/15 bg-navy-900/80 py-2.5">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {items.map((item, i) => (
          <span
            key={i}
            className="font-mono-score text-xs tracking-[0.2em] text-cyan-300/90 sm:text-sm"
          >
            {item} <span className="mx-4 text-gold-400">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

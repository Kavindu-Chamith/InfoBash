import { TICKER_ITEMS } from "@/lib/config";

export default function ScoreTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="relative overflow-hidden border-y border-orange-500/20 bg-navy-900/90 py-2.5">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {items.map((item, i) => (
          <span
            key={i}
            className="font-mono-score text-xs tracking-[0.2em] text-orange-400 sm:text-sm font-medium"
          >
            {item} <span className="mx-4 text-gold-400 font-bold">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

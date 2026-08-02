import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-navy-950">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(53,215,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(53,215,255,1) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="pointer-events-none absolute h-[420px] w-[420px] rounded-full bg-blue-600/15 blur-[130px]" />

      <div className="relative z-10 flex h-32 w-32 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-cyan-400/70 border-t-transparent [animation-duration:1.4s]" />
        <span className="absolute inset-2 animate-spin rounded-full border-2 border-gold-400/50 border-b-transparent [animation-direction:reverse] [animation-duration:2s]" />
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-navy-900/60 shadow-[0_0_40px_-6px_rgba(53,215,255,0.6)] animate-pulse-glow">
          <Image
            src="/images/logo.png"
            alt="InfoBash logo"
            width={72}
            height={72}
            priority
            className="h-16 w-16 object-contain"
          />
        </div>
      </div>

      <span className="relative z-10 mt-6 font-display text-3xl tracking-wide text-ivory-50">
        INFO<span className="text-gradient-cyan">BASH</span>
      </span>
    </div>
  );
}

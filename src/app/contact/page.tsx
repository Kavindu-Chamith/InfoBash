import type { Metadata } from "next";
import { Mail, Phone, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact — InfoBash V5.0",
  description:
    "Get in touch with the organizing committee of InfoBash V5.0 — the Faculty of Computing, SUSL's inter-batch cricket championship.",
};

type Person = {
  name: string;
  phone: string;
  email: string;
};

type ContactGroup = {
  number: string;
  title: string;
  people: Person[];
};

const CONTACT_GROUPS: ContactGroup[] = [
  {
    number: "8.1",
    title: "Student Union, Faculty of Computing",
    people: [
      {
        name: "P.G.C.I. Jayakody",
        phone: "0775560765",
        email: "jayakodyindu2002@gmail.com",
      },
    ],
  },
  {
    number: "8.2",
    title: "Sports Sub Committee",
    people: [
      {
        name: "D.M. Janidu Viduranga",
        phone: "0717401557",
        email: "janiduviduranga78@gmail.com",
      },
    ],
  },
  {
    number: "8.3",
    title: "Main Coordinators",
    people: [
      {
        name: "H.M.U.V. Bandara",
        phone: "0764237533",
        email: "uvinduvidura54@gmail.com",
      },
      {
        name: "D.T.A. Gunawardana",
        phone: "0729750815",
        email: "gunawardanadewmi@gmail.com",
      },
    ],
  },
];

export default function ContactPage() {
  return (
    <main className="relative min-h-screen bg-[#060c1a]">
      {/* -- Background grid + glow ------------------------------- */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.06]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="contact-grid" width="44" height="44" patternUnits="userSpaceOnUse">
                <path d="M 44 0 L 0 0 0 44" fill="none" stroke="#dd830a" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#contact-grid)" />
          </svg>
        </div>
        <div className="absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-orange-500/8 blur-[180px]" />
        <div className="absolute -right-32 top-2/3 h-[400px] w-[400px] rounded-full bg-amber-500/8 blur-[160px]" />
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-gold-400/6 blur-[140px]" />
      </div>

      {/* -- Page header ------------------------------------------ */}
      <div className="relative z-10 border-b border-white/[0.06] px-6 pb-10 pt-20 sm:pt-24 text-center">
        <span className="font-mono-score text-[11px] uppercase tracking-[0.45em] text-gold-400 font-bold">
          InfoBash V5.0 · Faculty of Computing · SUSL
        </span>

        <h1 className="mt-3 font-display text-5xl tracking-wide text-ivory-50 sm:text-6xl">
          Contact <span className="text-gradient-gold">Details</span>
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ivory-200/70">
          Reach out to the organizing committee for any questions about
          registration, rules, or the tournament schedule.
        </p>
      </div>

      {/* -- Contact groups ---------------------------------------- */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16">
        <div className="space-y-6">
          {CONTACT_GROUPS.map((group) => (
            <div
              key={group.number}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:border-cyan-400/20 sm:p-8"
            >
              <div className="flex items-baseline gap-4">
                <span className="font-mono-score text-sm tracking-widest text-cyan-400/50">
                  {group.number}
                </span>
                <h2 className="font-display text-2xl tracking-wide text-ivory-50 sm:text-3xl">
                  {group.title}
                </h2>
              </div>

              <div className="mt-5 grid gap-5 border-t border-white/[0.06] pt-5 sm:grid-cols-2">
                {group.people.map((person) => (
                  <div
                    key={person.email}
                    className="flex flex-col gap-2 rounded-xl border border-white/[0.05] bg-navy-900/40 p-4"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-ivory-50">
                      <User size={15} className="text-cyan-400" />
                      {person.name}
                    </div>
                    <a
                      href={`tel:${person.phone}`}
                      className="flex items-center gap-2 text-sm text-ivory-200/70 transition-colors hover:text-cyan-300"
                    >
                      <Phone size={14} className="text-cyan-400/70" />
                      {person.phone}
                    </a>
                    <a
                      href={`mailto:${person.email}`}
                      className="flex items-center gap-2 break-all text-sm text-ivory-200/70 transition-colors hover:text-cyan-300"
                    >
                      <Mail size={14} className="text-cyan-400/70" />
                      {person.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* -- Footnote -------------------------------------------- */}
        <p className="mt-10 text-center font-mono-score text-xs tracking-wider text-ivory-50/40">
          For sponsorship or media inquiries, please contact the main
          coordinators directly.
        </p>
      </div>
    </main>
  );
}

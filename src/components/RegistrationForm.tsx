"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  LogOut,
  Lock,
  PartyPopper,
  ShieldAlert,
  Users,
} from "lucide-react";
import {
  registrationSchema,
  captainSignupSchema,
  captainLoginSchema,
  type RegistrationInput,
  BATCHES,
  TEAM_SIZE,
  MIN_FEMALE_PLAYERS,
  MAX_LOGO_BYTES,
} from "@/lib/validation";

const STEPS = ["Team Details", "Squad", "Review & Submit"] as const;

const inputClass =
  "w-full rounded-xl border border-white/10 bg-navy-900/70 px-4 py-3 text-sm text-ivory-50 placeholder:text-ivory-400/60 outline-none transition-colors focus:border-cyan-400/60";

const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ivory-300";

const errorClass = "mt-1.5 text-xs text-red-400";

const defaultPlayers = Array.from({ length: TEAM_SIZE }, () => ({
  fullName: "",
  studentId: "",
  gender: "male" as const,
}));

interface Captain {
  name: string;
  email: string;
  hasTeam: boolean;
  teamName: string | null;
}

/* -- Sign in / sign up gate ----------------------------------
   Team captains must have an account before they can register.
------------------------------------------------------------ */
function CaptainAuthGate({ onAuthed }: { onAuthed: (captain: Captain) => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [state, setState] = useState<{ status: "idle" | "submitting"; error?: string }>({
    status: "idle",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ status: "submitting" });

    const schema = mode === "signup" ? captainSignupSchema : captainLoginSchema;
    const payload =
      mode === "signup"
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      setState({ status: "idle", error: parsed.error.issues[0]?.message ?? "Check your details" });
      return;
    }

    try {
      const res = await fetch(mode === "signup" ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) {
        setState({ status: "idle", error: json.error ?? "Something went wrong" });
        return;
      }
      onAuthed({ name: json.name, email: json.email, hasTeam: false, teamName: null });
    } catch {
      setState({ status: "idle", error: "Couldn't reach the server. Try again." });
    }
  }

  return (
    <div className="glass-card glow-border mx-auto max-w-md rounded-3xl p-8 sm:p-10">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 text-navy-950">
        <Lock size={24} />
      </div>
      <h2 className="mt-5 text-center font-display text-3xl tracking-wide text-ivory-50">
        Captain Sign {mode === "signup" ? "Up" : "In"}
      </h2>
      <p className="mt-2 text-center text-sm text-ivory-400">
        Team captains must sign in before registering a squad.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === "signup" && (
          <div>
            <label className={labelClass} htmlFor="authName">Full Name</label>
            <input
              id="authName"
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Your full name"
            />
          </div>
        )}
        <div>
          <label className={labelClass} htmlFor="authEmail">Email</label>
          <input
            id="authEmail"
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="authPassword">Password</label>
          <input
            id="authPassword"
            type="password"
            className={inputClass}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
          />
        </div>

        {state.error && (
          <p className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            <ShieldAlert size={14} /> {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={state.status === "submitting"}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 px-6 py-3 text-sm font-semibold text-navy-950 shadow-[0_0_20px_-6px_rgba(53,215,255,0.8)] transition-transform hover:scale-105 disabled:opacity-70"
        >
          {state.status === "submitting" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : mode === "signup" ? (
            "Create Account"
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
        className="mx-auto mt-5 block text-xs text-cyan-300 hover:text-cyan-200"
      >
        {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}

function RegistrationWizard({ captain, onSignOut }: { captain: Captain; onSignOut: () => void }) {
  const [step, setStep] = useState(0);
  const [submitState, setSubmitState] = useState<
    | { status: "idle" }
    | { status: "submitting" }
    | { status: "success"; teamName: string }
    | { status: "error"; message: string }
  >({ status: "idle" });

  const [logo, setLogo] = useState<{ previewUrl: string; key: string } | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    watch,
    setError,
    formState: { errors },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema) as Resolver<RegistrationInput>,
    mode: "onTouched",
    defaultValues: {
      teamName: "",
      batch: BATCHES[0],
      captainContact: "",
      viceCaptainName: "",
      notes: "",
      players: defaultPlayers,
    },
  });

  const { fields } = useFieldArray({ control, name: "players" });
  const players = watch("players");
  const femaleCount = players?.filter((p) => p.gender === "female").length ?? 0;

  async function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setLogoError("Logo must be a PNG, JPEG, or WebP image");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("Logo must be under 1.5MB");
      return;
    }
    setLogoError(null);
    const previewUrl = URL.createObjectURL(file);
    setLogo(null);
    setLogoUploading(true);
    try {
      const presignRes = await fetch(
        `/api/register/logo-upload-url?contentType=${encodeURIComponent(file.type)}`
      );
      const presignJson = await presignRes.json();
      if (!presignRes.ok) {
        throw new Error(presignJson.error ?? "Couldn't prepare the upload");
      }

      const uploadRes = await fetch(presignJson.url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!uploadRes.ok) {
        throw new Error("Logo upload failed. Try again.");
      }

      setLogo({ previewUrl, key: presignJson.key });
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : "Logo upload failed. Try again.");
    } finally {
      setLogoUploading(false);
    }
  }

  async function goNext() {
    const fieldsForStep: (keyof RegistrationInput)[][] = [
      ["teamName", "batch", "captainContact", "viceCaptainName"],
      ["players"],
      [],
    ];
    const valid = await trigger(fieldsForStep[step]);
    if (valid && !logoUploading) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: RegistrationInput) {
    setSubmitState({ status: "submitting" });
    try {
      if (logo) {
        data.logoKey = logo.key;
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (res.ok) {
        setSubmitState({ status: "success", teamName: data.teamName });
        return;
      }

      if (res.status === 409) {
        setError("teamName", { message: json.error });
        setStep(0);
        setSubmitState({ status: "idle" });
        return;
      }

      if (res.status === 401) {
        onSignOut();
        return;
      }

      setSubmitState({
        status: "error",
        message: json.error ?? "Something went wrong. Please try again.",
      });
    } catch {
      setSubmitState({
        status: "error",
        message: "Couldn't reach the server. Check your connection and try again.",
      });
    }
  }

  if (submitState.status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card glow-border mx-auto max-w-xl rounded-3xl p-10 text-center"
      >
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 text-navy-950">
          <PartyPopper size={30} />
        </div>
        <h2 className="mt-6 font-display text-4xl tracking-wide text-ivory-50">
          You&apos;re In!
        </h2>
        <p className="mt-3 text-ivory-300">
          <span className="text-gradient-cyan font-semibold">{submitState.teamName}</span>{" "}
          has been registered for InfoBash v5.0. The organizing committee will
          reach out to your captain with match-day details.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Step indicator */}
      <div className="mb-10 flex items-center justify-center gap-2 sm:gap-4">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`grid h-9 w-9 place-items-center rounded-full border-2 font-mono-score text-sm font-semibold transition-colors ${
                  i < step
                    ? "border-cyan-400 bg-cyan-400 text-navy-950"
                    : i === step
                    ? "border-cyan-400 text-cyan-300"
                    : "border-white/15 text-ivory-400"
                }`}
              >
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              <span
                className={`hidden text-[11px] uppercase tracking-wide sm:block ${
                  i === step ? "text-cyan-300" : "text-ivory-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-[2px] w-8 sm:w-16 ${
                  i < step ? "bg-cyan-400" : "bg-white/10"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card glow-border rounded-3xl p-6 sm:p-10">
        <AnimatePresence mode="wait">
          {/* STEP 0 — Team details */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-3xl tracking-wide text-ivory-50">
                  Team Details
                </h2>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="inline-flex items-center gap-1.5 text-xs text-ivory-400 hover:text-ivory-200"
                >
                  <LogOut size={13} /> Sign out
                </button>
              </div>

              <div className="rounded-xl border border-white/10 bg-navy-900/50 px-4 py-3 text-sm">
                <p className="text-ivory-400">Registering as captain</p>
                <p className="font-medium text-cyan-300">{captain.name} · {captain.email}</p>
              </div>

              <div>
                <label className={labelClass} htmlFor="teamName">Team Name</label>
                <input id="teamName" className={inputClass} placeholder="e.g. Batch 21 Strikers" {...register("teamName")} />
                {errors.teamName && <p className={errorClass}>{errors.teamName.message}</p>}
              </div>

              <div>
                <label className={labelClass} htmlFor="batch">Batch</label>
                <select id="batch" className={inputClass} {...register("batch")}>
                  {BATCHES.map((b) => (
                    <option key={b} value={b} className="bg-navy-900">
                      {b}
                    </option>
                  ))}
                </select>
                {errors.batch && <p className={errorClass}>{errors.batch.message}</p>}
              </div>

              <div>
                <label className={labelClass} htmlFor="captainContact">Captain Contact Number</label>
                <input id="captainContact" className={inputClass} placeholder="07XXXXXXXX" {...register("captainContact")} />
                {errors.captainContact && <p className={errorClass}>{errors.captainContact.message}</p>}
              </div>

              <div>
                <label className={labelClass} htmlFor="viceCaptainName">Vice Captain Name (optional)</label>
                <input id="viceCaptainName" className={inputClass} placeholder="Full name" {...register("viceCaptainName")} />
              </div>

              <div>
                <label className={labelClass} htmlFor="notes">Notes for Organizers (optional)</label>
                <textarea id="notes" rows={3} className={inputClass} placeholder="Anything else we should know?" {...register("notes")} />
              </div>

              <div>
                <label className={labelClass} htmlFor="logo">Team Logo (optional)</label>
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="logo"
                    className="relative flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/15 bg-navy-900/70 text-ivory-400 hover:border-cyan-400/50"
                  >
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo.previewUrl} alt="Logo preview" className="h-full w-full object-cover" />
                    ) : (
                      <ImagePlus size={20} />
                    )}
                    {logoUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-navy-950/70">
                        <Loader2 size={18} className="animate-spin text-cyan-300" />
                      </div>
                    )}
                  </label>
                  <input id="logo" type="file" accept="image/png,image/jpeg,image/webp" onChange={onLogoChange} className="hidden" disabled={logoUploading} />
                  <p className="text-xs text-ivory-400">
                    {logoUploading ? "Uploading…" : "PNG, JPEG, or WebP. Max 1.5MB."}
                  </p>
                </div>
                {logoError && <p className={errorClass}>{logoError}</p>}
              </div>
            </motion.div>
          )}

          {/* STEP 1 — Squad */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-3xl tracking-wide text-ivory-50">
                  Squad — {TEAM_SIZE} Players
                </h2>
                <div
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    femaleCount >= MIN_FEMALE_PLAYERS
                      ? "border-cyan-400/40 text-cyan-300"
                      : "border-gold-400/40 text-gold-400"
                  }`}
                >
                  <Users size={14} />
                  {femaleCount} / {MIN_FEMALE_PLAYERS} female players
                </div>
              </div>
              <p className="mb-6 text-sm text-ivory-400">
                Every squad must have exactly {TEAM_SIZE} players, including at
                least {MIN_FEMALE_PLAYERS} female players.
              </p>

              {typeof errors.players?.message === "string" && (
                <p className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  <ShieldAlert size={14} /> {errors.players.message}
                </p>
              )}

              <div className="space-y-3">
                {fields.map((field, i) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-[auto_1fr_1fr_auto] items-start gap-3 rounded-xl border border-white/5 bg-navy-900/50 p-3"
                  >
                    <span className="mt-3 font-mono-score text-xs text-ivory-400">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                    <div>
                      <input
                        className={inputClass}
                        placeholder="Player full name"
                        {...register(`players.${i}.fullName` as const)}
                      />
                      {errors.players?.[i]?.fullName && (
                        <p className={errorClass}>{errors.players[i]?.fullName?.message}</p>
                      )}
                    </div>
                    <div>
                      <input
                        className={inputClass}
                        placeholder="Student ID"
                        {...register(`players.${i}.studentId` as const)}
                      />
                      {errors.players?.[i]?.studentId && (
                        <p className={errorClass}>{errors.players[i]?.studentId?.message}</p>
                      )}
                    </div>
                    <select
                      className={`${inputClass} w-auto`}
                      {...register(`players.${i}.gender` as const)}
                    >
                      <option value="male" className="bg-navy-900">Male</option>
                      <option value="female" className="bg-navy-900">Female</option>
                    </select>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2 — Review */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="font-display text-3xl tracking-wide text-ivory-50">
                Review &amp; Submit
              </h2>

              <div className="rounded-2xl border border-white/10 bg-navy-900/50 p-5">
                <h3 className="font-display text-xl tracking-wide text-cyan-300">
                  {watch("teamName") || "—"}
                </h3>
                <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  <div><dt className="text-ivory-400">Batch</dt><dd className="text-ivory-100">{watch("batch")}</dd></div>
                  <div><dt className="text-ivory-400">Captain</dt><dd className="text-ivory-100">{captain.name}</dd></div>
                  <div><dt className="text-ivory-400">Contact</dt><dd className="text-ivory-100">{watch("captainContact")}</dd></div>
                  <div><dt className="text-ivory-400">Email</dt><dd className="text-ivory-100">{captain.email}</dd></div>
                  {watch("viceCaptainName") && (
                    <div><dt className="text-ivory-400">Vice Captain</dt><dd className="text-ivory-100">{watch("viceCaptainName")}</dd></div>
                  )}
                </dl>
              </div>

              <div className="rounded-2xl border border-white/10 bg-navy-900/50 p-5">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ivory-400">
                  Squad ({players?.length ?? 0} players · {femaleCount} female)
                </h4>
                <ol className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm text-ivory-200 sm:grid-cols-2">
                  {players?.map((p, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 border-b border-white/5 py-1">
                      <span>{i + 1}. {p.fullName || "—"} <span className="text-ivory-400">({p.studentId || "—"})</span></span>
                      <span className="text-xs uppercase text-ivory-400">{p.gender}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {submitState.status === "error" && (
                <p className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  <ShieldAlert size={16} /> {submitState.message}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-ivory-200 transition-colors hover:border-white/30 disabled:opacity-0"
          >
            <ChevronLeft size={16} /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-navy-950 shadow-[0_0_20px_-6px_rgba(53,215,255,0.8)] transition-transform hover:scale-105"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitState.status === "submitting" || logoUploading}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 px-7 py-2.5 text-sm font-semibold text-navy-950 shadow-[0_0_20px_-6px_rgba(53,215,255,0.8)] transition-transform hover:scale-105 disabled:opacity-70"
            >
              {submitState.status === "submitting" ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Submitting…
                </>
              ) : (
                <>Submit Registration <Check size={16} /></>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default function RegistrationForm() {
  const [captain, setCaptain] = useState<Captain | null | "loading">("loading");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((json) => setCaptain(json.captain ?? null))
      .catch(() => setCaptain(null));
  }, []);

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setCaptain(null);
  }

  if (captain === "loading") {
    return (
      <div className="mx-auto flex max-w-md items-center justify-center gap-2 py-16 text-ivory-400">
        <Loader2 size={20} className="animate-spin" /> Loading…
      </div>
    );
  }

  if (!captain) {
    return <CaptainAuthGate onAuthed={setCaptain} />;
  }

  if (captain.hasTeam) {
    return (
      <div className="glass-card glow-border mx-auto max-w-xl rounded-3xl p-10 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 text-navy-950">
          <PartyPopper size={30} />
        </div>
        <h2 className="mt-6 font-display text-4xl tracking-wide text-ivory-50">Already Registered</h2>
        <p className="mt-3 text-ivory-300">
          <span className="text-gradient-cyan font-semibold">{captain.teamName}</span>{" "}
          is already registered under this account.
        </p>
        <button
          type="button"
          onClick={handleSignOut}
          className="mx-auto mt-6 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-ivory-200 transition-colors hover:border-white/30"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    );
  }

  return <RegistrationWizard captain={captain} onSignOut={handleSignOut} />;
}

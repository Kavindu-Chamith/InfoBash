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
  REQUIRED_FEMALE_PLAYERS,
  MIN_FEMALE_PLAYERS,
  MAX_LOGO_BYTES,
} from "@/lib/validation";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, options: any) => void;
        };
        oauth2?: {
          initTokenClient: (config: any) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

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
  const [state, setState] = useState<{ status: "idle" | "submitting"; error?: string }>({
    status: "idle",
  });
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    // Load Google Identity Services script dynamically
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: { credential?: string }) => {
            if (response.credential) {
              await verifyGoogleToken({ credential: response.credential });
            }
          },
        });

        const btnContainer = document.getElementById("googleBtnContainer");
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: "filled_blue",
            size: "large",
            text: "continue_with",
            shape: "pill",
            width: "320",
          });
        }
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  async function verifyGoogleToken(payload: { credential?: string; accessToken?: string; email?: string; name?: string }) {
    setState({ status: "submitting" });

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        setState({ status: "idle", error: json.error ?? "Google authentication failed" });
        return;
      }

      onAuthed({
        name: json.name,
        email: json.email,
        hasTeam: json.hasTeam ?? false,
        teamName: json.teamName ?? null,
      });
    } catch {
      setState({ status: "idle", error: "Couldn't connect to Google Authentication server. Try again." });
    }
  }

  function handleGoogleAuth() {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    // 1. Try Google OAuth2 Token Client popup dialog if available
    if (clientId && window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "email profile",
          callback: async (tokenResponse: { access_token?: string; error?: string }) => {
            if (tokenResponse.access_token) {
              await verifyGoogleToken({ accessToken: tokenResponse.access_token });
            } else if (tokenResponse.error) {
              setShowEmailInput(true);
            }
          },
        });
        client.requestAccessToken();
        return;
      } catch (e) {
        console.warn("OAuth token client popup error:", e);
      }
    }

    // 2. Fallback to Google One-Tap prompt
    if (clientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setShowEmailInput(true);
        }
      });
      return;
    }

    // 3. Fallback email entry
    if (!showEmailInput) {
      setShowEmailInput(true);
      return;
    }

    if (!customEmail || !customEmail.includes("@")) {
      setState({ status: "idle", error: "Please enter a valid Google email address." });
      return;
    }

    verifyGoogleToken({
      email: customEmail,
      name: customName.trim() || undefined,
    });
  }

  return (
    <div className="glass-card glow-border mx-auto max-w-md rounded-3xl p-8 text-center sm:p-10">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-600/30 to-cyan-400/30 border border-cyan-400/40 text-cyan-300 shadow-[0_0_25px_-5px_rgba(53,215,255,0.4)]">
        <svg className="h-8 w-8" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
      </div>

      <span className="mt-6 inline-block font-mono-score text-[11px] font-bold uppercase tracking-[0.3em] text-gold-400">
        InfoBash V5.0 · Verification
      </span>

      <h2 className="mt-2 font-display text-3xl tracking-wide text-ivory-50">
        Captain Authentication
      </h2>

      <p className="mt-3 text-sm text-ivory-300 leading-relaxed">
        Sign in with your Google account to verify your captain identity and proceed directly to team details.
      </p>

      {state.error && (
        <p className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-300">
          <ShieldAlert size={14} /> {state.error}
        </p>
      )}

      {showEmailInput && (
        <div className="mt-6 space-y-4 text-left">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ivory-300">
              Captain Full Name
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Kavindu Chamith"
              className="w-full rounded-xl border border-white/10 bg-navy-900/70 px-4 py-3 text-sm text-ivory-50 placeholder:text-ivory-400/60 outline-none focus:border-cyan-400/60"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ivory-300">
              Google Account Email
            </label>
            <input
              type="email"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="captain@gmail.com"
              className="w-full rounded-xl border border-white/10 bg-navy-900/70 px-4 py-3 text-sm text-ivory-50 placeholder:text-ivory-400/60 outline-none focus:border-cyan-400/60"
            />
          </div>
        </div>
      )}

      <div className="mt-8">
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={state.status === "submitting"}
          className="group relative flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-gray-900 shadow-[0_0_25px_-5px_rgba(255,255,255,0.4)] transition-all hover:scale-[1.02] hover:bg-gray-50 active:scale-[0.98] disabled:opacity-75"
        >
          {state.status === "submitting" ? (
            <>
              <Loader2 size={18} className="animate-spin text-gray-700" />
              <span>Authenticating with Google...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{showEmailInput ? "Proceed to Team Details" : "Continue with Google"}</span>
            </>
          )}
        </button>
      </div>

      <p className="mt-6 text-[11px] text-ivory-400">
        By continuing, you agree to represent your team in accordance with InfoBash rules.
      </p>
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
    getValues,
    setError,
    formState: { errors },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema) as Resolver<RegistrationInput>,
    mode: "onTouched",
    defaultValues: {
      teamName: "",
      batch: BATCHES[0],
      captainName: captain.name || "",
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
      const formData = new FormData();
      formData.append("logo", file);
      formData.append("teamName", getValues("teamName") || "Team");

      const uploadRes = await fetch("/api/register/logo-upload", {
        method: "POST",
        body: formData,
      });

      const responseText = await uploadRes.text();
      let uploadJson: any = {};
      try {
        uploadJson = JSON.parse(responseText);
      } catch {
        throw new Error("Logo upload failed. Please try again.");
      }

      if (!uploadRes.ok) {
        throw new Error(uploadJson.error ?? "Couldn't upload the team logo.");
      }

      setLogo({ previewUrl, key: uploadJson.logoUrl });
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : "Logo upload failed. Try again.");
    } finally {
      setLogoUploading(false);
    }
  }

  async function goNext() {
    const fieldsForStep: (keyof RegistrationInput)[][] = [
      ["teamName", "batch", "captainName", "captainContact", "viceCaptainName"],
      ["players"],
      [],
    ];
    const valid = await trigger(fieldsForStep[step]);
    if (!valid) {
      if (step === 1 && femaleCount !== REQUIRED_FEMALE_PLAYERS) {
        setSubmitState({
          status: "error",
          message: `Squad validation failed: Squad must include ${REQUIRED_FEMALE_PLAYERS} female players (currently ${femaleCount}).`,
        });
      } else {
        setSubmitState({
          status: "error",
          message: "Please fill in all required fields correctly before proceeding.",
        });
      }
      return;
    }
    setSubmitState({ status: "idle" });
    if (!logoUploading) setStep((s) => Math.min(s + 1, STEPS.length - 1));
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

  function onFormError(formErrors: Record<string, any>) {
    if (femaleCount !== REQUIRED_FEMALE_PLAYERS) {
      setSubmitState({
        status: "error",
        message: `Squad validation error: Squad must include ${REQUIRED_FEMALE_PLAYERS} female players (currently ${femaleCount}). Please update squad details in Step 2.`,
      });
      setStep(1);
      return;
    }

    if (formErrors.teamName || formErrors.batch || formErrors.captainName || formErrors.captainContact) {
      setSubmitState({
        status: "error",
        message: "Team Details validation error: Please enter team name, captain full name, and valid Sri Lankan contact number.",
      });
      setStep(0);
      return;
    }

    if (formErrors.players) {
      setSubmitState({
        status: "error",
        message: "Squad Roster validation error: All 11 players must have full names, student IDs, and unique registration numbers.",
      });
      setStep(1);
      return;
    }

    setSubmitState({
      status: "error",
      message: "Please correct the highlighted form errors before submitting.",
    });
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
                className={`grid h-9 w-9 place-items-center rounded-full border-2 font-mono-score text-sm font-semibold transition-colors ${i < step
                  ? "border-cyan-400 bg-cyan-400 text-navy-950"
                  : i === step
                    ? "border-cyan-400 text-cyan-300"
                    : "border-white/15 text-ivory-400"
                  }`}
              >
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              <span
                className={`hidden text-[11px] uppercase tracking-wide sm:block ${i === step ? "text-cyan-300" : "text-ivory-400"
                  }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-[2px] w-8 sm:w-16 ${i < step ? "bg-cyan-400" : "bg-white/10"
                  }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit, onFormError)} className="glass-card glow-border rounded-3xl p-6 sm:p-10">
        {submitState.status === "error" && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200 shadow-xl">
            <ShieldAlert size={20} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-300">Registration Error</h4>
              <p className="mt-1 text-xs text-red-200/90">{submitState.message}</p>
            </div>
          </div>
        )}
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

              {/* Google Verified Account Badge */}
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold">✓</span>
                  <div>
                    <span className="font-semibold text-emerald-300">Verified Google Captain Account</span>
                    <p className="text-ivory-400">{captain.email}</p>
                  </div>
                </div>
              </div>

              {/* 🖼️ Team Logo Upload */}
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
                    {logoUploading ? "Uploading…" : "PNG, JPEG, or WebP. Max 5MB."}
                  </p>
                </div>
                {logoError && <p className={errorClass}>{logoError}</p>}
              </div>

              <div>
                <label className={labelClass} htmlFor="teamName">Team Name</label>
                <input id="teamName" className={inputClass} placeholder="e.g. Batch 21 Strikers" {...register("teamName")} />
                {errors.teamName && <p className={errorClass}>{errors.teamName.message}</p>}
              </div>

              <div>
                <label className={labelClass} htmlFor="captainName">Captain Full Name</label>
                <input id="captainName" className={inputClass} placeholder="Enter captain's full name" {...register("captainName")} />
                {errors.captainName && <p className={errorClass}>{errors.captainName.message}</p>}
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
                  className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${femaleCount === REQUIRED_FEMALE_PLAYERS
                    ? "border-cyan-400/40 text-cyan-300 bg-cyan-400/10"
                    : "border-rose-500/50 text-rose-400 bg-rose-500/10"
                    }`}
                >
                  <Users size={14} />
                  {femaleCount} / {REQUIRED_FEMALE_PLAYERS} female players (Exact {REQUIRED_FEMALE_PLAYERS} required)
                </div>
              </div>
              <p className="mb-6 text-sm text-ivory-400">
                Every squad must have {TEAM_SIZE} players (8 male players and {REQUIRED_FEMALE_PLAYERS} female players).
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
                  <div><dt className="text-ivory-400">Captain</dt><dd className="text-ivory-100">{watch("captainName") || captain.name || "—"}</dd></div>
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
                  {[...(players || [])]
                    .sort((a, b) => {
                      if (a.gender === "female" && b.gender !== "female") return 1;
                      if (a.gender !== "female" && b.gender === "female") return -1;
                      return 0;
                    })
                    .map((p, i) => (
                      <li key={i} className="flex items-center justify-between gap-2 border-b border-white/5 py-1">
                        <span>{i + 1}. {p.fullName || "—"} <span className="text-ivory-400">({p.studentId || "—"})</span></span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${p.gender === "female" ? "bg-pink-500/20 text-pink-300" : "text-ivory-400"}`}>
                          {p.gender}
                        </span>
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

import { z } from "zod";

export const BATCHES = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
] as const;

export const TEAM_SIZE = 11;
export const REQUIRED_FEMALE_PLAYERS = 3;
export const MIN_FEMALE_PLAYERS = REQUIRED_FEMALE_PLAYERS;
export const MAX_LOGO_BYTES = 1.5 * 1024 * 1024;

export const captainSignupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const captainLoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export const playerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the player's full name"),
  studentId: z.string().trim().min(2, "Enter the student registration number"),
  gender: z.enum(["male", "female"]),
});

export const registrationSchema = z
  .object({
    teamName: z
      .string()
      .trim()
      .min(3, "Team name must be at least 3 characters")
      .max(60, "Team name must be under 60 characters"),
    batch: z.enum(BATCHES),
    captainName: z
      .string()
      .trim()
      .min(2, "Captain full name must be at least 2 characters"),
    captainContact: z
      .string()
      .trim()
      .regex(/^(0\d{9}|\+94\d{9})$/, "Enter a valid Sri Lankan phone number"),
    viceCaptainName: z.string().trim().optional().or(z.literal("")),
    notes: z.string().trim().max(500).optional().or(z.literal("")),
    players: z.array(playerSchema).length(
      TEAM_SIZE,
      `A squad must have exactly ${TEAM_SIZE} players`
    ),
    logoKey: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const femaleCount = data.players.filter((p) => p.gender === "female").length;
    if (femaleCount !== REQUIRED_FEMALE_PLAYERS) {
      ctx.addIssue({
        code: "custom",
        path: ["players"],
        message: `Squad must include EXACTLY ${REQUIRED_FEMALE_PLAYERS} female players (currently ${femaleCount})`,
      });
    }
    const ids = data.players.map((p) => p.studentId.toLowerCase());
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: "custom",
        path: ["players"],
        message: "Each player must have a unique registration number",
      });
    }
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type PlayerInput = z.infer<typeof playerSchema>;

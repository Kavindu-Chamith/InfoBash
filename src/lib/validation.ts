import { z } from "zod";

export const BATCHES = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
] as const;

export const TEAM_SIZE = 11;
export const MIN_FEMALE_PLAYERS = 2;

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
    captainName: z.string().trim().min(2, "Enter the captain's full name"),
    captainContact: z
      .string()
      .trim()
      .regex(/^(0\d{9}|\+94\d{9})$/, "Enter a valid Sri Lankan phone number"),
    captainEmail: z.string().trim().email("Enter a valid email address"),
    viceCaptainName: z.string().trim().optional().or(z.literal("")),
    notes: z.string().trim().max(500).optional().or(z.literal("")),
    players: z.array(playerSchema).length(
      TEAM_SIZE,
      `A squad must have exactly ${TEAM_SIZE} players`
    ),
  })
  .superRefine((data, ctx) => {
    const femaleCount = data.players.filter((p) => p.gender === "female").length;
    if (femaleCount < MIN_FEMALE_PLAYERS) {
      ctx.addIssue({
        code: "custom",
        path: ["players"],
        message: `Squad must include at least ${MIN_FEMALE_PLAYERS} female players`,
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

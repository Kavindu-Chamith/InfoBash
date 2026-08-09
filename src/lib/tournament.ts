// Pure helpers for group allocation and round-1 fixture generation.
// Kept free of DB/network calls so the pairing logic is easy to reason about and test.

export interface AllocatableTeam {
  id: string;
}

export interface GroupAssignment {
  groupIndex: number;
  teamIds: string[];
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const MIN_TOURNAMENT_TEAMS = 12;
export const MAX_TOURNAMENT_TEAMS = 16;
export const TOURNAMENT_GROUP_COUNT = 4;
export const GROUP_NAMES = ["Group A", "Group B", "Group C", "Group D"] as const;

export function allocateTournamentGroups(
  teams: AllocatableTeam[]
): GroupAssignment[] {
  const n = teams.length;
  if (n < MIN_TOURNAMENT_TEAMS || n > MAX_TOURNAMENT_TEAMS) {
    throw new Error(
      `Group allocation requires between ${MIN_TOURNAMENT_TEAMS} and ${MAX_TOURNAMENT_TEAMS} registered teams (currently ${n} teams registered).`
    );
  }

  // 1. Shuffle all N teams randomly
  const shuffledTeams = shuffle(teams);

  // 2. Base size for each of 4 groups is 3 teams.
  // The number of groups that receive a 4th team is (n - 12).
  const extra4TeamGroupCount = n - MIN_TOURNAMENT_TEAMS;

  // 3. Randomly select which group indices get 4 teams
  const groupIndices = [0, 1, 2, 3];
  const shuffledGroupIndices = shuffle(groupIndices);

  const targetSizes = [3, 3, 3, 3];
  for (let i = 0; i < extra4TeamGroupCount; i++) {
    const targetIdx = shuffledGroupIndices[i];
    targetSizes[targetIdx] = 4;
  }

  // 4. Fill assignments according to targetSizes
  const assignments: GroupAssignment[] = Array.from({ length: 4 }, (_, i) => ({
    groupIndex: i,
    teamIds: [],
  }));

  let currentTeamIdx = 0;
  for (let g = 0; g < 4; g++) {
    const size = targetSizes[g];
    for (let s = 0; s < size; s++) {
      assignments[g].teamIds.push(shuffledTeams[currentTeamIdx].id);
      currentTeamIdx++;
    }
  }

  return assignments;
}

/** Randomly splits teams into `groupCount` groups as evenly as possible. (Legacy fallback) */
export function allocateGroups(
  teams: AllocatableTeam[],
  groupCount: number = 4
): GroupAssignment[] {
  if (teams.length >= MIN_TOURNAMENT_TEAMS && teams.length <= MAX_TOURNAMENT_TEAMS && groupCount === 4) {
    return allocateTournamentGroups(teams);
  }

  if (groupCount < 1) throw new Error("groupCount must be at least 1");
  const shuffled = shuffle(teams);
  const groups: GroupAssignment[] = Array.from({ length: groupCount }, (_, i) => ({
    groupIndex: i,
    teamIds: [],
  }));
  shuffled.forEach((team, i) => {
    groups[i % groupCount].teamIds.push(team.id);
  });
  return groups;
}

export interface Round1Pairing {
  groupIndex: number;
  teamAId: string;
  teamBId: string;
}

/**
 * Generates complete Round-Robin pairings for each group in Round 1.
 * - 3 teams -> 3 matches total (each team plays 2 matches)
 * - 4 teams -> 6 matches total (each team plays 3 matches)
 */
export function generateRound1(groups: GroupAssignment[]): Round1Pairing[] {
  const pairings: Round1Pairing[] = [];
  for (const group of groups) {
    const ids = group.teamIds;
    const n = ids.length;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        pairings.push({
          groupIndex: group.groupIndex,
          teamAId: ids[i],
          teamBId: ids[j],
        });
      }
    }
  }
  return pairings;
}

/**
 * Parses cricket overs string (e.g. "5.3" -> 5 + 3/6 = 5.5 overs)
 */
export function parseOvers(overs: string | number | null | undefined): number {
  if (overs === null || overs === undefined || overs === "") return 0;
  if (typeof overs === "number") return isNaN(overs) ? 0 : overs;
  const str = String(overs).trim();
  if (!str) return 0;
  const parts = str.split(".");
  const completedOvers = parseInt(parts[0], 10) || 0;
  const balls = parts.length > 1 ? parseInt(parts[1], 10) || 0 : 0;
  return completedOvers + (balls % 6) / 6;
}

export interface MatchData {
  id: string;
  stage: string;
  status: string;
  team_a_id: string | null;
  team_b_id: string | null;
  team_a_score: number | null;
  team_b_score: number | null;
  team_a_overs?: string | number | null;
  team_b_overs?: string | number | null;
  winner_id: string | null;
}

export interface TeamStanding {
  id: string;
  teamName: string;
  batch: string;
  played: number;
  wins: number;
  losses: number;
  points: number;
  runsScored: number;
  oversFaced: number;
  runsConceded: number;
  oversBowled: number;
  nrr: number;
  nrrFormatted: string;
  isQualified: boolean;
}

export function calculateGroupStandings(
  teams: { id: string; teamName: string; batch: string }[],
  groupMatches: MatchData[]
): TeamStanding[] {
  const standingsMap = new Map<string, TeamStanding>();

  for (const t of teams) {
    standingsMap.set(t.id, {
      id: t.id,
      teamName: t.teamName,
      batch: t.batch,
      played: 0,
      wins: 0,
      losses: 0,
      points: 0,
      runsScored: 0,
      oversFaced: 0,
      runsConceded: 0,
      oversBowled: 0,
      nrr: 0,
      nrrFormatted: "0.000",
      isQualified: false,
    });
  }

  const completedMatches = groupMatches.filter((m) => m.status === "completed");

  for (const m of completedMatches) {
    if (!m.team_a_id || !m.team_b_id) continue;
    const teamA = standingsMap.get(m.team_a_id);
    const teamB = standingsMap.get(m.team_b_id);

    const scoreA = m.team_a_score ?? 0;
    const scoreB = m.team_b_score ?? 0;
    const oversA = parseOvers(m.team_a_overs);
    const oversB = parseOvers(m.team_b_overs);

    if (teamA) {
      teamA.played += 1;
      teamA.runsScored += scoreA;
      teamA.oversFaced += oversA;
      teamA.runsConceded += scoreB;
      teamA.oversBowled += oversB;
      if (m.winner_id === teamA.id) {
        teamA.wins += 1;
        teamA.points += 2;
      } else if (m.winner_id === teamB?.id) {
        teamA.losses += 1;
      }
    }

    if (teamB) {
      teamB.played += 1;
      teamB.runsScored += scoreB;
      teamB.oversFaced += oversB;
      teamB.runsConceded += scoreA;
      teamB.oversBowled += oversA;
      if (m.winner_id === teamB.id) {
        teamB.wins += 1;
        teamB.points += 2;
      } else if (m.winner_id === teamA?.id) {
        teamB.losses += 1;
      }
    }
  }

  const standings = Array.from(standingsMap.values()).map((s) => {
    const forRate = s.oversFaced > 0 ? s.runsScored / s.oversFaced : 0;
    const againstRate = s.oversBowled > 0 ? s.runsConceded / s.oversBowled : 0;
    const nrrVal = forRate - againstRate;
    const formatted = nrrVal > 0 ? `+${nrrVal.toFixed(3)}` : nrrVal.toFixed(3);
    return {
      ...s,
      nrr: nrrVal,
      nrrFormatted: formatted,
    };
  });

  // Sort by Points (desc), NRR (desc), Wins (desc), Team Name (asc)
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (Math.abs(b.nrr - a.nrr) > 0.0001) return b.nrr - a.nrr;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.teamName.localeCompare(b.teamName);
  });

  if (standings.length > 0) {
    standings[0].isQualified = true;
  }

  return standings;
}


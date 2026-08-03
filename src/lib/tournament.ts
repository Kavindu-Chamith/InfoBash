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

/** Randomly splits teams into `groupCount` groups as evenly as possible. */
export function allocateGroups(
  teams: AllocatableTeam[],
  groupCount: number
): GroupAssignment[] {
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
  teamBId: string | null; // null means a bye
}

/** Pairs teams within each group for round 1. Odd team out gets a bye (teamBId = null). */
export function generateRound1(groups: GroupAssignment[]): Round1Pairing[] {
  const pairings: Round1Pairing[] = [];
  for (const group of groups) {
    const ids = shuffle(group.teamIds);
    for (let i = 0; i < ids.length; i += 2) {
      pairings.push({
        groupIndex: group.groupIndex,
        teamAId: ids[i],
        teamBId: ids[i + 1] ?? null,
      });
    }
  }
  return pairings;
}

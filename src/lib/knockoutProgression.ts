import { pool } from "@/lib/db";

export function parseOversToDecimal(overs: string | number | null | undefined): number {
  if (!overs) return 0;
  const str = overs.toString().trim();
  if (str.includes(".")) {
    const parts = str.split(".");
    const fullOvers = parseInt(parts[0], 10) || 0;
    const balls = parseInt(parts[1], 10) || 0;
    return fullOvers + Math.min(balls, 6) / 6;
  }
  return parseFloat(str) || 0;
}

export interface GroupStandingRow {
  groupId: string;
  groupName: string;
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  losses: number;
  ties: number;
  points: number;
  runsScored: number;
  oversFaced: number;
  runRate: number;
  isQualified?: boolean;
  isManualOverride?: boolean;
}

export async function calculate1stRoundStandings(): Promise<Record<string, GroupStandingRow[]>> {
  // Fetch teams with group details
  const teamsRes = await pool.query(`
    SELECT 
      t.id AS team_id,
      t.team_name,
      t.group_id,
      t.batch,
      g.name AS group_name
    FROM teams t
    LEFT JOIN groups g ON g.id = t.group_id
    ORDER BY g.name ASC, t.team_name ASC
  `);

  // Fetch completed 1st Round / Group matches
  const matchesRes = await pool.query(`
    SELECT 
      m.id,
      m.stage,
      m.status,
      m.team_a_id,
      m.team_b_id,
      m.team_a_score,
      m.team_b_score,
      m.team_a_overs,
      m.team_b_overs,
      m.winner_id,
      m.group_id,
      g.name AS group_name
    FROM matches m
    LEFT JOIN groups g ON g.id = m.group_id
    WHERE (m.stage = 'round1' OR m.stage = 'group') AND m.status = 'completed'
  `);

  // Fetch manual overrides
  const overridesRes = await pool.query(
    `SELECT key, value FROM tournament_settings WHERE key LIKE 'qualifier_override_%'`
  ).catch(() => ({ rows: [] }));
  const qualifierOverrides = new Map<string, string>();
  for (const r of overridesRes.rows) {
    const gName = r.key.replace("qualifier_override_", "");
    qualifierOverrides.set(gName.toLowerCase(), r.value);
  }

  const teams = teamsRes.rows;
  const matches = matchesRes.rows;

  // Initialize stats per team
  const statsMap = new Map<string, GroupStandingRow>();

  for (const t of teams) {
    const gName = t.group_name || t.batch || "Group A";
    statsMap.set(t.team_id, {
      groupId: t.group_id || "",
      groupName: gName,
      teamId: t.team_id,
      teamName: t.team_name,
      played: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      points: 0,
      runsScored: 0,
      oversFaced: 0,
      runRate: 0.0,
      isQualified: false,
      isManualOverride: false,
    });
  }

  // Aggregate stats from completed matches
  for (const m of matches) {
    const aId = m.team_a_id;
    const bId = m.team_b_id;
    const scoreA = m.team_a_score ?? 0;
    const scoreB = m.team_b_score ?? 0;
    const oversA = parseOversToDecimal(m.team_a_overs);
    const oversB = parseOversToDecimal(m.team_b_overs);

    const statA = aId ? statsMap.get(aId) : null;
    const statB = bId ? statsMap.get(bId) : null;

    if (statA) {
      statA.played += 1;
      statA.runsScored += scoreA;
      statA.oversFaced += oversA;
    }
    if (statB) {
      statB.played += 1;
      statB.runsScored += scoreB;
      statB.oversFaced += oversB;
    }

    // Determine winner & points (2 for win, 1 for tie, 0 for loss)
    let winnerId = m.winner_id;
    if (!winnerId && scoreA !== scoreB) {
      winnerId = scoreA > scoreB ? aId : bId;
    }

    if (scoreA === scoreB && !winnerId) {
      if (statA) { statA.ties += 1; statA.points += 1; }
      if (statB) { statB.ties += 1; statB.points += 1; }
    } else if (winnerId === aId) {
      if (statA) { statA.wins += 1; statA.points += 2; }
      if (statB) { statB.losses += 1; }
    } else if (winnerId === bId) {
      if (statB) { statB.wins += 1; statB.points += 2; }
      if (statA) { statA.losses += 1; }
    }
  }

  // Group teams and calculate Run Rate (Runs / Overs)
  const grouped: Record<string, GroupStandingRow[]> = {};

  for (const stat of Array.from(statsMap.values())) {
    stat.runRate = stat.oversFaced > 0 ? Number((stat.runsScored / stat.oversFaced).toFixed(1)) : 0.0;
    const gKey = stat.groupName;
    if (!grouped[gKey]) grouped[gKey] = [];
    grouped[gKey].push(stat);
  }

  // Sort teams inside each group: Highest Points first, then Highest Run Rate
  for (const gKey of Object.keys(grouped)) {
    grouped[gKey].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (Math.abs(b.runRate - a.runRate) > 0.001) return b.runRate - a.runRate;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.teamName.localeCompare(b.teamName);
    });

    const overrideTeamId = qualifierOverrides.get(gKey.toLowerCase());
    if (overrideTeamId) {
      grouped[gKey].forEach((t) => {
        if (t.teamId === overrideTeamId) {
          t.isQualified = true;
          t.isManualOverride = true;
        } else {
          t.isQualified = false;
          t.isManualOverride = false;
        }
      });
    } else {
      grouped[gKey].forEach((t, idx) => {
        t.isQualified = idx === 0;
        t.isManualOverride = false;
      });
    }
  }

  return grouped;
}

export async function autoProgressKnockoutMatches() {
  try {
    const standings = await calculate1stRoundStandings();

    // Fetch manual overrides
    const overridesRes = await pool.query(
      `SELECT key, value FROM tournament_settings WHERE key LIKE 'qualifier_override_%'`
    ).catch(() => ({ rows: [] }));
    const qualifierOverrides = new Map<string, string>();
    for (const r of overridesRes.rows) {
      const gName = r.key.replace("qualifier_override_", "");
      qualifierOverrides.set(gName.toLowerCase(), r.value);
    }

    // Helper: Find top team for a given group key ("Group A", "Group B", etc.)
    function getTopTeamForGroup(keyName: string): string | null {
      const keys = Object.keys(standings);
      const matchKey = keys.find(
        (k) => k.toLowerCase().includes(keyName.toLowerCase()) || keyName.toLowerCase().includes(k.toLowerCase())
      );

      if (matchKey) {
        const overrideId = qualifierOverrides.get(matchKey.toLowerCase()) || qualifierOverrides.get(keyName.toLowerCase());
        if (overrideId) return overrideId;
      }

      if (matchKey && standings[matchKey] && standings[matchKey].length > 0) {
        return standings[matchKey][0].teamId;
      }
      return null;
    }

    const sf1ExpectedA = getTopTeamForGroup("Group A") || getTopTeamForGroup("A");
    const sf1ExpectedB = getTopTeamForGroup("Group C") || getTopTeamForGroup("C");

    const sf2ExpectedA = getTopTeamForGroup("Group B") || getTopTeamForGroup("B");
    const sf2ExpectedB = getTopTeamForGroup("Group D") || getTopTeamForGroup("D");

    // Fetch existing knockout matches
    const res = await pool.query(`SELECT id, stage, round, label, status, team_a_id, team_b_id, team_a_score, team_b_score, winner_id FROM matches WHERE stage IN ('semifinal', 'final')`);
    const sfMatches = res.rows.filter((m) => m.stage === "semifinal");

    let sf1Match = sfMatches.find((m) => (m.label && m.label.toLowerCase().includes("semi-final 1")) || m.round === 1) || sfMatches[0];
    let sf2Match = sfMatches.find((m) => (m.label && m.label.toLowerCase().includes("semi-final 2")) || m.round === 2) || (sfMatches.length > 1 ? sfMatches[1] : null);

    // Upsert Semi-Final 1
    if (sf1Match) {
      if ((sf1ExpectedA && sf1Match.team_a_id !== sf1ExpectedA) || (sf1ExpectedB && sf1Match.team_b_id !== sf1ExpectedB)) {
        const nextA = sf1ExpectedA || sf1Match.team_a_id;
        const nextB = sf1ExpectedB || sf1Match.team_b_id;
        await pool.query(`UPDATE matches SET team_a_id = $1, team_b_id = $2 WHERE id = $3`, [nextA, nextB, sf1Match.id]);
        sf1Match.team_a_id = nextA;
        sf1Match.team_b_id = nextB;
      }
    } else if (sf1ExpectedA || sf1ExpectedB) {
      const newRes = await pool.query(
        `INSERT INTO matches (stage, round, label, team_a_id, team_b_id, status)
         VALUES ('semifinal', 1, 'Semi-Final 1', $1, $2, 'scheduled')
         RETURNING id`,
        [sf1ExpectedA || null, sf1ExpectedB || null]
      );
      sf1Match = { id: newRes.rows[0].id, stage: "semifinal", round: 1, label: "Semi-Final 1", team_a_id: sf1ExpectedA, team_b_id: sf1ExpectedB, status: "scheduled" };
      sfMatches.push(sf1Match);
    }

    // Upsert Semi-Final 2
    if (sf2Match) {
      if ((sf2ExpectedA && sf2Match.team_a_id !== sf2ExpectedA) || (sf2ExpectedB && sf2Match.team_b_id !== sf2ExpectedB)) {
        const nextA = sf2ExpectedA || sf2Match.team_a_id;
        const nextB = sf2ExpectedB || sf2Match.team_b_id;
        await pool.query(`UPDATE matches SET team_a_id = $1, team_b_id = $2 WHERE id = $3`, [nextA, nextB, sf2Match.id]);
        sf2Match.team_a_id = nextA;
        sf2Match.team_b_id = nextB;
      }
    } else if (sf2ExpectedA || sf2ExpectedB) {
      const newRes = await pool.query(
        `INSERT INTO matches (stage, round, label, team_a_id, team_b_id, status)
         VALUES ('semifinal', 2, 'Semi-Final 2', $1, $2, 'scheduled')
         RETURNING id`,
        [sf2ExpectedA || null, sf2ExpectedB || null]
      );
      sf2Match = { id: newRes.rows[0].id, stage: "semifinal", round: 2, label: "Semi-Final 2", team_a_id: sf2ExpectedA, team_b_id: sf2ExpectedB, status: "scheduled" };
      sfMatches.push(sf2Match);
    }

    // Process Final (Semi-Final 1 Winner vs Semi-Final 2 Winner)
    function getWinner(m: any): string | null {
      if (!m) return null;
      if (m.winner_id) return m.winner_id;
      if (typeof m.team_a_score === "number" && typeof m.team_b_score === "number") {
        if (m.team_a_score > m.team_b_score) return m.team_a_id;
        if (m.team_b_score > m.team_a_score) return m.team_b_id;
      }
      return null;
    }

    let sf1Winner = sf1Match && sf1Match.status === "completed" ? getWinner(sf1Match) : null;
    let sf2Winner = sf2Match && sf2Match.status === "completed" ? getWinner(sf2Match) : null;

    const finalMatches = res.rows.filter((m) => m.stage === "final");
    const finalMatch = finalMatches[0];

    if (finalMatch) {
      if ((sf1Winner && finalMatch.team_a_id !== sf1Winner) || (sf2Winner && finalMatch.team_b_id !== sf2Winner)) {
        const nextA = sf1Winner || finalMatch.team_a_id;
        const nextB = sf2Winner || finalMatch.team_b_id;
        await pool.query(`UPDATE matches SET team_a_id = $1, team_b_id = $2 WHERE id = $3`, [nextA, nextB, finalMatch.id]);
      }
    } else if (sf1Winner || sf2Winner) {
      await pool.query(
        `INSERT INTO matches (stage, round, label, team_a_id, team_b_id, status)
         VALUES ('final', 1, 'Final', $1, $2, 'scheduled')`,
        [sf1Winner || null, sf2Winner || null]
      );
    }
  } catch (err) {
    console.error("Auto progress knockout matches error:", err);
  }
}

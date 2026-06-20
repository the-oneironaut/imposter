import type { Round, PlayerScore } from "./types";

export interface ScoreDelta {
  playerId: string;
  points: number;
}

export function computeRoundScores(round: Round): ScoreDelta[] {
  const deltas: ScoreDelta[] = [];
  const crewmateIds = round.playerIds.filter(
    (id) => !round.imposterIds.includes(id)
  );
  const crewmatesWon = round.result === "crewmates";

  const voteTally: Record<string, string> = {};
  for (const vote of round.votes) {
    voteTally[vote.voterId] = vote.suspectId;
  }

  // Find which imposter was voted out (most votes)
  const suspectCounts: Record<string, number> = {};
  for (const vote of round.votes) {
    suspectCounts[vote.suspectId] = (suspectCounts[vote.suspectId] || 0) + 1;
  }
  let votedOutId: string | null = null;
  if (crewmatesWon) {
    let maxVotes = 0;
    for (const [id, count] of Object.entries(suspectCounts)) {
      if (count > maxVotes && round.imposterIds.includes(id)) {
        maxVotes = count;
        votedOutId = id;
      }
    }
  }

  for (const playerId of crewmateIds) {
    let points = 0;
    const votedFor = voteTally[playerId];
    if (votedFor && round.imposterIds.includes(votedFor)) {
      points += 1; // voted for an actual imposter
    }
    if (crewmatesWon) {
      points += 1; // crewmate on winning round
    }
    deltas.push({ playerId, points });
  }

  for (const imposterId of round.imposterIds) {
    let points = 0;
    if (crewmatesWon) {
      if (imposterId !== votedOutId) {
        points += 2; // imposter not voted out but crewmates won
      }
    } else {
      points += 3; // imposter evaded, imposters won
    }
    deltas.push({ playerId: imposterId, points });
  }

  return deltas;
}

export function mergeScores(
  existing: Record<string, PlayerScore>,
  round: Round,
  deltas: ScoreDelta[]
): Record<string, PlayerScore> {
  const updated = { ...existing };
  const crewmatesWon = round.result === "crewmates";

  const voteTally: Record<string, string> = {};
  for (const vote of round.votes) {
    voteTally[vote.voterId] = vote.suspectId;
  }

  // Determine which imposter was actually voted out
  let votedOutImposterId: string | null = null;
  if (crewmatesWon) {
    const suspectCounts: Record<string, number> = {};
    for (const vote of round.votes) {
      suspectCounts[vote.suspectId] = (suspectCounts[vote.suspectId] || 0) + 1;
    }
    let maxVotes = 0;
    for (const [id, count] of Object.entries(suspectCounts)) {
      if (count > maxVotes && round.imposterIds.includes(id)) {
        maxVotes = count;
        votedOutImposterId = id;
      }
    }
  }

  for (const delta of deltas) {
    const isImposter = round.imposterIds.includes(delta.playerId);
    const prev = updated[delta.playerId] || {
      playerId: delta.playerId,
      totalRounds: 0,
      roundsAsCrewmate: 0,
      roundsAsImposter: 0,
      correctVotes: 0,
      timesIdentified: 0,
      timesEvaded: 0,
      wins: 0,
    };

    const votedFor = voteTally[delta.playerId];
    const votedCorrectly =
      votedFor && round.imposterIds.includes(votedFor);

    const won = isImposter ? !crewmatesWon : crewmatesWon;
    const wasIdentified = isImposter && delta.playerId === votedOutImposterId;

    updated[delta.playerId] = {
      ...prev,
      totalRounds: prev.totalRounds + 1,
      roundsAsCrewmate: prev.roundsAsCrewmate + (isImposter ? 0 : 1),
      roundsAsImposter: prev.roundsAsImposter + (isImposter ? 1 : 0),
      correctVotes: prev.correctVotes + (votedCorrectly ? 1 : 0),
      timesIdentified:
        prev.timesIdentified + (wasIdentified ? 1 : 0),
      timesEvaded:
        prev.timesEvaded +
        (isImposter && !crewmatesWon ? 1 : 0),
      wins: prev.wins + (won ? 1 : 0),
    };
  }

  return updated;
}

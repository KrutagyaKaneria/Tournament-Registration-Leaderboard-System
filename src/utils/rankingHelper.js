/**
 * Standard competition ranking (1224 ranking).
 * Items that compare equal receive the same rank, and the next rank
 * is incremented by the number of tied items rather than by 1.
 *
 * Input:  [{ playerId: 'a', score: 100 }, { playerId: 'b', score: 100 }, { playerId: 'c', score: 80 }]
 * Output: [{ rank: 1, playerId: 'a', score: 100 }, { rank: 1, playerId: 'b', score: 100 }, { rank: 3, playerId: 'c', score: 80 }]
 */
const computeRanks = (entries) => {
  const sorted = [...entries].sort((a, b) => b.score - a.score);

  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].score < sorted[i - 1].score) {
      currentRank = i + 1;
    }
    sorted[i].rank = currentRank;
  }

  return sorted;
};

module.exports = { computeRanks };

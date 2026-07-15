const { Tournament, Player, Registration, Score } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');

// Using Sequelize's upsert() rather than findOrCreate + update because:
// - findOrCreate has a race condition: two concurrent requests can both
//   "find" nothing and both attempt to "create", leading to a unique
//   constraint error on the second. You'd need a surrounding transaction
//   with serializable isolation to make it safe.
// - upsert() issues a single atomic INSERT ... ON CONFLICT DO UPDATE at
//   the database level, so there's no race window. It's one round trip,
//   works outside an explicit transaction, and returns [instance, created].
exports.submitScore = asyncHandler(async (req, res) => {
  const { id: tournamentId } = req.params;
  const { playerId, score } = req.body;

  const tournament = await Tournament.findByPk(tournamentId);
  if (!tournament) throw new AppError('Tournament not found', 404);

  const player = await Player.findByPk(playerId);
  if (!player) throw new AppError('Player not found', 404);

  const registration = await Registration.findOne({
    where: { tournamentId, playerId },
  });
  if (!registration) {
    throw new AppError('Player is not registered for this tournament', 403);
  }

  const [scoreRecord] = await Score.upsert({
    tournamentId,
    playerId,
    score,
  });

  res.status(200).json({
    success: true,
    data: {
      tournamentId: scoreRecord.tournamentId,
      playerId: scoreRecord.playerId,
      score: scoreRecord.score,
      updatedAt: scoreRecord.updatedAt,
    },
  });
});

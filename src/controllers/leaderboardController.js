const { Tournament, Player, Registration, Score } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const { computeRanks } = require('../utils/rankingHelper');

exports.getLeaderboard = asyncHandler(async (req, res) => {
  const { id: tournamentId } = req.params;

  const tournament = await Tournament.findByPk(tournamentId);
  if (!tournament) throw new AppError('Tournament not found', 404);

  const registrations = await Registration.findAll({
    where: { tournamentId },
    include: [
      {
        model: Player,
        attributes: ['id', 'name', 'country'],
      },
    ],
  });

  const scores = await Score.findAll({ where: { tournamentId } });
  const scoreMap = new Map(scores.map((s) => [s.playerId, s.score]));

  const entries = registrations.map((r) => ({
    playerId: r.playerId,
    name: r.Player.name,
    country: r.Player.country,
    score: scoreMap.get(r.playerId) ?? 0,
  }));

  const ranked = computeRanks(entries);

  const data = ranked.map((e) => ({
    rank: e.rank,
    playerId: e.playerId,
    name: e.name,
    country: e.country,
    score: e.score,
  }));

  res.json({ success: true, data });
});

exports.getPlayerRank = asyncHandler(async (req, res) => {
  const { id: tournamentId, playerId } = req.params;

  const tournament = await Tournament.findByPk(tournamentId);
  if (!tournament) throw new AppError('Tournament not found', 404);

  const player = await Player.findByPk(playerId);
  if (!player) throw new AppError('Player not found', 404);

  const registration = await Registration.findOne({
    where: { tournamentId, playerId },
  });
  if (!registration) {
    throw new AppError('Player is not registered for this tournament', 404);
  }

  const registrations = await Registration.findAll({
    where: { tournamentId },
  });

  const scores = await Score.findAll({ where: { tournamentId } });
  const scoreMap = new Map(scores.map((s) => [s.playerId, s.score]));

  const entries = registrations.map((r) => ({
    playerId: r.playerId,
    score: scoreMap.get(r.playerId) ?? 0,
  }));

  const ranked = computeRanks(entries);
  const entry = ranked.find((e) => e.playerId === playerId);

  res.json({
    success: true,
    data: {
      playerId: player.id,
      name: player.name,
      rank: entry.rank,
      score: entry.score,
    },
  });
});

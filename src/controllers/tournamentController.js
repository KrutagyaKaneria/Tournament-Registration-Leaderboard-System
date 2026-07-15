const { Tournament } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');

exports.createTournament = asyncHandler(async (req, res) => {
  const tournament = await Tournament.create(req.body);
  res.status(201).json({
    success: true,
    data: {
      id: tournament.id,
      name: tournament.name,
      maxPlayers: tournament.maxPlayers,
      createdAt: tournament.createdAt,
    },
  });
});

exports.getTournament = asyncHandler(async (req, res) => {
  const tournament = await Tournament.findByPk(req.params.id, {
    attributes: { exclude: ['updatedAt'] },
  });
  if (!tournament) throw new AppError('Tournament not found', 404);
  res.json({ success: true, data: tournament });
});

exports.getAllTournaments = asyncHandler(async (req, res) => {
  const tournaments = await Tournament.findAll({
    attributes: { exclude: ['updatedAt'] },
  });
  res.json({ success: true, count: tournaments.length, data: tournaments });
});

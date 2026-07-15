const { Player } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');

exports.createPlayer = asyncHandler(async (req, res) => {
  const player = await Player.create(req.body);
  res.status(201).json({
    success: true,
    data: {
      id: player.id,
      name: player.name,
      email: player.email,
      country: player.country,
      createdAt: player.createdAt,
    },
  });
});

exports.getPlayer = asyncHandler(async (req, res) => {
  const player = await Player.findByPk(req.params.id, {
    attributes: { exclude: ['updatedAt'] },
  });
  if (!player) throw new AppError('Player not found', 404);
  res.json({ success: true, data: player });
});

// Production note: this should use pagination (limit/offset or cursor-based)
// with sensible defaults (e.g. limit=20, max=100) to avoid returning
// unbounded result sets.
exports.getAllPlayers = asyncHandler(async (req, res) => {
  const players = await Player.findAll({
    attributes: { exclude: ['updatedAt'] },
  });
  res.json({ success: true, count: players.length, data: players });
});

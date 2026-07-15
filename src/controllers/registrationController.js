const sequelize = require('../config/database');
const { Tournament, Player, Registration } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');

exports.registerPlayer = asyncHandler(async (req, res) => {
  const { id: tournamentId } = req.params;
  const { playerId } = req.body;

  const result = await sequelize.transaction(async (t) => {
    const tournament = await Tournament.findByPk(tournamentId, { transaction: t });
    if (!tournament) throw new AppError('Tournament not found', 404);

    const player = await Player.findByPk(playerId, { transaction: t });
    if (!player) throw new AppError('Player not found', 404);

    const existingRegistration = await Registration.findOne({
      where: { tournamentId, playerId },
      transaction: t,
    });
    if (existingRegistration) {
      throw new AppError('Player already registered for this tournament', 409);
    }

    const registrationCount = await Registration.count({
      where: { tournamentId },
      transaction: t,
    });
    if (registrationCount >= tournament.maxPlayers) {
      throw new AppError('Tournament is full', 400);
    }

    const registration = await Registration.create(
      { tournamentId, playerId },
      { transaction: t }
    );

    return registration;
  });

  res.status(201).json({
    success: true,
    data: {
      tournamentId: result.tournamentId,
      playerId: result.playerId,
      registeredAt: result.registeredAt,
    },
  });
});

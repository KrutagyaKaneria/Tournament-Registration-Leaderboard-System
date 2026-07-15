const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Score = sequelize.define('Score', {
  tournamentId: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
  },
  playerId: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
}, {
  timestamps: true,
  updatedAt: true,
  createdAt: false,
  indexes: [
    {
      unique: true,
      fields: ['tournamentId', 'playerId'],
    },
  ],
});

module.exports = Score;

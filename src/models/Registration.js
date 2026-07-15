const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Registration = sequelize.define('Registration', {
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
  registeredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['tournamentId', 'playerId'],
    },
  ],
});

module.exports = Registration;

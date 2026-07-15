const Player = require('./Player');
const Tournament = require('./Tournament');
const Registration = require('./Registration');
const Score = require('./Score');

// Player <-> Registration
Player.hasMany(Registration, { foreignKey: 'playerId' });
Registration.belongsTo(Player, { foreignKey: 'playerId' });

// Tournament <-> Registration
Tournament.hasMany(Registration, { foreignKey: 'tournamentId' });
Registration.belongsTo(Tournament, { foreignKey: 'tournamentId' });

// Player <-> Score
Player.hasMany(Score, { foreignKey: 'playerId' });
Score.belongsTo(Player, { foreignKey: 'playerId' });

// Tournament <-> Score
Tournament.hasMany(Score, { foreignKey: 'tournamentId' });
Score.belongsTo(Tournament, { foreignKey: 'tournamentId' });

// Convenience: many-to-many through Registration
Player.belongsToMany(Tournament, { through: Registration, foreignKey: 'playerId' });
Tournament.belongsToMany(Player, { through: Registration, foreignKey: 'tournamentId' });

module.exports = { Player, Tournament, Registration, Score };

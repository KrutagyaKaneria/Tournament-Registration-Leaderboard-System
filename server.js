require('dotenv').config();
const express = require('express');
const sequelize = require('./src/config/database');
require('./src/models');
const healthRoutes = require('./src/routes/health');
const playerRoutes = require('./src/routes/playerRoutes');
const tournamentRoutes = require('./src/routes/tournamentRoutes');
const registrationRoutes = require('./src/routes/registrationRoutes');
const scoreRoutes = require('./src/routes/scoreRoutes');
const leaderboardRoutes = require('./src/routes/leaderboardRoutes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(healthRoutes);
app.use('/players', playerRoutes);
app.use('/tournaments', tournamentRoutes);
app.use('/tournaments/:id/register', registrationRoutes);
app.use('/tournaments/:id/score', scoreRoutes);
app.use('/tournaments/:id', leaderboardRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

startServer();

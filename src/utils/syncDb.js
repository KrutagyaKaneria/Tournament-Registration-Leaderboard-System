/**
 * Development-only sync script.
 *
 * WHY alter:true is fine for dev:
 *   Sequelize inspects the current table structure and issues ALTER TABLE
 *   statements to match the model definitions. This lets you iterate on
 *   schemas quickly without writing explicit migration files. The risk is
 *   that data-loss column drops or type changes happen silently — which
 *   is acceptable during local development but never in production.
 *
 * WHY migrations are the production-correct approach:
 *   In production you need repeatable, reversible, version-controlled
 *   schema changes. sequelize-cli (or a dedicated tool like dbmate) lets
 *   you write explicit up/down migrations, review them in PRs, and apply
 *   them in order. This prevents accidental data loss and gives you an
 *   audit trail of every schema change that was applied to a live DB.
 */

require('dotenv').config();
const sequelize = require('../config/database');

// Importing the models file triggers association setup
require('../models');

const syncDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    await sequelize.sync({ alter: true });
    console.log('All models synced (alter: true).');

    process.exit(0);
  } catch (error) {
    console.error('Sync failed:', error.message);
    process.exit(1);
  }
};

syncDb();

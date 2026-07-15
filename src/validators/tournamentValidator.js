const { body } = require('express-validator');

const createTournamentRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string'),
  body('maxPlayers')
    .notEmpty().withMessage('Max players is required')
    .isInt({ min: 1 }).withMessage('Max players must be an integer greater than 0'),
];

module.exports = { createTournamentRules };

const { body } = require('express-validator');

const registerPlayerRules = [
  body('playerId')
    .notEmpty().withMessage('Player ID is required')
    .isUUID().withMessage('Player ID must be a valid UUID'),
];

module.exports = { registerPlayerRules };

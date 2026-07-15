const { body } = require('express-validator');

const submitScoreRules = [
  body('playerId')
    .notEmpty().withMessage('Player ID is required')
    .isUUID().withMessage('Player ID must be a valid UUID'),
  body('score')
    .notEmpty().withMessage('Score is required')
    .isInt({ min: 0 }).withMessage('Score must be a non-negative integer'),
];

module.exports = { submitScoreRules };

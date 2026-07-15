const { body } = require('express-validator');

const createPlayerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email'),
  body('country')
    .trim()
    .notEmpty().withMessage('Country is required')
    .isString().withMessage('Country must be a string'),
];

module.exports = { createPlayerRules };

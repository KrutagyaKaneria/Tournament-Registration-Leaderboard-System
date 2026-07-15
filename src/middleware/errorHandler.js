const {
  ValidationError,
  UniqueConstraintError,
} = require('sequelize');

const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof ValidationError) {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
    });
  }

  if (err instanceof UniqueConstraintError) {
    const messages = err.errors.map((e) => {
      const field = e.path || 'field';
      if (field === 'email') {
        return 'A player with this email already exists';
      }
      return `${field} already exists`;
    });
    return res.status(409).json({
      success: false,
      message: messages.join(', '),
    });
  }

  console.error('Unexpected error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};

module.exports = errorHandler;

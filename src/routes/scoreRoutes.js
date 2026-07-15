const express = require('express');
const router = express.Router({ mergeParams: true });
const { submitScoreRules } = require('../validators/scoreValidator');
const validate = require('../middleware/validate');
const { submitScore } = require('../controllers/scoreController');

router.post('/', submitScoreRules, validate, submitScore);

module.exports = router;

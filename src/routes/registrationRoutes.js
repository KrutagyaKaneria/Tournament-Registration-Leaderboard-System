const express = require('express');
const router = express.Router({ mergeParams: true });
const { registerPlayerRules } = require('../validators/registrationValidator');
const validate = require('../middleware/validate');
const { registerPlayer } = require('../controllers/registrationController');

router.post('/', registerPlayerRules, validate, registerPlayer);

module.exports = router;

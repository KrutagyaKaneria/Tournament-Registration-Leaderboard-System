const express = require('express');
const router = express.Router();
const { createPlayerRules } = require('../validators/playerValidator');
const validate = require('../middleware/validate');
const {
  createPlayer,
  getPlayer,
  getAllPlayers,
} = require('../controllers/playerController');

router.post('/', createPlayerRules, validate, createPlayer);
router.get('/:id', getPlayer);
router.get('/', getAllPlayers);

module.exports = router;

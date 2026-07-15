const express = require('express');
const router = express.Router();
const { createTournamentRules } = require('../validators/tournamentValidator');
const validate = require('../middleware/validate');
const {
  createTournament,
  getTournament,
  getAllTournaments,
} = require('../controllers/tournamentController');

router.post('/', createTournamentRules, validate, createTournament);
router.get('/:id', getTournament);
router.get('/', getAllTournaments);

module.exports = router;

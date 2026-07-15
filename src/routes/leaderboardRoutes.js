const express = require('express');
const router = express.Router({ mergeParams: true });
const { getLeaderboard, getPlayerRank } = require('../controllers/leaderboardController');

router.get('/leaderboard', getLeaderboard);
router.get('/player/:playerId', getPlayerRank);

module.exports = router;

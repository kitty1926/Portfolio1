const express = require('express');
const pool = require('../db');
const { requireAuth, attachProfile } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, attachProfile);

// GET /api/analytics — my view count and last-visited time
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM analytics WHERE profile_id = $1', [req.profileId]);
    res.json(rows[0] || { profile_id: req.profileId, viewers_collect: 0, visited_time: null });
  } catch (err) { next(err); }
});

module.exports = router;

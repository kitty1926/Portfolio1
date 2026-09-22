const express = require('express');
const pool = require('../db');
const { requireAuth, attachProfile } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, attachProfile);

// GET /api/messages — my inbox, newest first
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM contact_message WHERE profile_id = $1 ORDER BY sent_at DESC',
      [req.profileId]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// DELETE /api/messages/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM contact_message WHERE message_id = $1 AND profile_id = $2',
      [req.params.id, req.profileId]
    );
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;

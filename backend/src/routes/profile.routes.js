const express = require('express');
const pool = require('../db');
const { requireAuth, attachProfile } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();
router.use(requireAuth, attachProfile);

const EDITABLE_FIELDS = ['first_name', 'middle_name', 'last_name', 'bio', 'is_public'];

// GET /api/profile — my own profile
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM profile WHERE profile_id = $1', [req.profileId]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/profile — update name/bio/visibility
router.put('/', async (req, res, next) => {
  try {
    const cols = EDITABLE_FIELDS.filter((f) => f in req.body);
    if (!cols.length) return res.status(400).json({ error: 'No valid fields provided' });
    const setClause = cols.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const values = cols.map((f) => req.body[f]);
    const { rows } = await pool.query(
      `UPDATE profile SET ${setClause} WHERE profile_id = $1 RETURNING *`,
      [req.profileId, ...values]
    );
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /api/profile/photo — multipart upload, field name "photo"
router.post('/photo', upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No photo uploaded (field name must be "photo")' });
    const photoUrl = `/uploads/${req.file.filename}`;
    const { rows } = await pool.query(
      'UPDATE profile SET photo_url = $1 WHERE profile_id = $2 RETURNING *',
      [photoUrl, req.profileId]
    );
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/profile/photo — remove the current photo
router.delete('/photo', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'UPDATE profile SET photo_url = NULL WHERE profile_id = $1 RETURNING *',
      [req.profileId]
    );
    res.json(rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;

const jwt = require('jsonwebtoken');
const pool = require('../db');

// Checks the Authorization: Bearer <token> header and sets req.userId.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Looks up the profile row that belongs to req.userId and sets req.profileId.
// Must run after requireAuth. Every resource (education, experience, etc.)
// is scoped to profile_id, so this keeps that lookup in one place.
async function attachProfile(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT profile_id FROM profile WHERE user_id = $1', [req.userId]);
    if (!rows.length) return res.status(404).json({ error: 'No profile found for this account' });
    req.profileId = rows[0].profile_id;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth, attachProfile };

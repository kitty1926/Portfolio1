const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

// POST /api/auth/register  { email, password, first_name?, last_name? }
// Creates the user row AND an empty profile row for them in one step,
// since every user needs exactly one profile (see profile.user_id UNIQUE).
router.post('/register', async (req, res, next) => {
  const { email, password, first_name, last_name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
  if (password.length < 8) return res.status(400).json({ error: 'password must be at least 8 characters' });

  const client = await pool.connect();
  try {
    const existing = await client.query('SELECT user_id FROM "user" WHERE email = $1', [email]);
    if (existing.rows.length) return res.status(409).json({ error: 'An account with that email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);

    await client.query('BEGIN');
    const userResult = await client.query(
      'INSERT INTO "user" (email, password, role) VALUES ($1, $2, $3) RETURNING user_id, email, role, created_at',
      [email, passwordHash, 'user']
    );
    const user = userResult.rows[0];

    const profileResult = await client.query(
      'INSERT INTO profile (user_id, first_name, last_name, is_public) VALUES ($1, $2, $3, false) RETURNING *',
      [user.user_id, first_name || '', last_name || '']
    );

    // Starter social links so contact info is ready to fill in from day one.
    const profileId = profileResult.rows[0].profile_id;
    const starterLinks = [
      ['Email', `mailto:${email}`],
      ['GitHub', ''],
      ['Facebook', '']
    ];
    for (const [platform_name, url] of starterLinks) {
      await client.query(
        'INSERT INTO social_link (profile_id, platform_name, url) VALUES ($1, $2, $3)',
        [profileId, platform_name, url]
      );
    }

    await client.query('COMMIT');

    const token = signToken(user.user_id);
    res.status(201).json({ token, user, profile: profileResult.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// POST /api/auth/login  { email, password }
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  try {
    const { rows } = await pool.query('SELECT * FROM "user" WHERE email = $1', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Incorrect email or password' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Incorrect email or password' });

    const token = signToken(user.user_id);
    delete user.password;
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

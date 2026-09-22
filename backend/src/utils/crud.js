const express = require('express');
const pool = require('../db');
const { requireAuth, attachProfile } = require('../middleware/auth');

// Builds a router with GET/POST/PUT/DELETE for a table that is scoped to the
// caller's profile_id. Used for education, experience, skills, tech_stack,
// social_link, and testimonial — all of them are just "a list of rows that
// belong to my profile" with no extra behavior beyond that.
function crudRouter({ table, idColumn, fields }) {
  const router = express.Router();
  router.use(requireAuth, attachProfile);
function sanitize(value) {
  return value === '' ? null : value;
}
  // List everything that belongs to my profile.
  router.get('/', async (req, res, next) => {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM ${table} WHERE profile_id = $1 ORDER BY ${idColumn} ASC`,
        [req.profileId]
      );
      res.json(rows);
    } catch (err) { next(err); }
  });

  // Create a new row under my profile.
  router.post('/', async (req, res, next) => {
    try {
      const cols = fields.filter((f) => f in req.body);
      if (!cols.length) return res.status(400).json({ error: 'No valid fields provided' });
      const values = cols.map((f) => sanitize(req.body[f]));
      const placeholders = cols.map((_, i) => `$${i + 2}`).join(', ');
      const { rows } = await pool.query(
        `INSERT INTO ${table} (profile_id, ${cols.join(', ')}) VALUES ($1, ${placeholders}) RETURNING *`,
        [req.profileId, ...values]
      );
      res.status(201).json(rows[0]);
    } catch (err) { next(err); }
  });

  // Update a row I own.
  router.put('/:id', async (req, res, next) => {
    try {
      const cols = fields.filter((f) => f in req.body);
      if (!cols.length) return res.status(400).json({ error: 'No valid fields provided' });
      const setClause = cols.map((f, i) => `${f} = $${i + 3}`).join(', ');
      const values = cols.map((f) => sanitize(req.body[f]));
      const { rows } = await pool.query(
        `UPDATE ${table} SET ${setClause} WHERE ${idColumn} = $1 AND profile_id = $2 RETURNING *`,
        [req.params.id, req.profileId, ...values]
      );
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    } catch (err) { next(err); }
  });

  // Delete a row I own.
  router.delete('/:id', async (req, res, next) => {
    try {
      const { rowCount } = await pool.query(
        `DELETE FROM ${table} WHERE ${idColumn} = $1 AND profile_id = $2`,
        [req.params.id, req.profileId]
      );
      if (!rowCount) return res.status(404).json({ error: 'Not found' });
      res.status(204).end();
    } catch (err) { next(err); }
  });

  return router;
}

module.exports = { crudRouter };

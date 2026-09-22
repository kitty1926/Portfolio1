const express = require('express');
const pool = require('../db');
const { requireAuth, attachProfile } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, attachProfile);

const PROJECT_FIELDS = ['title', 'description', 'demo_url', 'is_featured', 'display_order'];

// GET /api/projects — my projects, each with its media attached
router.get('/', async (req, res, next) => {
  try {
    const { rows: projects } = await pool.query(
      'SELECT * FROM project WHERE profile_id = $1 ORDER BY display_order ASC, project_id ASC',
      [req.profileId]
    );
    if (!projects.length) return res.json([]);

    const projectIds = projects.map((p) => p.project_id);
    const { rows: media } = await pool.query(
      'SELECT * FROM project_media WHERE project_id = ANY($1::int[]) ORDER BY display_order ASC',
      [projectIds]
    );
    const mediaByProject = {};
    for (const m of media) {
      (mediaByProject[m.project_id] = mediaByProject[m.project_id] || []).push(m);
    }
    res.json(projects.map((p) => ({ ...p, media: mediaByProject[p.project_id] || [] })));
  } catch (err) { next(err); }
});

// POST /api/projects
router.post('/', async (req, res, next) => {
  try {
    const cols = PROJECT_FIELDS.filter((f) => f in req.body);
    const values = cols.map((f) => req.body[f]);
    const placeholders = cols.map((_, i) => `$${i + 2}`).join(', ');
    const { rows } = await pool.query(
      `INSERT INTO project (profile_id, ${cols.join(', ')}) VALUES ($1, ${placeholders}) RETURNING *`,
      [req.profileId, ...values]
    );
    res.status(201).json({ ...rows[0], media: [] });
  } catch (err) { next(err); }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res, next) => {
  try {
    const cols = PROJECT_FIELDS.filter((f) => f in req.body);
    if (!cols.length) return res.status(400).json({ error: 'No valid fields provided' });
    const setClause = cols.map((f, i) => `${f} = $${i + 3}`).join(', ');
    const values = cols.map((f) => req.body[f]);
    const { rows } = await pool.query(
      `UPDATE project SET ${setClause} WHERE project_id = $1 AND profile_id = $2 RETURNING *`,
      [req.params.id, req.profileId, ...values]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/projects/:id — project_media rows go with it (ON DELETE CASCADE)
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM project WHERE project_id = $1 AND profile_id = $2',
      [req.params.id, req.profileId]
    );
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) { next(err); }
});

// Confirms :projectId belongs to the caller before touching its media.
async function ownsProject(profileId, projectId) {
  const { rows } = await pool.query(
    'SELECT project_id FROM project WHERE project_id = $1 AND profile_id = $2',
    [projectId, profileId]
  );
  return rows.length > 0;
}

// POST /api/projects/:id/media  { media_url, display_order }
router.post('/:id/media', async (req, res, next) => {
  try {
    if (!(await ownsProject(req.profileId, req.params.id))) return res.status(404).json({ error: 'Project not found' });
    const { media_url, display_order = 0 } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO project_media (project_id, media_url, display_order) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, media_url, display_order]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/projects/:id/media/:mediaId  { media_url?, display_order? }
router.put('/:id/media/:mediaId', async (req, res, next) => {
  try {
    if (!(await ownsProject(req.profileId, req.params.id))) return res.status(404).json({ error: 'Project not found' });
    const cols = ['media_url', 'display_order'].filter((f) => f in req.body);
    if (!cols.length) return res.status(400).json({ error: 'No valid fields provided' });
    const setClause = cols.map((f, i) => `${f} = $${i + 3}`).join(', ');
    const values = cols.map((f) => req.body[f]);
    const { rows } = await pool.query(
      `UPDATE project_media SET ${setClause} WHERE project_media_id = $1 AND project_id = $2 RETURNING *`,
      [req.params.mediaId, req.params.id, ...values]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/projects/:id/media/:mediaId
router.delete('/:id/media/:mediaId', async (req, res, next) => {
  try {
    if (!(await ownsProject(req.profileId, req.params.id))) return res.status(404).json({ error: 'Project not found' });
    const { rowCount } = await pool.query(
      'DELETE FROM project_media WHERE project_media_id = $1 AND project_id = $2',
      [req.params.mediaId, req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;

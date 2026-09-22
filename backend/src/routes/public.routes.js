const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET /api/public/:profileId — everything needed to render one public portfolio.
// Records a view in `analytics` on every call. Returns 404 if the profile
// doesn't exist or its owner has turned off is_public.
router.get('/:profileId', async (req, res, next) => {
  const { profileId } = req.params;
  try {
    const { rows: profiles } = await pool.query(
      'SELECT profile_id, first_name, middle_name, last_name, bio, photo_url FROM profile WHERE profile_id = $1 AND is_public = true',
      [profileId]
    );
    if (!profiles.length) return res.status(404).json({ error: 'This portfolio is not available' });
    const profile = profiles[0];

    const [education, experience, projectsResult, skills, techStack, socialLinks, testimonials] = await Promise.all([
      pool.query('SELECT * FROM education WHERE profile_id = $1 ORDER BY start_date DESC NULLS LAST', [profileId]),
      pool.query('SELECT * FROM experience WHERE profile_id = $1 ORDER BY is_current DESC, start_date DESC NULLS LAST', [profileId]),
      pool.query('SELECT * FROM project WHERE profile_id = $1 ORDER BY display_order ASC', [profileId]),
      pool.query('SELECT * FROM skills WHERE profile_id = $1', [profileId]),
      pool.query('SELECT * FROM tech_stack WHERE profile_id = $1', [profileId]),
      pool.query('SELECT * FROM social_link WHERE profile_id = $1', [profileId]),
      pool.query('SELECT * FROM testimonial WHERE profile_id = $1 AND is_approved = true ORDER BY date_given DESC NULLS LAST', [profileId])
    ]);

    const projects = projectsResult.rows;
    let media = [];
    if (projects.length) {
      const projectIds = projects.map((p) => p.project_id);
      const mediaResult = await pool.query(
        'SELECT * FROM project_media WHERE project_id = ANY($1::int[]) ORDER BY display_order ASC',
        [projectIds]
      );
      media = mediaResult.rows;
    }
    const mediaByProject = {};
    for (const m of media) (mediaByProject[m.project_id] = mediaByProject[m.project_id] || []).push(m);

    // Fire-and-forget: record the view without slowing down the response.
    pool.query(
      `INSERT INTO analytics (profile_id, viewers_collect, visited_time)
       VALUES ($1, 1, now())
       ON CONFLICT (profile_id)
       DO UPDATE SET viewers_collect = analytics.viewers_collect + 1, visited_time = now()`,
      [profileId]
    ).catch((err) => console.error('Failed to record analytics view:', err.message));

    res.json({
      profile,
      education: education.rows,
      experience: experience.rows,
      projects: projects.map((p) => ({ ...p, media: mediaByProject[p.project_id] || [] })),
      skills: skills.rows,
      tech_stack: techStack.rows,
      social_link: socialLinks.rows,
      testimonial: testimonials.rows
    });
  } catch (err) { next(err); }
});

// POST /api/public/:profileId/contact — a visitor sends a message.
// No auth required; anyone viewing the public page can use this.
router.post('/:profileId/contact', async (req, res, next) => {
  const { profileId } = req.params;
  const { sender_name, sender_email, subject, message_content } = req.body;
  if (!sender_name || !sender_email || !message_content) {
    return res.status(400).json({ error: 'sender_name, sender_email, and message_content are required' });
  }
  try {
    const { rows: profiles } = await pool.query(
      'SELECT profile_id FROM profile WHERE profile_id = $1 AND is_public = true',
      [profileId]
    );
    if (!profiles.length) return res.status(404).json({ error: 'This portfolio is not available' });

    const { rows } = await pool.query(
      `INSERT INTO contact_message (profile_id, sender_name, sender_email, subject, message_content)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [profileId, sender_name, sender_email, subject || null, message_content]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const projectRoutes = require('./routes/project.routes');
const messagesRoutes = require('./routes/messages.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const publicRoutes = require('./routes/public.routes');
const { crudRouter } = require('./utils/crud');

const app = express();

app.use(cors({ origin: (process.env.CORS_ORIGIN || '*').split(',') }));
app.use(express.json({ limit: '2mb' }));

// Uploaded profile photos are served as static files, e.g. GET /uploads/xyz.jpg
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/public', publicRoutes);

// Simple profile-scoped resources — same shape, so they share one factory.
app.use('/api/education', crudRouter({
  table: 'education', idColumn: 'education_id',
  fields: ['institution_name', 'degree', 'field_of_study', 'start_date', 'end_date', 'description']
}));
app.use('/api/experience', crudRouter({
  table: 'experience', idColumn: 'experience_id',
  fields: ['company_name', 'job_title', 'start_date', 'end_date', 'is_current', 'description']
}));
app.use('/api/skills', crudRouter({
  table: 'skills', idColumn: 'skill_id',
  fields: ['category', 'year_acquired', 'certification']
}));
app.use('/api/tech-stack', crudRouter({
  table: 'tech_stack', idColumn: 'tech_stack_id',
  fields: ['technology_name', 'category', 'proficiency_level']
}));
app.use('/api/social-links', crudRouter({
  table: 'social_link', idColumn: 'social_link_id',
  fields: ['platform_name', 'url']
}));
app.use('/api/testimonials', crudRouter({
  table: 'testimonial', idColumn: 'testimonial_id',
  fields: ['author_name', 'author_title', 'content', 'date_given', 'is_approved']
}));

// 404 for anything under /api that didn't match a route above.
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Central error handler — every route above calls next(err) on failure.
app.use((err, req, res, next) => {
  console.error(err);
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Folio API listening on http://localhost:${PORT}`));

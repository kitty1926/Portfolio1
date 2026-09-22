require('dotenv').config();
const pool = require('./db');

const TABLES = [
  'contact_message', 'analytics', 'testimonial', 'tech_stack', 'social_link',
  'skills', 'project_media', 'project', 'experience', 'education', 'profile', '"user"'
];

async function reset() {
  console.log('Dropping existing tables (if any)...');
  for (const table of TABLES) {
    await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
    console.log(`  dropped ${table}`);
  }
  console.log('Done. Now run: npm run migrate');
  await pool.end();
}

reset().catch((err) => {
  console.error('Reset failed:', err.message);
  process.exit(1);
});
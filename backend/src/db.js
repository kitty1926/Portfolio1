const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.warn('Warning: DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
}

function connectionStringWithoutSslMode(urlStr) {
  try {
    const url = new URL(urlStr);
    url.searchParams.delete('sslmode');
    return url.toString();
  } catch (err) {
    return urlStr;
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
    ? connectionStringWithoutSslMode(process.env.DATABASE_URL)
    : undefined,
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;
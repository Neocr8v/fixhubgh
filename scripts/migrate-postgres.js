const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { Pool } = require('pg');

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error('Set POSTGRES_URL or DATABASE_URL before running this command.');

const sqlite = new DatabaseSync(process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'hostel.db'));
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL, room TEXT, hostel TEXT, specialty TEXT, avatar_url TEXT, phone TEXT, bio TEXT, is_active INTEGER NOT NULL DEFAULT 1, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS hostels (id TEXT PRIMARY KEY, name TEXT UNIQUE NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS issues (id TEXT PRIMARY KEY, ticket_no TEXT UNIQUE NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL, priority TEXT NOT NULL DEFAULT 'normal', status TEXT NOT NULL DEFAULT 'reported', room TEXT NOT NULL, hostel TEXT NOT NULL DEFAULT 'Main', image_data TEXT, student_id TEXT NOT NULL REFERENCES users(id), technician_id TEXT REFERENCES users(id), duplicate_of TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), resolved_at TIMESTAMPTZ);
    CREATE TABLE IF NOT EXISTS updates (id TEXT PRIMARY KEY, issue_id TEXT NOT NULL REFERENCES issues(id), actor_id TEXT, message TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS hostel TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active INTEGER NOT NULL DEFAULT 1;
    ALTER TABLE issues ADD COLUMN IF NOT EXISTS hostel TEXT NOT NULL DEFAULT 'Main';
  `);
  await pool.query('BEGIN');
  try {
    const tables = ['users', 'hostels', 'issues', 'updates'];
    for (const table of tables) {
      const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
      if (rows.length === 0) continue;
      const columns = Object.keys(rows[0]);
      const values = rows.flatMap((row) => columns.map((column) => row[column]));
      const placeholders = rows.map((_, rowIndex) => `(${columns.map((_, columnIndex) => `$${rowIndex * columns.length + columnIndex + 1}`).join(', ')})`).join(', ');
      const conflict = table === 'hostels' ? 'name' : 'id';
      const updates = columns.filter((column) => column !== 'id').map((column) => `"${column}" = EXCLUDED."${column}"`).join(', ');
      await pool.query(
        `INSERT INTO "${table}" (${columns.map((column) => `"${column}"`).join(', ')}) VALUES ${placeholders}
         ON CONFLICT ("${conflict}") DO UPDATE SET ${updates}`,
        values
      );
      console.log(`Migrated ${rows.length} ${table}.`);
    }
    await pool.query('COMMIT');
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  } finally {
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { HOSTELS } from './constants';

const DATA_DIR = path.join(process.cwd(), 'data');
const POSTGRES_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL || '';

type SqliteStatement = { all: (...params: unknown[]) => unknown[]; get: (...params: unknown[]) => unknown; run: (...params: unknown[]) => unknown };
type SqliteDatabase = { exec: (sql: string) => void; prepare: (sql: string) => SqliteStatement };

declare global {
  // eslint-disable-next-line no-var
  var __hostelDb: SqliteDatabase | undefined;
  // eslint-disable-next-line no-var
  var __hostelPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __hostelPostgresReady: Promise<void> | undefined;
}

export interface DbStatement {
  all: (...params: unknown[]) => Promise<unknown[]>;
  get: (...params: unknown[]) => Promise<unknown>;
  run: (...params: unknown[]) => Promise<{ changes: number }>;
}
export interface Database { prepare: (sql: string) => DbStatement }

function createSqliteConnection(): SqliteDatabase {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const loadSqlite = eval('require') as (name: string) => { DatabaseSync: new (file: string) => SqliteDatabase };
  const sqlite = loadSqlite('node:sqlite');
  const conn = new sqlite.DatabaseSync(path.join(DATA_DIR, 'hostel.db'));
  conn.exec('PRAGMA busy_timeout = 5000;');
  conn.exec(`
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL, room TEXT, hostel TEXT, specialty TEXT, avatar_url TEXT, phone TEXT, bio TEXT, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS hostels (id TEXT PRIMARY KEY, name TEXT UNIQUE NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS issues (id TEXT PRIMARY KEY, ticket_no TEXT UNIQUE NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL, priority TEXT NOT NULL DEFAULT 'normal', status TEXT NOT NULL DEFAULT 'reported', room TEXT NOT NULL, hostel TEXT NOT NULL DEFAULT 'Main', image_data TEXT, student_id TEXT NOT NULL, technician_id TEXT, duplicate_of TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')), resolved_at TEXT);
    CREATE TABLE IF NOT EXISTS updates (id TEXT PRIMARY KEY, issue_id TEXT NOT NULL, actor_id TEXT, message TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));
  `);
  const hostelCount = Number((conn.prepare('SELECT COUNT(*) AS count FROM hostels').get() as { count?: number }).count ?? 0);
  if (hostelCount === 0) {
    const insertHostel = conn.prepare('INSERT INTO hostels (id, name) VALUES (?, ?)');
    for (const name of HOSTELS) insertHostel.run(`h_${nanoid(10)}`, name);
  }
  const userCount = Number((conn.prepare('SELECT COUNT(*) AS count FROM users').get() as { count?: number }).count ?? 0);
  if (userCount === 0) {
    const hash = (password: string) => bcrypt.hashSync(password, 10);
    const insertUser = conn.prepare('INSERT INTO users (id, name, email, password_hash, role, room, hostel, specialty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    insertUser.run('u_admin', 'Dara Whitfield', 'admin@hostel.edu', hash('admin123'), 'admin', null, null, null);
    insertUser.run('u_tech1', 'Marcus Reid', 'marcus.reid@hostel.edu', hash('tech123'), 'technician', null, null, 'Electrical');
    insertUser.run('u_tech2', 'Ines Okafor', 'ines.okafor@hostel.edu', hash('tech123'), 'technician', null, null, 'Plumbing');
    insertUser.run('u_tech3', 'Sam Lindqvist', 'sam.lindqvist@hostel.edu', hash('tech123'), 'technician', null, null, 'General/Furniture');
    insertUser.run('u_student1', 'Priya Nandan', 'priya.n@student.edu', hash('student123'), 'student', 'B-214', 'Main', null);
    insertUser.run('u_student2', 'Tom Achebe', 'tom.a@student.edu', hash('student123'), 'student', 'A-108', 'North', null);
  }
  return conn;
}

function normalizeSql(sql: string) {
  return sql
    .replace(/datetime\(\s*['"]now['"]\s*\)/gi, 'NOW()')
    .replace(/julianday\(([^()]+)\)\s*-\s*julianday\(([^()]+)\)/gi, '(EXTRACT(EPOCH FROM (($1)::timestamptz - ($2)::timestamptz)) / 86400)')
    .replace(/date\(([^()]+)\)/gi, '(($1)::date)')
    .replace(/\?/g, (_match, offset: number, full: string) => `$${(full.slice(0, offset).match(/\?/g) ?? []).length + 1}`);
}

function getPostgresPool() {
  if (!global.__hostelPool) global.__hostelPool = new Pool({ connectionString: POSTGRES_URL, ssl: { rejectUnauthorized: false } });
  return global.__hostelPool;
}

async function initializePostgres() {
  const pool = getPostgresPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('student','admin','technician')), room TEXT, hostel TEXT, specialty TEXT, avatar_url TEXT, phone TEXT, bio TEXT, is_active INTEGER NOT NULL DEFAULT 1, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS hostels (id TEXT PRIMARY KEY, name TEXT UNIQUE NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS issues (id TEXT PRIMARY KEY, ticket_no TEXT UNIQUE NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL, priority TEXT NOT NULL DEFAULT 'normal', status TEXT NOT NULL DEFAULT 'reported', room TEXT NOT NULL, hostel TEXT NOT NULL DEFAULT 'Main', image_data TEXT, student_id TEXT NOT NULL REFERENCES users(id), technician_id TEXT REFERENCES users(id), duplicate_of TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), resolved_at TIMESTAMPTZ);
    CREATE TABLE IF NOT EXISTS updates (id TEXT PRIMARY KEY, issue_id TEXT NOT NULL REFERENCES issues(id), actor_id TEXT, message TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
    CREATE INDEX IF NOT EXISTS idx_issues_student ON issues(student_id);
    CREATE INDEX IF NOT EXISTS idx_issues_tech ON issues(technician_id);
    CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
    CREATE INDEX IF NOT EXISTS idx_updates_issue ON updates(issue_id);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS hostel TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active INTEGER NOT NULL DEFAULT 1;
    ALTER TABLE issues ADD COLUMN IF NOT EXISTS hostel TEXT NOT NULL DEFAULT 'Main';
  `);
  for (const name of HOSTELS) await pool.query('INSERT INTO hostels (id, name) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING', [`h_${nanoid(10)}`, name]);

  const count = Number((await pool.query('SELECT COUNT(*) AS count FROM users')).rows[0]?.count ?? 0);
  if (count > 0) return;
  const hash = (password: string) => bcrypt.hashSync(password, 10);
  const users = [
    ['u_admin', 'Dara Whitfield', 'admin@hostel.edu', hash('admin123'), 'admin', null, null, null],
    ['u_tech1', 'Marcus Reid', 'marcus.reid@hostel.edu', hash('tech123'), 'technician', null, null, 'Electrical'],
    ['u_tech2', 'Ines Okafor', 'ines.okafor@hostel.edu', hash('tech123'), 'technician', null, null, 'Plumbing'],
    ['u_tech3', 'Sam Lindqvist', 'sam.lindqvist@hostel.edu', hash('tech123'), 'technician', null, null, 'General/Furniture'],
    ['u_student1', 'Priya Nandan', 'priya.n@student.edu', hash('student123'), 'student', 'B-214', 'Main', null],
    ['u_student2', 'Tom Achebe', 'tom.a@student.edu', hash('student123'), 'student', 'A-108', 'North', null],
  ];
  for (const user of users) await pool.query('INSERT INTO users (id, name, email, password_hash, role, room, hostel, specialty) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', user);
}

function postgresReady() {
  if (!global.__hostelPostgresReady) {
    global.__hostelPostgresReady = initializePostgres().catch((error) => { global.__hostelPostgresReady = undefined; throw error; });
  }
  return global.__hostelPostgresReady;
}

function createPostgresFacade(): Database {
  const pool = getPostgresPool();
  return { prepare(sql) {
    const normalized = normalizeSql(sql);
    return {
      all: async (...params) => { await postgresReady(); return (await pool.query(normalized, params)).rows; },
      get: async (...params) => { await postgresReady(); return (await pool.query(normalized, params)).rows[0]; },
      run: async (...params) => { await postgresReady(); return { changes: (await pool.query(normalized, params)).rowCount ?? 0 }; },
    };
  } };
}

function createSqliteFacade(): Database {
  const sqliteDb = global.__hostelDb ?? createSqliteConnection();
  if (process.env.NODE_ENV !== 'production') global.__hostelDb = sqliteDb;
  return { prepare(sql) {
    return {
      all: async (...params) => sqliteDb.prepare(sql).all(...params),
      get: async (...params) => sqliteDb.prepare(sql).get(...params),
      run: async (...params) => ({ changes: Number((sqliteDb.prepare(sql).run(...params) as { changes?: number }).changes ?? 0) }),
    };
  } };
}

export const db: Database = POSTGRES_URL ? createPostgresFacade() : createSqliteFacade();
export type Role = 'student' | 'admin' | 'technician';
export interface UserRow { id: string; name: string; email: string; password_hash: string; role: Role; room: string | null; hostel: string | null; specialty: string | null; avatar_url: string | null; phone: string | null; bio: string | null; is_active: number; created_at: string; }
export interface IssueRow { id: string; ticket_no: string; title: string; description: string; category: string; priority: string; status: string; room: string; hostel: string; image_data: string | null; student_id: string; technician_id: string | null; duplicate_of: string | null; created_at: string; updated_at: string; resolved_at: string | null; }
export interface UpdateRow { id: string; issue_id: string; actor_id: string | null; message: string; created_at: string; }

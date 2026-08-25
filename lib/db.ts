import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { HOSTELS } from './constants';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'hostel.db');

declare global {
  // eslint-disable-next-line no-var
  var __hostelDb: DatabaseSync | undefined;
}

function createConnection() {
  const conn = new DatabaseSync(DB_PATH);
  conn.exec('PRAGMA journal_mode = WAL;');
  return conn;
}

export const db = global.__hostelDb ?? createConnection();
if (process.env.NODE_ENV !== 'production') global.__hostelDb = db;

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('student','admin','technician')),
      room TEXT,
      hostel TEXT,
      specialty TEXT,
      avatar_url TEXT,
      phone TEXT,
      bio TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS hostels (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      ticket_no TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'normal',
      status TEXT NOT NULL DEFAULT 'reported',
      room TEXT NOT NULL,
      image_data TEXT,
      student_id TEXT NOT NULL,
      technician_id TEXT,
      duplicate_of TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      resolved_at TEXT,
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (technician_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS updates (
      id TEXT PRIMARY KEY,
      issue_id TEXT NOT NULL,
      actor_id TEXT,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (issue_id) REFERENCES issues(id)
    );

    CREATE INDEX IF NOT EXISTS idx_issues_student ON issues(student_id);
    CREATE INDEX IF NOT EXISTS idx_issues_tech ON issues(technician_id);
    CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
    CREATE INDEX IF NOT EXISTS idx_updates_issue ON updates(issue_id);
  `);

  const schemaInfo = db.prepare(`PRAGMA table_info(users)`).all() as { name: string }[];
  if (!schemaInfo.some((field) => field.name === 'is_active')) {
    db.exec(`ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;`);
  }
  if (!schemaInfo.some((field) => field.name === 'avatar_url')) {
    db.exec(`ALTER TABLE users ADD COLUMN avatar_url TEXT;`);
  }
  if (!schemaInfo.some((field) => field.name === 'phone')) {
    db.exec(`ALTER TABLE users ADD COLUMN phone TEXT;`);
  }
  if (!schemaInfo.some((field) => field.name === 'bio')) {
    db.exec(`ALTER TABLE users ADD COLUMN bio TEXT;`);
  }
  if (!schemaInfo.some((field) => field.name === 'hostel')) {
    db.exec(`ALTER TABLE users ADD COLUMN hostel TEXT;`);
  }

  const hostelCount = (db.prepare('SELECT COUNT(*) as c FROM hostels').get() as unknown as { c: number }).c;
  if (hostelCount === 0) {
    const insertHostel = db.prepare('INSERT INTO hostels (id, name) VALUES (?, ?)');
    for (const name of HOSTELS) {
      insertHostel.run(`h_${nanoid(10)}`, name);
    }
  }

  const issueSchemaInfo = db.prepare(`PRAGMA table_info(issues)`).all() as { name: string }[];
  if (!issueSchemaInfo.some((field) => field.name === 'hostel')) {
    db.exec(`ALTER TABLE issues ADD COLUMN hostel TEXT NOT NULL DEFAULT 'Main';`);
  }

  const userCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as unknown as { c: number }).c;
  if (userCount === 0) {
    const insert = db.prepare(
      `INSERT INTO users (id, name, email, password_hash, role, room, hostel, specialty, avatar_url, phone, bio, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const hash = (pw: string) => bcrypt.hashSync(pw, 10);

    insert.run('u_admin', 'Dara Whitfield', 'admin@hostel.edu', hash('admin123'), 'admin', null, null, null, null, null, null, 1);
    insert.run('u_tech1', 'Marcus Reid', 'marcus.reid@hostel.edu', hash('tech123'), 'technician', null, null, 'Electrical', null, null, null, 1);
    insert.run('u_tech2', 'Ines Okafor', 'ines.okafor@hostel.edu', hash('tech123'), 'technician', null, null, 'Plumbing', null, null, null, 1);
    insert.run('u_tech3', 'Sam Lindqvist', 'sam.lindqvist@hostel.edu', hash('tech123'), 'technician', null, null, 'General/Furniture', null, null, null, 1);
    insert.run('u_student1', 'Priya Nandan', 'priya.n@student.edu', hash('student123'), 'student', 'B-214', 'Main', null, null, null, null, 1);
    insert.run('u_student2', 'Tom Achebe', 'tom.a@student.edu', hash('student123'), 'student', 'A-108', 'North', null, null, null, null, 1);

    const now = new Date();
    const daysAgo = (n: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - n);
      return d.toISOString().slice(0, 19).replace('T', ' ');
    };

    const insertIssue = db.prepare(`
      INSERT INTO issues (id, ticket_no, title, description, category, priority, status, room, hostel, student_id, technician_id, created_at, updated_at, resolved_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedIssues: [string, string, string, string, string, string, string, string, string, string, string | null, number, number, number | null][] = [
      ['i1', 'HM-0001', 'Flickering ceiling light', 'The ceiling light in the room flickers constantly and buzzes at night.', 'Electrical', 'normal', 'resolved', 'B-214', 'Main', 'u_student1', 'u_tech1', 9, 7, 7],
      ['i2', 'HM-0002', 'Leaking sink pipe', 'Water is pooling under the bathroom sink every morning.', 'Plumbing', 'high', 'in_progress', 'A-108', 'North', 'u_student2', 'u_tech2', 5, 2, null],
      ['i3', 'HM-0003', 'No internet connection', 'Ethernet port in the room has had no connection for two days.', 'Internet', 'urgent', 'assigned', 'B-214', 'Main', 'u_student1', 'u_tech3', 3, 1, null],
      ['i4', 'HM-0004', 'Broken wardrobe hinge', 'One door of the wardrobe has fallen off its hinge.', 'Furniture', 'low', 'reported', 'A-108', 'South', 'u_student2', null, 1, 1, null],
      ['i5', 'HM-0005', 'Power socket not working', 'The socket near the desk has stopped supplying power.', 'Electrical', 'normal', 'resolved', 'B-214', 'Main', 'u_student1', 'u_tech1', 14, 12, 12],
      ['i6', 'HM-0006', 'Blocked drain in shower', 'Shower drains very slowly and water backs up.', 'Plumbing', 'high', 'resolved', 'A-108', 'North', 'u_student2', 'u_tech2', 11, 9, 9],
    ];

    for (const row of seedIssues) {
      insertIssue.run(
        row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10],
        daysAgo(row[11]), daysAgo(row[12]), row[13] !== null ? daysAgo(row[13]) : null
      );
    }

    const insertUpdate = db.prepare(
      `INSERT INTO updates (id, issue_id, actor_id, message, created_at) VALUES (?, ?, ?, ?, ?)`
    );
    insertUpdate.run('up1', 'i1', 'u_student1', 'Issue reported by student.', daysAgo(9));
    insertUpdate.run('up2', 'i1', 'u_admin', 'Assigned to Marcus Reid (Electrical).', daysAgo(8));
    insertUpdate.run('up3', 'i1', 'u_tech1', 'Replaced faulty ballast. Marked resolved.', daysAgo(7));
    insertUpdate.run('up4', 'i2', 'u_student2', 'Issue reported by student.', daysAgo(5));
    insertUpdate.run('up5', 'i2', 'u_admin', 'Assigned to Ines Okafor (Plumbing).', daysAgo(4));
    insertUpdate.run('up6', 'i2', 'u_tech2', 'Inspected pipe, ordering replacement gasket.', daysAgo(2));
    insertUpdate.run('up7', 'i3', 'u_student1', 'Issue reported by student. Flagged urgent — needed for coursework.', daysAgo(3));
    insertUpdate.run('up8', 'i3', 'u_admin', 'Assigned to Sam Lindqvist.', daysAgo(1));
    insertUpdate.run('up9', 'i4', 'u_student2', 'Issue reported by student.', daysAgo(1));
  }
}

init();

export type Role = 'student' | 'admin' | 'technician';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  room: string | null;
  hostel: string | null;
  specialty: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  is_active: number;
  created_at: string;
}

export interface IssueRow {
  id: string;
  ticket_no: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  room: string;
  hostel: string;
  image_data: string | null;
  student_id: string;
  technician_id: string | null;
  duplicate_of: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface UpdateRow {
  id: string;
  issue_id: string;
  actor_id: string | null;
  message: string;
  created_at: string;
}

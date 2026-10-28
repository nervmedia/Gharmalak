import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';

export type Registration = {
  phone: string; // 10 digits, also the id
  name: string;
  area: string;
  home: 'house' | 'flat';
  interests: string[];
  lang: string;
  source: string;
  status: 'registered' | 'paid';
  paymentId: string | null;
  createdAt: string;
  paidAt: string | null;
};

export type Optin = { roundId: string; phone: string; createdAt: string };

// Free interest in an upcoming deal (no membership needed)
export type DealInterest = { dealId: string; phone: string; name: string; city: string; source: string; member: boolean; createdAt: string };
export type HomeReminder = { id: string; phone: string; name: string; kind: string; dueDate: string; repeat: string; remindDays: number; member: boolean; tokenHash: string; createdAt: string };

// Gharmalak Check (Pune test)
export type CheckRequest = {
  id: string;
  phone: string;
  name: string;
  building: string;
  area: string;
  purpose: 'rent' | 'buy';
  product: 'report' | 'call';
  household: string;
  moveIn: string;
  price: number;
  source: string;
  status: 'requested' | 'paid' | 'delivered';
  createdAt: string;
};

export type CheckAnswer = {
  id: string;
  phone: string;
  name: string;
  building: string;
  area: string;
  role: 'owner' | 'tenant';
  years: string;
  household: string;
  answers: Record<string, string>;
  rating: number;
  recommend: boolean;
  calls: boolean; // happy to take paid calls
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
};

type Store = {
  saveRegistration(r: Registration): Promise<{ created: boolean }>;
  getRegistration(phone: string): Promise<Registration | null>;
  listRegistrations(): Promise<Registration[]>;
  markPaid(phone: string, paymentId: string | null): Promise<boolean>;
  addOptin(o: Optin): Promise<{ created: boolean }>;
  listOptins(roundId: string): Promise<Optin[]>;
  counts(roundId: string): Promise<{ members: number; paid: number; optins: number }>;
  addCheckRequest(r: CheckRequest): Promise<void>;
  listCheckRequests(): Promise<CheckRequest[]>;
  addCheckAnswer(a: CheckAnswer): Promise<void>;
  listCheckAnswers(): Promise<CheckAnswer[]>;
  addDealInterest(i: DealInterest): Promise<{ created: boolean }>;
  listDealInterests(): Promise<DealInterest[]>;
  addReminder(r: HomeReminder): Promise<void>;
  deleteReminder(id: string, tokenHash: string): Promise<boolean>;
  listReminders(): Promise<HomeReminder[]>;
};

const useMysql = Boolean(process.env.DB_NAME && process.env.DB_USER);

/* ---------- MySQL (Hostinger) ---------- */
let poolPromise: Promise<import('mysql2/promise').Pool> | null = null;

async function pool() {
  if (!poolPromise) {
    poolPromise = (async () => {
      const mysql = await import('mysql2/promise');
      const p = mysql.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || 3306),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectionLimit: 5,
        charset: 'utf8mb4',
      });
      await p.query(`CREATE TABLE IF NOT EXISTS registrations (
        phone VARCHAR(10) PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        area VARCHAR(80) NOT NULL,
        home VARCHAR(10) NOT NULL,
        interests VARCHAR(200) NOT NULL,
        lang VARCHAR(5) NOT NULL,
        source VARCHAR(60) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'registered',
        payment_id VARCHAR(80) NULL,
        created_at DATETIME NOT NULL,
        paid_at DATETIME NULL
      ) CHARACTER SET utf8mb4`);
      await p.query(`CREATE TABLE IF NOT EXISTS optins (
        round_id VARCHAR(40) NOT NULL,
        phone VARCHAR(10) NOT NULL,
        created_at DATETIME NOT NULL,
        PRIMARY KEY (round_id, phone)
      ) CHARACTER SET utf8mb4`);
      await p.query(`CREATE TABLE IF NOT EXISTS check_requests (
        id VARCHAR(24) PRIMARY KEY,
        phone VARCHAR(10) NOT NULL,
        name VARCHAR(120) NOT NULL,
        building VARCHAR(120) NOT NULL,
        area VARCHAR(40) NOT NULL,
        purpose VARCHAR(10) NOT NULL,
        product VARCHAR(10) NOT NULL DEFAULT 'report',
        household VARCHAR(12) NOT NULL DEFAULT '',
        move_in VARCHAR(20) NOT NULL,
        price INT NOT NULL,
        source VARCHAR(60) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'requested',
        created_at DATETIME NOT NULL
      ) CHARACTER SET utf8mb4`);
      await p.query(`CREATE TABLE IF NOT EXISTS check_answers (
        id VARCHAR(24) PRIMARY KEY,
        phone VARCHAR(10) NOT NULL,
        name VARCHAR(120) NOT NULL,
        building VARCHAR(120) NOT NULL,
        area VARCHAR(40) NOT NULL,
        role VARCHAR(10) NOT NULL,
        years VARCHAR(20) NOT NULL,
        household VARCHAR(12) NOT NULL DEFAULT '',
        answers TEXT NOT NULL,
        rating TINYINT NOT NULL,
        recommend TINYINT NOT NULL,
        calls TINYINT NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at DATETIME NOT NULL
      ) CHARACTER SET utf8mb4`);
      await p.query(`CREATE TABLE IF NOT EXISTS deal_interests (
        deal_id VARCHAR(40) NOT NULL,
        phone VARCHAR(10) NOT NULL,
        name VARCHAR(120) NOT NULL,
        city VARCHAR(40) NOT NULL,
        source VARCHAR(120) NOT NULL,
        member TINYINT NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL,
        PRIMARY KEY (deal_id, phone)
      ) CHARACTER SET utf8mb4`);
      await p.query(`CREATE TABLE IF NOT EXISTS home_reminders (
        id VARCHAR(24) PRIMARY KEY,
        phone VARCHAR(10) NOT NULL,
        name VARCHAR(120) NOT NULL,
        kind VARCHAR(24) NOT NULL,
        due_date DATE NOT NULL,
        repeat_every VARCHAR(12) NOT NULL,
        remind_days TINYINT NOT NULL,
        member TINYINT NOT NULL DEFAULT 0,
        token_hash CHAR(64) NOT NULL,
        created_at DATETIME NOT NULL,
        INDEX (phone)
      ) CHARACTER SET utf8mb4`);
      return p;
    })();
  }
  return poolPromise;
}

const toSql = (iso: string | null) => (iso ? iso.slice(0, 19).replace('T', ' ') : null);
const fromSql = (d: Date | string | null) => (d ? new Date(d).toISOString() : null);

function rowToReg(r: Record<string, unknown>): Registration {
  return {
    phone: String(r.phone),
    name: String(r.name),
    area: String(r.area),
    home: r.home === 'flat' ? 'flat' : 'house',
    interests: String(r.interests || '').split(',').filter(Boolean),
    lang: String(r.lang),
    source: String(r.source),
    status: r.status === 'paid' ? 'paid' : 'registered',
    paymentId: (r.payment_id as string) || null,
    createdAt: fromSql(r.created_at as Date) as string,
    paidAt: fromSql(r.paid_at as Date | null),
  };
}

const mysqlStore: Store = {
  async saveRegistration(r) {
    const p = await pool();
    const [res] = await p.query(
      `INSERT INTO registrations (phone,name,area,home,interests,lang,source,status,created_at)
       VALUES (?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), area=VALUES(area), home=VALUES(home), interests=VALUES(interests), lang=VALUES(lang)`,
      [r.phone, r.name, r.area, r.home, r.interests.join(','), r.lang, r.source, r.status, toSql(r.createdAt)],
    );
    return { created: (res as { affectedRows: number }).affectedRows === 1 };
  },
  async getRegistration(phone) {
    const p = await pool();
    const [rows] = await p.query('SELECT * FROM registrations WHERE phone=?', [phone]);
    const list = rows as Record<string, unknown>[];
    return list.length ? rowToReg(list[0]) : null;
  },
  async listRegistrations() {
    const p = await pool();
    const [rows] = await p.query('SELECT * FROM registrations ORDER BY created_at DESC');
    return (rows as Record<string, unknown>[]).map(rowToReg);
  },
  async markPaid(phone, paymentId) {
    const p = await pool();
    const [res] = await p.query(
      `UPDATE registrations SET status='paid', payment_id=COALESCE(?, payment_id), paid_at=COALESCE(paid_at, ?) WHERE phone=?`,
      [paymentId, toSql(new Date().toISOString()), phone],
    );
    return (res as { affectedRows: number }).affectedRows > 0;
  },
  async addOptin(o) {
    const p = await pool();
    const [res] = await p.query('INSERT IGNORE INTO optins (round_id, phone, created_at) VALUES (?,?,?)', [o.roundId, o.phone, toSql(o.createdAt)]);
    return { created: (res as { affectedRows: number }).affectedRows === 1 };
  },
  async listOptins(roundId) {
    const p = await pool();
    const [rows] = await p.query('SELECT * FROM optins WHERE round_id=? ORDER BY created_at DESC', [roundId]);
    return (rows as Record<string, unknown>[]).map(r => ({ roundId: String(r.round_id), phone: String(r.phone), createdAt: fromSql(r.created_at as Date) as string }));
  },
  async counts(roundId) {
    const p = await pool();
    const [[a]] = (await p.query(`SELECT COUNT(*) AS members, SUM(status='paid') AS paid FROM registrations`)) as unknown as [[{ members: number; paid: number | null }]];
    const [[b]] = (await p.query('SELECT COUNT(*) AS optins FROM optins WHERE round_id=?', [roundId])) as unknown as [[{ optins: number }]];
    return { members: Number(a.members), paid: Number(a.paid || 0), optins: Number(b.optins) };
  },
  async addCheckRequest(r) {
    const p = await pool();
    await p.query(
      'INSERT INTO check_requests (id,phone,name,building,area,purpose,product,household,move_in,price,source,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [r.id, r.phone, r.name, r.building, r.area, r.purpose, r.product, r.household, r.moveIn, r.price, r.source, r.status, toSql(r.createdAt)],
    );
  },
  async listCheckRequests() {
    const p = await pool();
    const [rows] = await p.query('SELECT * FROM check_requests ORDER BY created_at DESC');
    return (rows as Record<string, unknown>[]).map(r => ({
      id: String(r.id), phone: String(r.phone), name: String(r.name), building: String(r.building), area: String(r.area),
      purpose: r.purpose === 'buy' ? 'buy' : 'rent', product: r.product === 'call' ? 'call' : 'report', household: String(r.household || ''), moveIn: String(r.move_in), price: Number(r.price), source: String(r.source),
      status: (['paid', 'delivered'].includes(String(r.status)) ? r.status : 'requested') as CheckRequest['status'],
      createdAt: fromSql(r.created_at as Date) as string,
    }));
  },
  async addCheckAnswer(a) {
    const p = await pool();
    await p.query(
      'INSERT INTO check_answers (id,phone,name,building,area,role,years,household,answers,rating,recommend,calls,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [a.id, a.phone, a.name, a.building, a.area, a.role, a.years, a.household, JSON.stringify(a.answers), a.rating, a.recommend ? 1 : 0, a.calls ? 1 : 0, a.status, toSql(a.createdAt)],
    );
  },
  async listCheckAnswers() {
    const p = await pool();
    const [rows] = await p.query('SELECT * FROM check_answers ORDER BY created_at DESC');
    return (rows as Record<string, unknown>[]).map(r => ({
      id: String(r.id), phone: String(r.phone), name: String(r.name), building: String(r.building), area: String(r.area),
      role: r.role === 'owner' ? 'owner' : 'tenant', years: String(r.years), household: String(r.household || ''),
      answers: (() => { try { return JSON.parse(String(r.answers)); } catch { return {}; } })(),
      rating: Number(r.rating), recommend: Number(r.recommend) === 1, calls: Number(r.calls) === 1,
      status: (['verified', 'rejected'].includes(String(r.status)) ? r.status : 'pending') as CheckAnswer['status'],
      createdAt: fromSql(r.created_at as Date) as string,
    }));
  },
  async addDealInterest(i) {
    const p = await pool();
    const [res] = await p.query(
      'INSERT IGNORE INTO deal_interests (deal_id,phone,name,city,source,member,created_at) VALUES (?,?,?,?,?,?,?)',
      [i.dealId, i.phone, i.name, i.city, i.source, i.member ? 1 : 0, toSql(i.createdAt)],
    );
    return { created: (res as { affectedRows: number }).affectedRows === 1 };
  },
  async listDealInterests() {
    const p = await pool();
    const [rows] = await p.query('SELECT * FROM deal_interests ORDER BY created_at DESC');
    return (rows as Record<string, unknown>[]).map(r => ({
      dealId: String(r.deal_id), phone: String(r.phone), name: String(r.name), city: String(r.city), source: String(r.source),
      member: Number(r.member) === 1, createdAt: fromSql(r.created_at as Date) as string,
    }));
  },
  async addReminder(r) {
    const p = await pool();
    await p.query(
      'INSERT INTO home_reminders (id,phone,name,kind,due_date,repeat_every,remind_days,member,token_hash,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [r.id, r.phone, r.name, r.kind, r.dueDate, r.repeat, r.remindDays, r.member ? 1 : 0, r.tokenHash, toSql(r.createdAt)],
    );
  },
  async deleteReminder(id, tokenHash) {
    const p = await pool();
    const [res] = await p.query('DELETE FROM home_reminders WHERE id = ? AND token_hash = ?', [id, tokenHash]);
    return (res as { affectedRows: number }).affectedRows === 1;
  },
  async listReminders() {
    const p = await pool();
    const [rows] = await p.query("SELECT *, DATE_FORMAT(due_date, '%Y-%m-%d') AS due FROM home_reminders ORDER BY created_at DESC");
    return (rows as Record<string, unknown>[]).map(r => ({
      id: String(r.id), phone: String(r.phone), name: String(r.name), kind: String(r.kind), dueDate: String(r.due), repeat: String(r.repeat_every),
      remindDays: Number(r.remind_days), member: Number(r.member) === 1, tokenHash: String(r.token_hash), createdAt: fromSql(r.created_at as Date) as string,
    }));
  },
};

/* ---------- JSON file (local testing only) ---------- */
const file = path.join(process.cwd(), 'data', 'store.json');
type FileData = { registrations: Registration[]; optins: Optin[]; checkRequests?: CheckRequest[]; checkAnswers?: CheckAnswer[]; dealInterests?: DealInterest[]; reminders?: HomeReminder[] };
let queue: Promise<unknown> = Promise.resolve();

async function readFile(): Promise<FileData> {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return { registrations: [], optins: [] }; }
}
function withFile<T>(fn: (d: FileData) => T | Promise<T>, write = false): Promise<T> {
  const run = queue.then(async () => {
    const d = await readFile();
    const out = await fn(d);
    if (write) { await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, JSON.stringify(d, null, 2)); }
    return out;
  });
  queue = run.catch(() => undefined);
  return run;
}

const fileStore: Store = {
  saveRegistration: r => withFile(d => {
    const i = d.registrations.findIndex(x => x.phone === r.phone);
    if (i >= 0) { const old = d.registrations[i]; d.registrations[i] = { ...old, name: r.name, area: r.area, home: r.home, interests: r.interests, lang: r.lang }; return { created: false }; }
    d.registrations.push(r); return { created: true };
  }, true),
  getRegistration: phone => withFile(d => d.registrations.find(x => x.phone === phone) || null),
  listRegistrations: () => withFile(d => [...d.registrations].sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
  markPaid: (phone, paymentId) => withFile(d => {
    const r = d.registrations.find(x => x.phone === phone);
    if (!r) return false;
    r.status = 'paid'; r.paymentId = paymentId || r.paymentId; r.paidAt = r.paidAt || new Date().toISOString();
    return true;
  }, true),
  addOptin: o => withFile(d => {
    if (d.optins.some(x => x.roundId === o.roundId && x.phone === o.phone)) return { created: false };
    d.optins.push(o); return { created: true };
  }, true),
  listOptins: roundId => withFile(d => d.optins.filter(x => x.roundId === roundId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
  counts: roundId => withFile(d => ({
    members: d.registrations.length,
    paid: d.registrations.filter(r => r.status === 'paid').length,
    optins: d.optins.filter(o => o.roundId === roundId).length,
  })),
  addCheckRequest: r => withFile(d => { (d.checkRequests ??= []).push(r); }, true),
  listCheckRequests: () => withFile(d => [...(d.checkRequests ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
  addCheckAnswer: a => withFile(d => { (d.checkAnswers ??= []).push(a); }, true),
  listCheckAnswers: () => withFile(d => [...(d.checkAnswers ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
  addDealInterest: i => withFile(d => {
    const list = (d.dealInterests ??= []);
    if (list.some(x => x.dealId === i.dealId && x.phone === i.phone)) return { created: false };
    list.push(i); return { created: true };
  }, true),
  listDealInterests: () => withFile(d => [...(d.dealInterests ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
  addReminder: r => withFile(d => { (d.reminders ??= []).push(r); }, true),
  deleteReminder: (id, tokenHash) => withFile(d => {
    const list = d.reminders ?? [];
    const i = list.findIndex(x => x.id === id && x.tokenHash === tokenHash);
    if (i < 0) return false;
    list.splice(i, 1); return true;
  }, true),
  listReminders: () => withFile(d => [...(d.reminders ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
};

export const db: Store = useMysql ? mysqlStore : fileStore;
export const storageMode = useMysql ? 'mysql' : 'file';

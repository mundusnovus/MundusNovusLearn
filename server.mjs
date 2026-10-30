// Mundus Novus Learn: learn.mundusnovus.org. Serves the courses (built into public/ by tools/build.mjs), keeps each
// learner's progress, and runs Swift exercises against their lessons' tests (src/runner.mjs).
//
// People sign in with their Mundus Novus account: the Social cookie (mn_social) is set for the whole domain, and
// this server asks Social who it belongs to. Node 24, no packages.
//
//   PORT, PUBLIC_URL, DATA_DIR, SOCIAL_URL (https://social.mundusnovus.org), RUNNER_USER (on the server),
//   RUNS_PER_HOUR (default 240)
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, createReadStream, mkdirSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { loadCourse, lessonsOf } from './src/curriculum.mjs';
import { createRunner } from './src/runner.mjs';

const HERE = dirname(fileURLToPath(import.meta.url)), PUBLIC = join(HERE, 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff': 'font/woff', '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8' };
const SECURITY = { 'x-content-type-options': 'nosniff', 'referrer-policy': 'strict-origin-when-cross-origin', 'x-frame-options': 'DENY',
  'content-security-policy': "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'" };

export function makeLearn(env = process.env, deps = {}) {
  const courses = {};
  for (const id of ['swift']) courses[id] = loadCourse(join(HERE, 'curriculum', id));
  const lessons = new Map();
  for (const [cid, c] of Object.entries(courses)) for (const l of lessonsOf(c)) lessons.set(l.id, { ...l, course: cid });

  const dataDir = env.DATA_DIR || join(HERE, '.data');
  mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(join(dataDir, 'learn.sqlite'));
  db.exec(`PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS progress (user TEXT, lesson TEXT, done_at INTEGER, code TEXT, PRIMARY KEY (user, lesson));
    CREATE TABLE IF NOT EXISTS runs (user TEXT, at INTEGER);
    CREATE INDEX IF NOT EXISTS runs_user ON runs (user, at);`);
  const social = (env.SOCIAL_URL || 'https://social.mundusnovus.org').replace(/\/+$/, '');
  const runner = deps.runner || createRunner({ user: env.RUNNER_USER || null });
  const perHour = Number(env.RUNS_PER_HOUR) || 240;
  const fetchImpl = deps.fetch || fetch;
  const who = new Map(); // cookie -> { user, until }

  async function me(req) {
    const sid = (/(?:^|;\s*)mn_social=([a-f0-9]{48})/.exec(req.headers.cookie || '') || [])[1];
    if (!sid) return null;
    const hit = who.get(sid);
    if (hit && hit.until > Date.now()) return hit.user;
    try {
      const r = await fetchImpl(social + '/api/me', { headers: { cookie: 'mn_social=' + sid } });
      const j = r.ok ? await r.json() : {};
      const user = j.user ? { name: j.user.name, display: j.user.display || j.user.name, avatar: j.user.avatar || null } : null;
      who.set(sid, { user, until: Date.now() + 60000 });
      if (who.size > 5000) who.clear();
      return user;
    } catch { return null; }
  }

  const json = (res, status, body) => { res.writeHead(status, { ...SECURITY, 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify(body)); };
  async function body(req, limit = 200000) {
    let raw = ''; for await (const c of req) { raw += c; if (raw.length > limit) throw Object.assign(new Error('That is too much code for one exercise.'), { status: 413 }); }
    try { return JSON.parse(raw || '{}'); } catch { throw Object.assign(new Error('Bad request.'), { status: 400 }); }
  }
  const complete = (user, id, code) => db.prepare('INSERT INTO progress (user, lesson, done_at, code) VALUES (?, ?, ?, ?) ON CONFLICT (user, lesson) DO UPDATE SET code = excluded.code')
    .run(user, id, Date.now(), code == null ? null : String(code).slice(0, 100000));

  function file(req, res, path) {
    const p = join(PUBLIC, path.replace(/\.\.+/g, ''));
    if (!p.startsWith(PUBLIC) || !existsSync(p) || !statSync(p).isFile()) return false;
    const type = TYPES[extname(p)] || 'application/octet-stream';
    res.writeHead(200, { ...SECURITY, 'content-type': type, 'cache-control': /\/(brand|fonts)\//.test(path) ? 'public, max-age=86400' : 'no-cache' });
    createReadStream(p).pipe(res);
    return true;
  }

  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://local'), path = url.pathname;
      if (path === '/healthz') { res.writeHead(200); return res.end('ok'); }
      if (path === '/api/me') return json(res, 200, { user: await me(req) });
      if (path === '/api/progress' && req.method === 'GET') {
        const u = await me(req);
        if (!u) return json(res, 200, { signedIn: false, done: {} });
        const done = {}, code = {};
        for (const r of db.prepare('SELECT lesson, done_at, code FROM progress WHERE user = ?').all(u.name)) { done[r.lesson] = r.done_at; if (r.code) code[r.lesson] = r.code; }
        return json(res, 200, { signedIn: true, done, code });
      }
      if (path === '/api/progress' && req.method === 'POST') {
        const u = await me(req); if (!u) return json(res, 401, { error: 'Sign in to keep your progress.' });
        const b = await body(req), l = lessons.get(String(b.id || ''));
        if (!l) return json(res, 404, { error: 'No such lesson.' });
        if (l.tests) return json(res, 400, { error: 'Pass the tests to complete this lesson.' });
        if (l.questions && !(Array.isArray(b.answers) && l.questions.every((q, i) => q.answers[b.answers[i]]?.correct))) return json(res, 400, { error: 'Not every answer is right yet.' });
        complete(u.name, l.id, null);
        return json(res, 200, { ok: true });
      }
      if (path === '/api/progress/import' && req.method === 'POST') { // progress made before signing in
        const u = await me(req); if (!u) return json(res, 401, { error: 'Sign in first.' });
        const b = await body(req);
        for (const id of Object.keys(b.done || {}).slice(0, 2000)) { const l = lessons.get(id); if (l && !l.tests) complete(u.name, id, null); }
        return json(res, 200, { ok: true });
      }
      if (path === '/api/run' && req.method === 'POST') {
        const u = await me(req); if (!u) return json(res, 401, { error: 'Sign in with your Mundus Novus account to run code.' });
        const b = await body(req), l = lessons.get(String(b.id || ''));
        if (!l || !l.tests) return json(res, 404, { error: 'This lesson has no code to check.' });
        const hour = Date.now() - 3600000;
        db.prepare('DELETE FROM runs WHERE at < ?').run(hour);
        if (db.prepare('SELECT count(*) n FROM runs WHERE user = ? AND at > ?').get(u.name, hour).n >= perHour) return json(res, 429, { error: 'That is a lot of runs this hour. Take a short break and try again.' });
        db.prepare('INSERT INTO runs VALUES (?, ?)').run(u.name, Date.now());
        const result = await runner.check(l, String(b.code ?? ''));
        if (result.passed) complete(u.name, l.id, b.code);
        return json(res, 200, result);
      }
      if (path.startsWith('/api/')) return json(res, 404, { error: 'Not here.' });
      if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
      if (file(req, res, path)) return;
      if (file(req, res, path.replace(/\/$/, '') + '/index.html')) return;
      file(req, res, '/index.html'); // the app's own routes: /swift/, /swift/<lesson>
    } catch (e) {
      if (!res.headersSent) json(res, e.status || 500, { error: e.status ? e.message : 'Something went wrong.' });
      if (!e.status) console.error(e);
    }
  });
  return { server, lessons, courses, db };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 8095, { server, lessons } = makeLearn();
  server.listen(port, () => console.log('Mundus Novus Learn on :' + port + ', ' + lessons.size + ' lessons'));
  // check the runner end to end once at start: compiler, limits, unprivileged user, tests
  const sample = lessons.get('functions-basics');
  createRunner({ user: process.env.RUNNER_USER || null }).check(sample, sample.solution)
    .then((r) => console.log(r.passed ? 'runner ok: a lesson solution compiled, ran and passed its tests'
      : 'RUNNER PROBLEM: ' + JSON.stringify({ compiled: r.compiled, errors: r.errors, crashed: r.crashed, crash: r.crash, timedOut: r.timedOut, output: r.output, tests: r.tests })))
    .catch((e) => console.log('RUNNER PROBLEM: ' + e.message));
}

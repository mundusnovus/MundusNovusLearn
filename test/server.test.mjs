// The Learn server: who is signed in (asked of Social), progress, quizzes, and running code (with a stand-in runner),
// plus the real runner's handling of crashes, endless loops and compiler errors (needs swiftc).
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { makeLearn } from '../server.mjs';
import { createRunner } from '../src/runner.mjs';

const SID = 'ab'.repeat(24);
async function start(env = {}) {
  const asked = [];
  const social = async (url, o) => { asked.push({ url, cookie: o.headers.cookie }); return { ok: true, json: async () => ({ user: o.headers.cookie.includes(SID) ? { name: 'ana', display: 'Ana' } : null }) }; };
  const runs = [];
  const runner = { check: async (lesson, code) => { runs.push(code); const ok = code.includes('right'); return { compiled: true, output: '', errors: [], tests: lesson.tests.map((t) => ({ text: t.text, pass: ok })), passed: ok }; } };
  const app = makeLearn({ DATA_DIR: mkdtempSync(join(tmpdir(), 'learn-')), SOCIAL_URL: 'https://social.test', ...env }, { fetch: social, runner });
  await new Promise((r) => app.server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + app.server.address().port;
  const call = (method, path, body, signedIn = true) => fetch(base + path, { method, headers: { ...(signedIn ? { cookie: 'as_social=' + SID } : {}), ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined })
    .then(async (r) => ({ status: r.status, body: await r.json().catch(() => null), type: r.headers.get('content-type') }));
  return { app, base, call, asked, runs, stop: () => app.server.close() };
}

test('serves the site, the course and lesson pages', async () => {
  const t = await start();
  try {
    const home = await fetch(t.base + '/');
    assert.match(await home.text(), /Asteria Learn/);
    const map = await (await fetch(t.base + '/course/swift.json')).json();
    assert.ok(map.chapters.length >= 9);
    const lesson = await fetch(t.base + '/swift/values-constants');   // the app's own route falls back to the app
    assert.match(await lesson.text(), /<main id="main"/);
    const page = await (await fetch(t.base + '/course/swift/values-constants.json')).json();
    assert.equal(page.runnable, true);
    assert.ok(!JSON.stringify(page).includes('expect(language'), 'test code must not reach the browser');
  } finally { t.stop(); }
});

test('asks Social who is signed in, and only with the Social cookie', async () => {
  const t = await start();
  try {
    assert.equal((await t.call('GET', '/api/me', null, false)).body.user, null);
    const me = await t.call('GET', '/api/me');
    assert.equal(me.body.user.name, 'ana');
    assert.equal(t.asked[0].url, 'https://social.test/api/me');
    assert.equal(t.asked[0].cookie, 'as_social=' + SID);
  } finally { t.stop(); }
});

test('running code needs a sign-in, and passing the tests completes the lesson', async () => {
  const t = await start();
  try {
    assert.equal((await t.call('POST', '/api/run', { id: 'values-constants', code: 'x' }, false)).status, 401);
    const wrong = await t.call('POST', '/api/run', { id: 'values-constants', code: 'wrong' });
    assert.equal(wrong.body.passed, false);
    assert.equal((await t.call('GET', '/api/progress')).body.done['values-constants'], undefined);
    const right = await t.call('POST', '/api/run', { id: 'values-constants', code: 'right answer' });
    assert.equal(right.body.passed, true);
    const p = (await t.call('GET', '/api/progress')).body;
    assert.ok(p.done['values-constants']);
    assert.equal(p.code['values-constants'], 'right answer');
    assert.equal((await t.call('POST', '/api/run', { id: 'start-quiz', code: 'x' })).status, 404, 'quizzes have no code');
  } finally { t.stop(); }
});

test('quizzes complete only with every answer right, and lessons with tests only by running them', async () => {
  const t = await start();
  try {
    const quiz = t.app.lessons.get('values-quiz');
    const right = quiz.questions.map((q) => q.answers.findIndex((a) => a.correct));
    const wrong = right.map((i, n) => (n === 0 ? (i + 1) % quiz.questions[0].answers.length : i));
    assert.equal((await t.call('POST', '/api/progress', { id: 'values-quiz', answers: wrong })).status, 400);
    assert.equal((await t.call('POST', '/api/progress', { id: 'values-quiz', answers: right })).status, 200);
    assert.equal((await t.call('POST', '/api/progress', { id: 'values-constants' })).status, 400);
    const xcode = t.app.lessons.get('xcode-install');
    assert.equal((await t.call('POST', '/api/progress', { id: 'xcode-install' })).status, 400, 'its questions must be answered too');
    assert.equal((await t.call('POST', '/api/progress', { id: 'xcode-install', answers: xcode.questions.map((q) => q.answers.findIndex((a) => a.correct)) })).status, 200);
  } finally { t.stop(); }
});

test('runs are limited per hour', async () => {
  const t = await start({ RUNS_PER_HOUR: '2' });
  try {
    await t.call('POST', '/api/run', { id: 'values-constants', code: 'a' });
    await t.call('POST', '/api/run', { id: 'values-constants', code: 'b' });
    assert.equal((await t.call('POST', '/api/run', { id: 'values-constants', code: 'c' })).status, 429);
  } finally { t.stop(); }
});

test('the app runs code without an account, limited per install and per network, and keeps nothing', async () => {
  const t = await start({ RUNS_PER_HOUR: '2', APP_RUNS_PER_NETWORK: '3' });
  const run = (device, code, id = 'values-constants') => fetch(t.base + '/api/app/run', { method: 'POST',
    headers: { 'content-type': 'application/json', ...(device ? { 'x-asteria-device': device } : {}) }, body: JSON.stringify({ id, code }) })
    .then(async (r) => ({ status: r.status, body: await r.json() }));
  const a = '0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d', b = '1a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d';
  try {
    assert.equal((await run(null, 'right')).status, 400, 'the app must say which install it is');
    assert.equal((await run('not-a-uuid', 'right')).status, 400);
    assert.equal((await run(a, 'right', 'start-quiz')).status, 404, 'quizzes have no code');
    const right = await run(a, 'right answer');
    assert.equal(right.status, 200);
    assert.equal(right.body.passed, true);
    assert.equal((await run(a, 'wrong')).body.passed, false);
    assert.equal((await run(a, 'right')).status, 429, 'two runs an hour for this install');
    assert.equal((await run(b, 'right')).status, 200, 'another install on the same network still runs');
    assert.equal((await run(b, 'right')).status, 429, 'until the network has had its three');
    assert.equal(t.app.db.prepare('SELECT count(*) n FROM progress').get().n, 0, 'nothing is kept');
  } finally { t.stop(); }
});

test('the runner reports crashes, endless loops and compiler errors in the learner\'s own line numbers', async () => {
  const runner = createRunner({ runTimeout: 3000 });
  const lesson = { tests: [{ text: 'x is 1', checks: [{ kind: 'swift', code: 'expect(x == 1)' }] }] };
  const crash = await runner.check(lesson, 'let x = 1\nlet a: [Int] = []\nprint(a[2])');
  assert.equal(crash.crashed, true);
  assert.match(crash.crash, /Index out of range/);
  assert.equal(crash.tests[0].pass, false);
  const loop = await runner.check(lesson, 'let x = 1\nwhile true {}');
  assert.equal(loop.timedOut, true);
  const bad = await runner.check(lesson, 'let x = 1\nlet y: Int = "no"');
  assert.equal(bad.compiled, false);
  assert.equal(bad.errors[0].line, 2);
  const missing = await runner.check(lesson, 'let y = 1');
  assert.equal(missing.compiled, false);
  assert.match(missing.errors[0].message, /^The tests could not use your code/);
});

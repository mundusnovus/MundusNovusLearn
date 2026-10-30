// Runs a learner's Swift with a lesson's tests. The code and the tests become one main.swift: the learner's code
// first, then each test in its own block with an expect() of its own. Each block prints a marker line carrying a
// random nonce, so the result of every test can be read back even if a later one crashes. Source tests and output
// tests are checked here, in JavaScript.
//
// On the server the compiler and the program run as an unprivileged user with CPU, memory, process and file-size
// limits and a wall-clock timeout (RUNNER_USER). Without RUNNER_USER (local runs and tests) they run as you.
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, chownSync, chmodSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';

// Output is line-buffered, so what a program printed before a crash still reaches the learner. On Darwin the program
// does it itself. On Linux, Glibc declares stdout as a mutable global that Swift 6 will not touch, so the runner
// starts the program under stdbuf -oL instead.
const PRELUDE = `#if canImport(Darwin)
import Darwin
setvbuf(stdout, nil, _IOLBF, 0)
#endif
`;
const STDBUF = existsSync('/usr/bin/stdbuf') ? ['/usr/bin/stdbuf', '-oL'] : [];
const PRELUDE_LINES = PRELUDE.split('\n').length - 1;
const MAX_OUT = 64 * 1024;

export function buildProgram(code, tests, nonce) {
  const blocks = [];
  tests.forEach((t, i) => t.checks.forEach((c) => {
    if (c.kind !== 'swift') return;
    blocks.push(`do {
    var __mnPass = true
    func expect(_ condition: @autoclosure () throws -> Bool) { do { if try !condition() { __mnPass = false } } catch { __mnPass = false } }
${c.code.split('\n').map((l) => '    ' + l).join('\n')}
    print("\\u{1E}${nonce} ${i} \\(__mnPass ? 1 : 0)")
}`);
  }));
  const learner = String(code).replace(/\r/g, '');
  const testStart = PRELUDE_LINES + learner.split('\n').length + 2;
  return { source: PRELUDE + learner + '\n\n// MARK: the lesson\'s tests\n' + blocks.join('\n') + '\n', firstLine: PRELUDE_LINES + 1, testStart };
}

function run(cmd, args, { cwd, timeout, user, limits, env }) {
  return new Promise((resolve) => {
    let full = [cmd, ...args];
    if (user) full = ['prlimit', ...limits, '--', 'setpriv', '--reuid=' + user, '--regid=' + user, '--clear-groups', '--', ...full];
    const p = spawn(full[0], full.slice(1), { cwd, detached: true, env: { PATH: process.env.PATH, HOME: cwd, LANG: 'C.UTF-8', ...env } });
    let out = '', err = '', killed = false;
    const add = (which, d) => { if (which === 'out') { if (out.length < MAX_OUT) out += d; } else if (err.length < MAX_OUT) err += d; };
    p.stdout.on('data', (d) => add('out', d)); p.stderr.on('data', (d) => add('err', d));
    const timer = setTimeout(() => { killed = true; try { process.kill(-p.pid, 'SIGKILL'); } catch {} }, timeout);
    p.on('close', (status, signal) => { clearTimeout(timer); resolve({ status, signal, out, err, killed }); });
    p.on('error', (e) => { clearTimeout(timer); resolve({ status: -1, out, err: String(e.message), killed }); });
  });
}

export function createRunner({ swiftc = 'swiftc', user = process.env.RUNNER_USER || null, concurrency = 2, queueLimit = 24,
  compileTimeout = 40000, runTimeout = 8000 } = {}) {
  let uid = null;
  if (user) { try { uid = Number(execFileSync('id', ['-u', user]).toString().trim()); } catch { throw new Error('RUNNER_USER ' + user + ' does not exist'); } }
  let active = 0; const waiting = [];
  const slot = () => new Promise((resolve, reject) => {
    if (active < concurrency) { active++; return resolve(); }
    if (waiting.length >= queueLimit) return reject(Object.assign(new Error('Lots of people are running code right now. Try again in a moment.'), { status: 503 }));
    waiting.push(resolve);
  });
  const free = () => { const next = waiting.shift(); if (next) next(); else active--; };

  /** Runs code against a lesson's tests. Returns { compiled, output, errors, crashed, timedOut, tests: [{ text, pass }], passed }. */
  async function check(lesson, code) {
    const tests = lesson.tests || [];
    // a test passes when every one of its checks passes; Swift checks that never report (a crash) count as failed
    const results = tests.map((t) => ({ text: t.text, pass: true })), swiftLeft = tests.map((t) => t.checks.filter((c) => c.kind === 'swift').length);
    const fail = (i, ok) => { if (!ok) results[i].pass = false; };
    tests.forEach((t, i) => t.checks.forEach((c) => {
      if (c.kind === 'source') fail(i, new RegExp(c.code, 'm').test(code));
      if (c.kind === 'nosource') fail(i, !new RegExp(c.code, 'm').test(code));
    }));
    const nonce = randomBytes(12).toString('hex');
    const { source, firstLine, testStart } = buildProgram(code, tests, nonce);
    await slot();
    const dir = mkdtempSync(join(tmpdir(), 'mn-run-'));
    try {
      writeFileSync(join(dir, 'main.swift'), source);
      if (uid != null) { chownSync(dir, uid, uid); chmodSync(dir, 0o700); chownSync(join(dir, 'main.swift'), uid, uid); }
      // No process-count limit by default: some container sandboxes (Railway's among them) count processes beyond
      // this user, so even a generous limit stops the compiler starting. The CPU and time limits, and killing the
      // whole process group at the deadline, still stop runaway programs. RUNNER_NPROC turns it on where it works.
      const nproc = process.env.RUNNER_NPROC ? ['--nproc=' + process.env.RUNNER_NPROC] : [];
      const opts = (timeout, as) => ({ cwd: dir, timeout, user, limits: ['--cpu=' + Math.ceil(timeout / 1000), '--fsize=50000000', ...nproc, ...(as ? ['--as=' + as] : [])] });
      // Swift 6 with the settings Xcode gives a new app project ("approachable concurrency"): code is on the main
      // actor unless it says otherwise, and nonisolated async functions run on their caller's actor
      const c = await run(swiftc, ['-swift-version', '6', '-default-isolation', 'MainActor', '-enable-upcoming-feature', 'NonisolatedNonsendingByDefault',
        '-Onone', '-module-name', 'Lesson', '-o', 'program', 'main.swift'], opts(compileTimeout, 0));
      if (c.status !== 0 || !existsSync(join(dir, 'program'))) {
        tests.forEach((t, i) => { if (swiftLeft[i] || t.checks.some((x) => x.kind === 'output' || x.kind === 'nooutput')) results[i].pass = false; });
        return { compiled: false, timedOut: c.killed, errors: compilerErrors(c.err, firstLine, testStart), output: '', tests: results, passed: false };
      }
      const r = STDBUF.length ? await run(STDBUF[0], [STDBUF[1], join(dir, 'program')], opts(runTimeout, 4 * 1024 * 1024 * 1024))
        : await run(join(dir, 'program'), [], opts(runTimeout, 4 * 1024 * 1024 * 1024));
      const lines = r.out.split('\n'), shown = [];
      for (const l of lines) {
        const m = new RegExp('^\\u001e' + nonce + ' (\\d+) ([01])$').exec(l);
        if (m) { const i = Number(m[1]); swiftLeft[i]--; fail(i, m[2] === '1'); }
        else shown.push(l);
      }
      const output = shown.join('\n').replace(/\n+$/, '');
      const learnerOutput = output; // tests do not print, so everything shown is the learner's
      tests.forEach((t, i) => {
        if (swiftLeft[i] > 0) results[i].pass = false;
        for (const c of t.checks) {
          if (c.kind === 'output') fail(i, new RegExp(c.code, 'm').test(learnerOutput));
          if (c.kind === 'nooutput') fail(i, !new RegExp(c.code, 'm').test(learnerOutput));
        }
      });
      const crashed = !r.killed && r.status !== 0;
      return { compiled: true, timedOut: r.killed, crashed, crash: crashed ? crashReason(r.err) : '', output: output.slice(0, 20000), errors: [], tests: results,
        passed: results.length > 0 && results.every((t) => t.pass) && !r.killed };
    } finally {
      rmSync(dir, { recursive: true, force: true });
      free();
    }
  }
  return { check };
}

/** Compiler messages for the learner: lines in their code are renumbered from 1; errors inside the tests say so. */
export function compilerErrors(stderr, firstLine, testStart) {
  const out = [];
  for (const l of String(stderr).split('\n')) {
    const m = /main\.swift:(\d+):(\d+): (error|warning): (.*)/.exec(l);
    if (!m || m[3] !== 'error') continue;
    const line = Number(m[1]);
    out.push(line >= testStart ? { line: null, message: 'The tests could not use your code: ' + m[4] } : { line: line - firstLine + 1, column: Number(m[2]), message: m[4] });
  }
  if (!out.length && stderr.trim()) out.push({ line: null, message: stderr.trim().split('\n').slice(-3).join(' ') });
  return out.slice(0, 12);
}

function crashReason(err) {
  const m = /Fatal error: ([^\n]*)/.exec(err) || /(Illegal instruction|Segmentation fault|Killed)/.exec(err);
  return m ? m[1] : 'Your program stopped unexpectedly.';
}

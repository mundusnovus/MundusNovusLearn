// Every lesson with tests: its solution passes every test, and its starting code does not (so there is something to
// do). Quizzes have exactly one right answer per question (checked by the parser). Needs swiftc (Swift 6.4).
// Run one module with LESSONS=<module id>, e.g. LESSONS=values node --test test/curriculum.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCourse } from '../src/curriculum.mjs';
import { createRunner } from '../src/runner.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const course = loadCourse(join(ROOT, 'curriculum', 'swift'));
const runner = createRunner({ concurrency: 6, queueLimit: 10000 });
const only = process.env.LESSONS ? process.env.LESSONS.split(',') : null;

for (const ch of course.chapters) for (const mod of ch.modules) {
  if (only && !only.includes(mod.id)) continue;
  test(mod.id, async (t) => {
    await Promise.all(mod.lessons.filter((l) => l.tests).map(async (l) => {
      const good = await runner.check(l, l.solution);
      await t.test(l.id + ': the solution passes', () => {
        assert.ok(good.compiled, l.id + ' solution does not compile: ' + JSON.stringify(good.errors));
        assert.ok(!good.crashed, l.id + ' solution crashes: ' + good.crash);
        assert.deepEqual(good.tests.filter((x) => !x.pass).map((x) => x.text), [], l.id + ' output:\n' + good.output);
      });
      if (l.seed != null && l.seed !== l.solution) {
        const seed = await runner.check(l, l.seed);
        await t.test(l.id + ': the starting code does not pass yet', () => assert.ok(!seed.passed, l.id + ' starting code already passes'));
      }
    }));
  });
}

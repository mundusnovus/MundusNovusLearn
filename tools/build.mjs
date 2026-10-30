// Builds the courses into public/course/: <course>.json is the map (chapters, modules, lesson titles), and
// <course>/<lesson>.json is each lesson's page. The test code and the solutions stay on the server; the browser gets
// each test's sentence only. Also writes public/highlight.js from src/markdown.mjs, so the editor colours Swift the
// same way the lessons do.
//
//   node tools/build.mjs
import { writeFileSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCourse } from '../src/curriculum.mjs';
import { render } from '../src/markdown.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'), OUT = join(ROOT, 'public', 'course');
const inlineMd = (s) => render(s).replace(/^<p>([\s\S]*)<\/p>$/, '$1');

for (const id of ['swift']) {
  const course = loadCourse(join(ROOT, 'curriculum', id));
  rmSync(join(OUT, id), { recursive: true, force: true });
  mkdirSync(join(OUT, id), { recursive: true });
  const all = course.chapters.flatMap((c) => c.modules.flatMap((m) => m.lessons.map((l) => ({ l, m, c }))));
  all.forEach(({ l, m, c }, i) => {
    const page = {
      id: l.id, title: l.title, type: l.type, minutes: l.minutes, module: m.title, moduleId: m.id, chapter: c.title,
      description: render(l.description), instructions: render(l.instructions),
      runnable: !!l.tests, tests: (l.tests || []).map((t) => inlineMd(t.text)), seed: l.seed ?? null,
      hints: (l.hints || []).map(render), checklist: (l.checklist || []).map(inlineMd),
      questions: (l.questions || []).map((q) => ({ question: inlineMd(q.question), detail: render(q.detail), answers: q.answers.map((a) => ({ text: inlineMd(a.text), correct: a.correct })), why: inlineMd(q.why) })),
      previous: all[i - 1] ? { id: all[i - 1].l.id, title: all[i - 1].l.title } : null,
      next: all[i + 1] ? { id: all[i + 1].l.id, title: all[i + 1].l.title } : null,
    };
    writeFileSync(join(OUT, id, l.id + '.json'), JSON.stringify(page));
  });
  const map = { id: course.id, title: course.title, subtitle: course.subtitle, summary: render(course.summary || ''), versions: course.versions,
    chapters: course.chapters.map((c) => ({ title: c.title, summary: c.summary || '', modules: c.modules.map((m) => ({ id: m.id, title: m.title, summary: m.summary || '',
      lessons: m.lessons.map((l) => ({ id: l.id, title: l.title, type: l.type, minutes: l.minutes })) })) })) };
  writeFileSync(join(OUT, id + '.json'), JSON.stringify(map));
  console.log(id + ': ' + all.length + ' lessons, ' + all.filter((x) => x.l.tests).length + ' with code to check');
}

const src = readFileSync(join(ROOT, 'src', 'markdown.mjs'), 'utf8');
const hl = src.slice(src.indexOf('const KEYWORDS'), src.indexOf('function inline('));
writeFileSync(join(ROOT, 'public', 'highlight.js'), '/* Written by tools/build.mjs from src/markdown.mjs. */\n(function () {\nconst esc = (s) => String(s).replace(/&/g, \'&amp;\').replace(/</g, \'&lt;\').replace(/>/g, \'&gt;\').replace(/"/g, \'&quot;\');\n' +
  hl.replace('export function highlight', 'function highlight') + 'window.mnHighlight = highlight;\n})();\n');

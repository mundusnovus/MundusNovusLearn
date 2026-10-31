// Exports a course for the Swift: Zero to Hero Mac app (the SwiftCourseMacApp repository): every lesson with its
// text as structured blocks, its starting code, its tests (the app runs them itself, with the Mac's Swift compiler),
// questions and checklist. Solutions stay here.
//
//   node tools/export-app.mjs ../SwiftCourseApp/Resources/course.json ../SwiftCourseApp/Resources/solutions.json
//
// The second, optional file holds every solution, for the app's self-test (--self-test) only; it is never shipped in the app.
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCourse } from '../src/curriculum.mjs';
import { blocks } from '../src/markdown.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2], solutionsOut = process.argv[3];
if (!out) { console.error('usage: node tools/export-app.mjs <course.json>'); process.exit(1); }
const course = loadCourse(join(ROOT, 'curriculum', 'swift'));
const data = {
  id: course.id, title: course.title, subtitle: course.subtitle, versions: course.versions, summary: course.summary,
  chapters: course.chapters.map((c) => ({ title: c.title, summary: c.summary || '', modules: c.modules.map((m) => ({ id: m.id, title: m.title,
    lessons: m.lessons.map((l) => ({
      id: l.id, title: l.title, type: l.type, minutes: l.minutes,
      description: blocks(l.description), instructions: blocks(l.instructions),
      seed: l.seed ?? null,
      tests: (l.tests || []).map((t) => ({ text: t.text, checks: t.checks })),
      hints: l.hints || [], checklist: l.checklist || [],
      questions: (l.questions || []).map((q) => ({ question: q.question, detail: blocks(q.detail), answers: q.answers, why: q.why })),
    })) })) })),
};
writeFileSync(out, JSON.stringify(data));
if (solutionsOut) {
  const solutions = {};
  for (const c of course.chapters) for (const m of c.modules) for (const l of m.lessons) if (l.tests) solutions[l.id] = l.solution;
  writeFileSync(solutionsOut, JSON.stringify(solutions, null, 1));
}
const all = data.chapters.flatMap((c) => c.modules.flatMap((m) => m.lessons));
console.log('exported ' + all.length + ' lessons (' + all.filter((l) => l.tests.length).length + ' with code) to ' + out);

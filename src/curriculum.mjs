// Reads a course from curriculum/<course>/: course.json lists chapters and modules; each module is one Markdown file
// (curriculum/<course>/<module>.md) holding its lessons in order, each starting with its own front matter:
//
//   ---
//   id: swift-values-constants        (unique across the course; it is the lesson's address)
//   title: Constants with let
//   type: lesson                      (lesson, workshop, lab, quiz, xcode or project)
//   minutes: 6
//   ---
//   # --description--     what to learn, in Markdown
//   # --instructions--    what to do (lessons with code)
//   # --tests--           pairs of a sentence and a fenced block: ```swift runs after your code and calls
//                         expect(...); ```output is a regular expression your printed output must match (```!output
//                         must not match);
//                         ```source is a regular expression your code must match (```!source must not match)
//   # --seed--            the starting code (```swift); "@previous" starts from the previous lesson's solution
//   # --solution--        a passing answer, checked by the tests in test/curriculum.test.mjs
//   # --hints--           a list of nudges, shown one at a time
//   # --questions--       for quizzes: "## question", then "- [ ]" and "- [x]" answers, then "Why: …"
//   # --checklist--       for Xcode lessons: "- " items the learner ticks off on their Mac
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const TYPES = ['lesson', 'workshop', 'lab', 'quiz', 'xcode', 'project'];

function fences(md) {
  const out = []; const rx = /```(!?\w*)\n([\s\S]*?)\n```/g; let m;
  while ((m = rx.exec(md))) out.push({ lang: m[1], code: m[2], at: m.index, end: rx.lastIndex });
  return out;
}

export function parseLesson(text, file = '') {
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!fm) throw new Error(file + ': missing front matter');
  const meta = {};
  for (const line of fm[1].split('\n')) { const m = /^(\w+):\s*(.*)$/.exec(line); if (m) meta[m[1]] = m[2].trim().replace(/^"(.*)"$/, '$1'); }
  if (!meta.id || !meta.title) throw new Error(file + ': needs id and title');
  meta.type = meta.type || 'lesson';
  if (!TYPES.includes(meta.type)) throw new Error(file + ': unknown type ' + meta.type);
  const body = text.slice(fm[0].length), sections = {};
  const parts = body.split(/^# --([a-z]+)--\s*$/m);
  for (let i = 1; i < parts.length; i += 2) sections[parts[i]] = parts[i + 1].trim();
  const lesson = { id: meta.id, title: meta.title, type: meta.type, minutes: Number(meta.minutes) || 5, file,
    description: sections.description || '', instructions: sections.instructions || '' };

  if (sections.tests) {
    const tests = [], fs = fences(sections.tests); let last = 0;
    for (const f of fs) {
      const text = sections.tests.slice(last, f.at).trim(); last = f.end;
      const kind = { swift: 'swift', output: 'output', '!output': 'nooutput', source: 'source', '!source': 'nosource' }[f.lang];
      if (!kind) throw new Error(file + ': unknown test block ```' + f.lang);
      if (!text && !tests.length) throw new Error(file + ': the first test needs a sentence before its block');
      if (text) tests.push({ text, checks: [] });
      tests[tests.length - 1].checks.push({ kind, code: f.code }); // a sentence followed by several blocks: all must pass
    }
    lesson.tests = tests;
  }
  const code = (name) => { const f = sections[name] && fences(sections[name])[0]; return f ? f.code : (sections[name] || '').trim() || null; };
  if (sections.seed != null) lesson.seed = code('seed');
  if (sections.solution != null) lesson.solution = code('solution');
  if (sections.hints) lesson.hints = sections.hints.split(/\n(?=- )/).map((h) => h.replace(/^- /, '').trim()).filter(Boolean);
  if (sections.checklist) lesson.checklist = sections.checklist.split('\n').filter((l) => /^- /.test(l)).map((l) => l.slice(2).trim());
  if (sections.questions) {
    lesson.questions = sections.questions.split(/^## /m).filter((q) => q.trim()).map((q) => {
      const lines = q.split('\n'), prompt = [], answers = []; let why = '';
      for (const l of lines.slice(1)) {
        const a = /^- \[( |x)\] (.*)/.exec(l);
        if (a) answers.push({ text: a[2], correct: a[1] === 'x' });
        else if (/^Why:/.test(l)) why = l.replace(/^Why:\s*/, '');
        else if (!answers.length) prompt.push(l);
      }
      if (answers.filter((a) => a.correct).length !== 1) throw new Error(file + ': each question needs exactly one right answer: ' + lines[0]);
      return { question: lines[0].trim(), detail: prompt.join('\n').trim(), answers, why };
    });
  }
  if (lesson.type === 'quiz' && !lesson.questions) throw new Error(file + ': a quiz needs questions');
  if (lesson.tests && lesson.solution == null) throw new Error(file + ': lessons with tests need a solution');
  return lesson;
}

/** The whole course: { id, title, …, chapters: [{ title, modules: [{ id, title, lessons: [...] }] }] } with seeds resolved. */
export function loadCourse(dir) {
  const course = JSON.parse(readFileSync(join(dir, 'course.json'), 'utf8')), seen = new Set();
  let previous = null;
  for (const ch of course.chapters) {
    for (const mod of ch.modules) {
      const file = join(dir, mod.id + '.md');
      mod.lessons = existsSync(file) ? readFileSync(file, 'utf8').split(/^(?=---\nid: )/m).filter((t) => t.trim()).map((t, i) => parseLesson(t, mod.id + '.md #' + (i + 1))) : [];
      for (const l of mod.lessons) {
        if (seen.has(l.id)) throw new Error('two lessons have the id ' + l.id);
        seen.add(l.id);
        if (l.seed === '@previous') {
          if (!previous || previous.solution == null) throw new Error(l.file + ': @previous needs a previous lesson with a solution');
          l.seed = previous.solution;
        }
        previous = l;
      }
    }
  }
  return course;
}

export function lessonsOf(course) { return course.chapters.flatMap((c) => c.modules.flatMap((m) => m.lessons)); }

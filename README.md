# Mundus Novus Learn

Free, open courses at **learn.mundusnovus.org**. Tech from the New World, open source and freely given.

The first course is **Swift: Zero to Hero**: Swift 6.4 from a first `print` to apps for iPhone, iPad and Mac with
SwiftUI, shipped through TestFlight and the App Store with the Apple Developer Program. It has nine chapters,
34 modules and 161 lessons.

- **Chapters 1 to 4, the Swift language**, run in the browser. Each exercise compiles with the real Swift 6.4 compiler
  on our server and is checked by tests, the way freeCodeCamp checks JavaScript.
- **Chapters 5 to 9, Apple apps**, happen in Xcode 27 on your Mac, with checklists and questions.

Sign in with your Mundus Novus account (the one you use on MNSocial) to run code and keep your progress.

## How it is built

Node 24 with no packages, and the Swift toolchain. Lessons are Markdown.

| Path | What it is |
| --- | --- |
| `curriculum/swift/course.json` | Chapters and modules, in order |
| `curriculum/swift/<module>.md` | One module's lessons, each with its own front matter (format in `src/curriculum.mjs`) |
| `src/runner.mjs` | Compiles and runs a learner's code with a lesson's tests |
| `server.mjs` | The site, progress, and the run endpoint |
| `tools/build.mjs` | Builds `public/course/` from the Markdown; run it after changing a lesson |
| `public/` | The site in the browser |

Exercises compile in Swift 6 language mode with the settings Xcode gives new app projects: code is on the main actor
by default (`-default-isolation MainActor`), and nonisolated async functions run on their caller's actor.

## Writing a lesson

A lesson is Markdown with sections: `# --description--`, `# --instructions--`, `# --tests--`, `# --seed--`,
`# --solution--`, `# --hints--`, `# --questions--` and `# --checklist--`. A test is a sentence followed by one or more
fenced blocks, all of which must pass:

- ` ```swift ` runs after the learner's code; call `expect(condition)`.
- ` ```output ` (or ` ```!output `) is a regular expression the printed output must (or must not) match.
- ` ```source ` (or ` ```!source `) is a regular expression the code must (or must not) match.

`@previous` as a seed starts from the previous lesson's solution (for workshops).

## Run it

```bash
node tools/build.mjs
node server.mjs
```

Tests: `node --test test/*.test.mjs` checks the server, and that **every lesson's solution passes its tests and every
starting point does not** (needs `swiftc` 6.4). Check one module with `LESSONS=values node --test test/curriculum.test.mjs`.

## On the server

The `Dockerfile` builds on the official Swift 6.4.2 image, adds Node 24, and runs learners' code as an unprivileged
user (`RUNNER_USER`) with CPU, memory, process and file limits and a timeout. Runs need a sign-in and are limited per
hour (`RUNS_PER_HOUR`). Settings: `PORT`, `DATA_DIR` (a volume, for progress), `SOCIAL_URL`.

## License

The Mundus Novus License 1.0 (GPL-3.0); see [LICENSE](LICENSE). Swift, SwiftUI, Xcode and other Apple names are
trademarks of Apple Inc. This course is independent and not endorsed by Apple.

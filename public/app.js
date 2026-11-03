/* Asteria Learn in the browser. Routes: / (home), /swift/ (the course), /swift/<lesson>.
   Views are built from DOM nodes; lesson HTML comes from our own build (tools/build.mjs), already escaped. */
(function () {
  'use strict';
  var main = document.getElementById('main'), me = null, maps = {}, progress = { done: {}, code: {} };
  var SOCIAL = location.hostname.endsWith('asteria.technology') ? 'https://social.asteria.technology' : 'https://social.asteria.technology';
  var KIND = { lesson: 'Lesson', workshop: 'Workshop', lab: 'Lab', quiz: 'Quiz', xcode: 'Xcode', project: 'Project' };

  // ---------------------------------------------------------------- helpers
  function h(tag, a) {
    var e = document.createElement(tag);
    for (var k in a || {}) { var v = a[k]; if (v == null || v === false) continue;
      if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k === 'html') e.innerHTML = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v); }
    for (var i = 2; i < arguments.length; i++) add(e, arguments[i]);
    return e;
  }
  function add(e, c) { if (c == null || c === false) return; if (Array.isArray(c)) c.forEach(function (x) { add(e, x); }); else e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); }
  function api(method, path, body) {
    return fetch('/api/' + path, { method: method, credentials: 'same-origin', headers: body ? { 'content-type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw Object.assign(new Error(j.error || 'Something went wrong.'), { status: r.status }); return j; }); });
  }
  var toastT; function toast(t) { var e = document.getElementById('toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { e.classList.remove('on'); }, 3200); }
  var store = {
    // progress saved under the earlier name still counts
    get: function (k, d) { try { var v = localStorage.getItem('as.learn.' + k); if (v == null) v = localStorage.getItem('mn.learn.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('as.learn.' + k, JSON.stringify(v)); } catch (e) {} }
  };
  function signInUrl() { return SOCIAL + '/signin?return=' + encodeURIComponent(location.href); }
  function go(path, replace) { if (replace) history.replaceState(null, '', path); else history.pushState(null, '', path); route(); }
  function link(e) { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; var a = e.currentTarget; if (a.origin !== location.origin) return; e.preventDefault(); go(a.pathname); }
  function a(href, text, cls) { return h('a', { href: href, class: cls || null, onclick: link, text: text }); }
  function done(id) { return !!progress.done[id]; }
  function markDone(id, code) {
    progress.done[id] = Date.now(); if (code != null) progress.code[id] = code;
    if (!me) store.set('progress', progress);
  }
  function mapOf(course) {
    if (maps[course]) return Promise.resolve(maps[course]);
    return fetch('/course/' + course + '.json').then(function (r) { return r.json(); }).then(function (m) { return (maps[course] = m); });
  }
  function lessonsIn(map) { return map.chapters.reduce(function (all, c) { return all.concat(c.modules.reduce(function (x, m) { return x.concat(m.lessons); }, [])); }, []); }
  function bar(n, of) { var p = of ? Math.round(n / of * 100) : 0; return h('div', { class: 'meter', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(p), 'aria-label': n + ' of ' + of + ' done' }, h('i', { style: 'width:' + p + '%' })); }

  // ---------------------------------------------------------------- account and progress
  function account() {
    var el = document.getElementById('account'); el.textContent = '';
    if (me) el.appendChild(h('span', { class: 'who' }, me.avatar ? h('img', { src: me.avatar, alt: '' }) : h('span', { class: 'avatar', text: (me.display || me.name)[0] }), h('span', { text: me.display || me.name })));
    else el.appendChild(h('a', { class: 'btn small', href: signInUrl(), text: 'Sign in' }));
  }
  function loadProgress() {
    return api('GET', 'progress').then(function (p) {
      if (!p.signedIn) { progress = store.get('progress', { done: {}, code: {} }); return; }
      var local = store.get('progress', null);
      if (local && Object.keys(local.done || {}).length) { // bring progress made before signing in
        api('POST', 'progress/import', { done: local.done }).catch(function () {});
        Object.keys(local.done).forEach(function (k) { if (!p.done[k]) p.done[k] = local.done[k]; });
        store.set('progress', null);
      }
      progress = { done: p.done || {}, code: p.code || {} };
    }).catch(function () { progress = store.get('progress', { done: {}, code: {} }); });
  }

  // ---------------------------------------------------------------- home
  function home() {
    document.title = 'Asteria Learn — Swift and the apps';
    return mapOf('swift').then(function (map) {
      var all = lessonsIn(map), n = all.filter(function (l) { return done(l.id); }).length, next = all.find(function (l) { return !done(l.id); }) || all[0];
      main.replaceChildren(
        h('section', { class: 'hero' },
          h('img', { class: 'hero-mark', src: '/brand/learn-mark.svg', alt: '' }),
          h('h1', { class: 'display', text: 'Learn to build anything.' }),
          h('p', { class: 'lede', text: 'Free, open courses from Asteria Technology. Start with the free Swift web course, write real code in the browser, then meet the 2.0 app for iPhone, iPad and Mac.' })),
        h('section', { class: 'courses', 'aria-label': 'Courses' },
          h('article', { class: 'course-card' },
            h('img', { src: '/brand/swift-course.svg', alt: '', class: 'course-art' }),
            h('div', {},
              h('p', { class: 'eyebrow', text: map.versions }),
              h('h2', { class: 'display', text: map.title }),
              h('p', { text: map.subtitle }),
              bar(n, all.length),
              h('p', { class: 'quiet', text: n ? n + ' of ' + all.length + ' lessons done' : all.length + ' lessons · ' + map.chapters.length + ' chapters · free' }),
              h('div', { class: 'actions' }, a('/swift/' + next.id, n ? 'Continue: ' + next.title : 'Start the course', 'btn primary'), a('/swift/', 'See every lesson', 'btn'))))),
        h('section', { class: 'how' },
          h('div', {}, h('h3', { text: 'Write real code' }), h('p', { text: 'Every Swift lesson has an editor. Press Run and the tests tell you exactly what works and what to fix. The compiler is not impressed by effort; it is impressed by passing tests.' })),
          h('div', {}, h('h3', { text: 'Build real apps' }), h('p', { text: 'Then move to Xcode and build native apps for iPhone, iPad, Mac and Watch. The apps on asteria.technology use the same Swift, SwiftUI, SwiftData, App Intents and CloudKit you learn here.' })),
          h('div', {}, h('h3', { text: 'Free, for good' }), h('p', {}, 'The course is open source under the Asteria License. The apps it teaches are proprietary, because someone has to pay for the coffee. ', h('a', { href: 'https://github.com/mundusnovus/MNLearn', text: 'Read the source' }), '.'))),
        h('section', { class: 'apps' },
          h('div', { class: 'apps-head' }, h('p', { class: 'eyebrow', text: 'Built with this course' }), h('h2', { class: 'display', text: 'The apps' }), h('p', { class: 'lede', text: 'Six native apps and a free course, all built on the same Swift stack. The course is the tutorial. These are the homework.' })),
          h('div', { class: 'app-grid' },
            h('a', { class: 'app-card', href: 'https://asteria.technology/browse/' }, h('img', { src: '/brand/apps/browse.png', alt: '' }), h('div', {}, h('h3', { text: 'Asteria Browse' }), h('p', { text: 'Spaces, private tabs and Asteria Search with on-device Apple Intelligence.' }), h('span', { class: 'app-meta', text: 'Mac · iPhone · iPad' }))),
            h('a', { class: 'app-card', href: 'https://asteria.technology/keys/' }, h('img', { src: '/brand/apps/keys.png', alt: '' }), h('div', {}, h('h3', { text: 'Asteria Keys' }), h('p', { text: 'An encrypted vault with passkeys, AutoFill and ciphertext-only iCloud sync.' }), h('span', { class: 'app-meta', text: 'Mac · iPhone · iPad' }))),
            h('a', { class: 'app-card', href: 'https://asteria.technology/timeclock/' }, h('img', { src: '/brand/apps/timeclock.png', alt: '' }), h('div', {}, h('h3', { text: 'Asteria Timeclock' }), h('p', { text: 'Punch in, break, clock out, and export a timesheet that looks deliberate.' }), h('span', { class: 'app-meta', text: 'Mac · iPhone · iPad · Watch' }))),
            h('a', { class: 'app-card', href: 'https://asteria.technology/foodandmood/' }, h('img', { src: '/brand/apps/foodandmood.png', alt: '' }), h('div', {}, h('h3', { text: 'Food and Mood' }), h('p', { text: 'The six-column journal, filled in by Apple Intelligence after you approve it.' }), h('span', { class: 'app-meta', text: 'iPhone' }))),
            h('a', { class: 'app-card', href: 'https://asteria.technology/swift/' }, h('img', { src: '/brand/apps/zerotohero.png', alt: '' }), h('div', {}, h('h3', { text: 'Swift: Zero to Hero' }), h('p', { text: 'This course, in an app, with an on-device engine and a coach that will not give you the answer.' }), h('span', { class: 'app-meta', text: 'Mac · iPhone · iPad' }))),
            h('a', { class: 'app-card', href: 'https://asteria.technology/box-swift/' }, h('img', { src: '/brand/apps/box.png', alt: '' }), h('div', {}, h('h3', { text: 'Asteria Box' }), h('p', { text: 'A native music maker with Foundation Models, patterns and Siri in the audio domain.' }), h('span', { class: 'app-meta', text: 'In development' }))))),
        h('section', { class: 'pad' },
          h('div', { class: 'note' }, h('p', {}, h('b', { text: 'Swift: Zero to Hero 2.0 is coming to the App Store. ' }), 'The whole course for iPhone, iPad and Mac, with on-device checking, an AI coach and iCloud progress. The web course is free and open now. ', h('a', { href: '/mac/', text: 'See the Mac app' }), '.')),
          h('p', { class: 'quiet' }, h('a', { href: '/privacy/', text: 'Privacy' })))
      );
    });
  }

  // ---------------------------------------------------------------- the course map
  function courseView(course) {
    return mapOf(course).then(function (map) {
      document.title = map.title + ' · Asteria Learn';
      var all = lessonsIn(map), n = all.filter(function (l) { return done(l.id); }).length, next = all.find(function (l) { return !done(l.id); });
      main.replaceChildren.apply(main, [
        h('section', { class: 'course-head' },
          h('p', { class: 'eyebrow', text: map.versions }),
          h('h1', { class: 'display', text: map.title }),
          h('div', { class: 'lede', html: map.summary }),
          bar(n, all.length),
          h('div', { class: 'actions' }, next ? a('/' + course + '/' + next.id, n ? 'Continue: ' + next.title : 'Start: ' + next.title, 'btn primary') : h('p', { class: 'quiet', text: 'You finished the course. Well done.' }),
            me ? null : h('a', { class: 'btn', href: signInUrl(), text: 'Sign in to keep your progress' })))
      ].concat(map.chapters.map(function (c, ci) {
          return h('section', { class: 'chapter', 'aria-labelledby': 'ch' + ci },
            h('div', { class: 'chapter-head' }, h('span', { class: 'chapter-n', text: String(ci + 1).padStart(2, '0') }),
              h('div', {}, h('h2', { id: 'ch' + ci, class: 'display', text: c.title }), h('p', { class: 'quiet', text: c.summary }))),
            c.modules.map(function (m) {
              var md = m.lessons.filter(function (l) { return done(l.id); }).length, open = md > 0 && md < m.lessons.length;
              return h('details', { class: 'module', open: open || (next && m.lessons.some(function (l) { return l.id === next.id; })) },
                h('summary', {}, h('span', { class: 'module-title', text: m.title }), h('span', { class: 'module-count', text: m.lessons.length ? md + ' / ' + m.lessons.length : 'Coming soon' })),
                m.lessons.length ? h('ol', { class: 'lessons' }, m.lessons.map(function (l) {
                  return h('li', { class: done(l.id) ? 'done' : '' }, h('span', { class: 'tick', 'aria-label': done(l.id) ? 'Done' : 'Not done yet' }),
                    a('/' + course + '/' + l.id, l.title), h('span', { class: 'kind ' + l.type, text: KIND[l.type] }), h('span', { class: 'mins', text: l.minutes + ' min' }));
                })) : null);
            }));
        })));
    });
  }

  // ---------------------------------------------------------------- a lesson
  function lessonView(course, id) {
    return Promise.all([mapOf(course), fetch('/course/' + course + '/' + encodeURIComponent(id) + '.json').then(function (r) { if (!r.ok) throw new Error('missing'); return r.json(); })]).then(function (x) {
      var L = x[1]; document.title = L.title + ' · ' + x[0].title;
      var crumbs = h('nav', { class: 'crumbs', 'aria-label': 'Where you are' }, a('/' + course + '/', x[0].title), h('span', { text: L.chapter }), h('span', { text: L.module }));
      var head = h('header', { class: 'lesson-head' }, crumbs, h('div', { class: 'lesson-title' }, h('span', { class: 'kind ' + L.type, text: KIND[L.type] }), h('h1', { text: L.title }), done(L.id) ? h('span', { class: 'done-badge', text: 'Done' }) : null));
      var foot = h('nav', { class: 'lesson-nav', 'aria-label': 'Lessons' }, L.previous ? a('/' + course + '/' + L.previous.id, '← ' + L.previous.title, 'btn quiet') : h('span'), L.next ? a('/' + course + '/' + L.next.id, L.next.title + ' →', 'btn next') : a('/' + course + '/', 'Back to the course', 'btn'));
      if (L.runnable) return codeLesson(course, L, head, foot);
      var body = h('article', { class: 'reading' }, head, h('div', { class: 'prose', html: L.description }), L.instructions ? h('div', { class: 'prose', html: L.instructions }) : null);
      if (L.checklist.length) body.appendChild(checklist(L));
      if (L.questions.length) body.appendChild(quiz(L));
      if (!L.checklist.length && !L.questions.length && !done(L.id)) body.appendChild(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', text: 'Mark as read', onclick: function () { complete(L).then(function () { route(); }); } })));
      body.appendChild(foot);
      main.replaceChildren(h('div', { class: 'reading-wrap' }, body));
      main.focus({ preventScroll: true }); scrollTo(0, 0);
    }).catch(function () { main.replaceChildren(h('div', { class: 'pad' }, h('h1', { class: 'display', text: 'Not here' }), h('p', {}, 'There is no lesson at this address. ', a('/' + course + '/', 'See the course')))); });
  }

  function complete(L, answers) {
    if (!me) { markDone(L.id); toast('Done. Sign in to keep your progress on every device.'); return Promise.resolve(); }
    return api('POST', 'progress', { id: L.id, answers: answers }).then(function () { markDone(L.id); toast('Lesson done.'); }).catch(function (e) { toast(e.message); });
  }

  function checklist(L) {
    var key = 'check.' + L.id, ticks = store.get(key, {}), list = h('ul', { class: 'checklist' });
    L.checklist.forEach(function (item, i) {
      var box = h('input', { type: 'checkbox', id: 'c' + i, checked: !!ticks[i] || done(L.id), onchange: function () { ticks[i] = box.checked; store.set(key, ticks); update(); } });
      list.appendChild(h('li', {}, box, h('label', { for: 'c' + i, html: item })));
    });
    var btn = h('button', { class: 'btn primary', type: 'button', text: done(L.id) ? 'Done' : 'Mark as done', disabled: true, onclick: function () { complete(L).then(route); } });
    function update() { btn.disabled = done(L.id) || L.questions.length > 0 || !L.checklist.every(function (_, i) { return ticks[i]; }); }
    update();
    return h('section', { class: 'check-card' }, h('h2', { text: 'On your Mac' }), list, L.questions.length ? h('p', { class: 'quiet', text: 'Tick these off, then answer the questions below to finish.' }) : h('div', { class: 'actions' }, btn));
  }

  function quiz(L) {
    var picks = [], form = h('form', { class: 'quiz', onsubmit: function (e) { e.preventDefault(); check(); } });
    L.questions.forEach(function (q, qi) {
      var fs = h('fieldset', { class: 'question' }, h('legend', { html: (qi + 1) + '. ' + q.question }), q.detail ? h('div', { class: 'prose', html: q.detail }) : null);
      q.answers.forEach(function (ans, ai) {
        fs.appendChild(h('label', { class: 'answer' }, h('input', { type: 'radio', name: 'q' + qi, value: String(ai), onchange: function () { picks[qi] = ai; fs.classList.remove('right', 'wrong'); } }), h('span', { html: ans.text })));
      });
      fs.appendChild(h('p', { class: 'why', html: q.why }));
      form.appendChild(fs);
    });
    form.appendChild(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'submit', text: done(L.id) ? 'Check again' : 'Check my answers' })));
    function check() {
      var right = 0;
      L.questions.forEach(function (q, qi) {
        var fs = form.querySelectorAll('fieldset')[qi], ok = picks[qi] != null && q.answers[picks[qi]].correct;
        fs.classList.toggle('right', ok); fs.classList.toggle('wrong', !ok && picks[qi] != null); if (ok) right++;
      });
      if (right === L.questions.length) {
        var boxes = document.querySelectorAll('.checklist input');
        if (boxes.length && !Array.prototype.every.call(boxes, function (b) { return b.checked; })) return toast('All right. Tick off the checklist too, then check again.');
        complete(L, picks).then(function () { form.querySelector('.actions').replaceChildren(h('p', { class: 'pass', text: 'All right. ' }), L.next ? a('/swift/' + L.next.id, 'Next: ' + L.next.title + ' →', 'btn primary') : null); });
      } else toast(right + ' of ' + L.questions.length + ' right. Have another look at the ones marked.');
    }
    return h('section', { class: 'quiz-card' }, h('h2', { text: L.type === 'quiz' ? 'Questions' : 'Check your understanding' }), form);
  }

  // ---------------------------------------------------------------- lessons with code
  function codeLesson(course, L, head, foot) {
    var draftKey = 'draft.' + L.id, start = store.get(draftKey, null) ?? progress.code[L.id] ?? L.seed ?? '';
    var ed = editor(start, function (v) { store.set(draftKey, v); }, run);
    var testsList = h('ol', { class: 'tests' }, L.tests.map(function (t) { return h('li', { html: t }); }));
    var out = h('pre', { class: 'console', 'aria-live': 'polite', text: 'Press Run (⌘↩) to check your code.' });
    var runBtn = h('button', { class: 'btn primary', type: 'button', onclick: run }, '▶ Run');
    var hintAt = 0, hints = h('div', { class: 'hints' });
    var hintBtn = L.hints.length ? h('button', { class: 'btn quiet', type: 'button', text: 'Get a hint', onclick: function () { if (hintAt < L.hints.length) hints.appendChild(h('div', { class: 'hint', html: L.hints[hintAt++] })); if (hintAt >= L.hints.length) hintBtn.disabled = true; } }) : null;
    var resetBtn = h('button', { class: 'btn quiet', type: 'button', text: 'Reset', onclick: function () { if (confirm('Start this exercise again from the beginning? Your changes will be lost.')) { ed.set(L.seed || ''); store.set(draftKey, null); } } });
    var left = h('article', { class: 'pane-left' }, head,
      h('div', { class: 'prose', html: L.description }),
      L.instructions ? h('section', { class: 'task' }, h('h2', { text: 'Your task' }), h('div', { class: 'prose', html: L.instructions })) : null,
      h('section', { class: 'test-card' }, h('h2', { text: 'Tests' }), testsList), hints, foot);
    var right = h('section', { class: 'pane-right', 'aria-label': 'Code' },
      h('div', { class: 'ed-bar' }, h('span', { class: 'file', text: 'main.swift' }), h('span', { class: 'grow' }), resetBtn, hintBtn, runBtn),
      ed.el, h('div', { class: 'console-wrap' }, h('div', { class: 'console-head', text: 'Console' }), out));
    main.replaceChildren(h('div', { class: 'workspace' }, left, right));
    scrollTo(0, 0);

    var running = false;
    function run() {
      if (running) return;
      if (!me) { out.replaceChildren(h('span', {}, 'Sign in with your Asteria account to run your code. ', h('a', { href: signInUrl(), text: 'Sign in' }))); return; }
      running = true; runBtn.disabled = true; runBtn.textContent = 'Running…'; out.textContent = 'Compiling and running your code…'; ed.mark([]);
      api('POST', 'run', { id: L.id, code: ed.value() }).then(function (r) {
        var lis = testsList.querySelectorAll('li');
        r.tests.forEach(function (t, i) { lis[i].classList.toggle('pass', t.pass); lis[i].classList.toggle('fail', !t.pass); });
        out.replaceChildren();
        if (!r.compiled) {
          out.appendChild(h('span', { class: 'err', text: r.timedOut ? 'Compiling took too long.' : 'Your code did not compile:' }));
          r.errors.forEach(function (e) { out.appendChild(h('span', { class: 'err-line' }, e.line ? h('button', { type: 'button', class: 'line-link', text: 'line ' + e.line, onclick: function () { ed.goTo(e.line); } }) : null, ' ' + e.message)); });
          ed.mark(r.errors.map(function (e) { return e.line; }).filter(Boolean));
        } else {
          if (r.output) out.appendChild(h('span', { class: 'stdout', text: r.output }));
          if (r.timedOut) out.appendChild(h('span', { class: 'err', text: '\nYour program ran for too long and was stopped. Is there a loop that never ends?' }));
          else if (r.crashed) out.appendChild(h('span', { class: 'err', text: '\nYour program crashed: ' + r.crash }));
          if (!r.output && !r.timedOut && !r.crashed) out.appendChild(h('span', { class: 'quiet', text: '(Nothing was printed.)' }));
        }
        if (r.passed) {
          markDone(L.id, ed.value());
          out.appendChild(h('span', { class: 'pass', text: '\n\nEvery test passes. Lesson done.' }));
          if (L.next) right.appendChild(h('div', { class: 'passed' }, h('span', { text: 'Every test passes.' }), a('/' + course + '/' + L.next.id, 'Next: ' + L.next.title + ' →', 'btn primary')));
        }
      }).catch(function (e) { out.replaceChildren(h('span', { class: 'err', text: e.message })); if (e.status === 401) { me = null; account(); } })
        .then(function () { running = false; runBtn.disabled = false; runBtn.textContent = '▶ Run'; });
    }
  }

  // A light code editor: a textarea over a highlighted copy of the same text, with line numbers.
  function editor(text, onChange, onRun) {
    var ta = h('textarea', { class: 'ed-input', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', 'aria-label': 'Your Swift code' });
    var pre = h('pre', { class: 'ed-view', 'aria-hidden': 'true' }), code = h('code'); pre.appendChild(code);
    var nums = h('div', { class: 'ed-lines', 'aria-hidden': 'true' }), marked = [];
    var wrap = h('div', { class: 'editor' }, nums, h('div', { class: 'ed-stack' }, pre, ta));
    function paint() {
      var v = ta.value; code.innerHTML = (window.mnHighlight ? window.mnHighlight(v) : v.replace(/&/g, '&amp;').replace(/</g, '&lt;')) + '\n';
      var n = v.split('\n').length, html = '';
      for (var i = 1; i <= n; i++) html += '<span' + (marked.indexOf(i) >= 0 ? ' class="bad"' : '') + '>' + i + '</span>';
      nums.innerHTML = html;
    }
    ta.value = text; paint();
    ta.addEventListener('input', function () { paint(); onChange(ta.value); });
    ta.addEventListener('scroll', function () { pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft; nums.scrollTop = ta.scrollTop; });
    ta.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); onRun(); return; }
      var s = ta.selectionStart, en = ta.selectionEnd, v = ta.value;
      if (e.key === 'Tab' && !e.shiftKey && !e.altKey) { // Esc then Tab leaves the editor
        if (ta.dataset.escaped) { delete ta.dataset.escaped; return; }
        e.preventDefault(); ta.setRangeText('    ', s, en, 'end'); paint(); onChange(ta.value); return;
      }
      if (e.key === 'Escape') { ta.dataset.escaped = '1'; return; }
      if (e.key === 'Enter' && !e.shiftKey) {
        var lineStart = v.lastIndexOf('\n', s - 1) + 1, indent = /^\s*/.exec(v.slice(lineStart, s))[0];
        if (/[{(\[]\s*$/.test(v.slice(lineStart, s))) indent += '    ';
        e.preventDefault(); ta.setRangeText('\n' + indent, s, en, 'end'); paint(); onChange(ta.value); return;
      }
      if (e.key === '}' && /^\s+$/.test(v.slice(v.lastIndexOf('\n', s - 1) + 1, s))) {
        var ls = v.lastIndexOf('\n', s - 1) + 1, cur = v.slice(ls, s);
        if (cur.length >= 4) { e.preventDefault(); ta.setRangeText(cur.slice(4) + '}', ls, en, 'end'); paint(); onChange(ta.value); }
      }
    });
    return {
      el: wrap, value: function () { return ta.value; },
      set: function (v) { ta.value = v; paint(); onChange(v); },
      mark: function (lines) { marked = lines; paint(); },
      goTo: function (line) { var lines = ta.value.split('\n'), pos = 0; for (var i = 0; i < line - 1 && i < lines.length; i++) pos += lines[i].length + 1; ta.focus(); ta.setSelectionRange(pos, pos + (lines[line - 1] || '').length); }
    };
  }

  // ---------------------------------------------------------------- routing
  function route() {
    var parts = location.pathname.split('/').filter(Boolean);
    document.querySelectorAll('.bar nav a').forEach(function (n) { n.classList.toggle('on', n.pathname === '/' + (parts[0] || '') + '/'); });
    if (!parts.length) return home();
    if (parts[0] === 'swift' && parts.length === 1) return courseView('swift');
    if (parts[0] === 'swift') return lessonView('swift', parts[1]);
    main.replaceChildren(h('div', { class: 'pad' }, h('h1', { class: 'display', text: 'Not here' }), h('p', {}, 'Try ', a('/', 'the home page'), '.')));
  }
  addEventListener('popstate', route);
  document.querySelectorAll('[data-go]').forEach(function (n) { n.addEventListener('click', link); });
  api('GET', 'me').then(function (r) { me = r.user; }).catch(function () {}).then(function () { account(); return loadProgress(); }).then(route);
})();

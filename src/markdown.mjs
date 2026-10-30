// A small Markdown renderer for lessons, and a Swift highlighter shared with the browser editor (public/highlight.js
// is this file's highlight() copied by tools/build.mjs). Lessons are written by us, but everything is still escaped:
// nothing in a lesson can become script.

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const KEYWORDS = new Set(('actor any associatedtype async await break case catch class consume continue convenience default defer deinit ' +
  'didSet do dynamic else enum extension fallthrough false fileprivate final for func get guard if import in indirect infix init inout ' +
  'internal is isolated lazy let mutating nil nonisolated nonmutating open operator optional override package postfix precedencegroup ' +
  'prefix private protocol public repeat required rethrows return self Self set some static struct subscript super switch throw throws ' +
  'true try typealias unowned var weak where while willSet borrowing consuming sending').split(' '));

/** Swift source to HTML with <span class="t-…"> tokens. */
export function highlight(src) {
  const out = []; let i = 0; const s = String(src);
  const push = (cls, text) => out.push(cls ? '<span class="t-' + cls + '">' + esc(text) + '</span>' : esc(text));
  while (i < s.length) {
    const rest = s.slice(i); let m;
    if ((m = /^\/\/[^\n]*/.exec(rest))) { push('comment', m[0]); i += m[0].length; continue; }
    if ((m = /^\/\*[\s\S]*?(\*\/|$)/.exec(rest))) { push('comment', m[0]); i += m[0].length; continue; }
    if ((m = /^"""[\s\S]*?("""|$)/.exec(rest)) || (m = /^"(?:[^"\\\n]|\\.)*"?/.exec(rest))) { push('string', m[0]); i += m[0].length; continue; }
    if ((m = /^(?:0x[0-9a-fA-F_]+|0b[01_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:e[+-]?\d+)?)/.exec(rest))) { push('number', m[0]); i += m[0].length; continue; }
    if ((m = /^[@#][A-Za-z_]\w*/.exec(rest))) { push('attr', m[0]); i += m[0].length; continue; }
    if ((m = /^[A-Za-z_]\w*/.exec(rest))) {
      const w = m[0];
      push(KEYWORDS.has(w) ? 'keyword' : /^[A-Z]/.test(w) ? 'type' : /^\s*\(/.test(s.slice(i + w.length)) ? 'call' : '', w);
      i += w.length; continue;
    }
    push('', s[i]); i++;
  }
  return out.join('');
}

function inline(text) {
  // code spans first, so nothing inside them is touched
  const parts = String(text).split(/(`[^`]+`)/);
  return parts.map((p) => {
    if (/^`[^`]+`$/.test(p)) return '<code>' + esc(p.slice(1, -1)) + '</code>';
    let h = esc(p);
    h = h.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g, (_, t, u) => '<a href="' + u + '"' + (/^https?:/.test(u) ? ' target="_blank" rel="noopener"' : '') + '>' + t + '</a>');
    h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
    h = h.replace(/(⌘|⌥|⇧|⌃)(\S*)/g, '<kbd>$1$2</kbd>');
    return h;
  }).join('');
}

/** Lesson Markdown to HTML: headings, paragraphs, lists, code, quotes (a quote starting **Note** or **Tip** becomes an
 *  aside), tables and rules. */
export function render(md) {
  const lines = String(md || '').replace(/\r/g, '').split('\n'), out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    let m;
    if ((m = /^```(\w*)/.exec(line))) {
      const lang = m[1], body = []; i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) body.push(lines[i++]);
      i++;
      const code = body.join('\n');
      out.push('<pre class="code' + (lang ? ' lang-' + lang : '') + '"><code>' + (lang === 'swift' ? highlight(code) : esc(code)) + '</code></pre>');
      continue;
    }
    if ((m = /^(#{2,4})\s+(.*)/.exec(line))) { const n = m[1].length; out.push('<h' + n + '>' + inline(m[2]) + '</h' + n + '>'); i++; continue; }
    if (/^---+\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
    if (/^>\s?/.test(line)) {
      const body = []; while (i < lines.length && /^>\s?/.test(lines[i])) body.push(lines[i++].replace(/^>\s?/, ''));
      const inner = render(body.join('\n')), kind = /^\*\*(Note|Tip|Warning|Apple Developer Program)\*\*/.exec(body[0] || '');
      out.push(kind ? '<aside class="note ' + kind[1].toLowerCase().replace(/\s+/g, '-') + '">' + inner + '</aside>' : '<blockquote>' + inner + '</blockquote>');
      continue;
    }
    if (/^\|.*\|\s*$/.test(line) && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '')) {
      const row = (l) => l.trim().slice(1, -1).split('|').map((c) => c.trim());
      const head = row(line); i += 2; const rows = [];
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) rows.push(row(lines[i++]));
      out.push('<div class="table"><table><thead><tr>' + head.map((c) => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>' +
        rows.map((r) => '<tr>' + r.map((c) => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>');
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line), items = [];
      while (i < lines.length && (/^\s*([-*]|\d+\.)\s+/.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
        if (/^\s*([-*]|\d+\.)\s+/.test(lines[i])) items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ''));
        else items[items.length - 1] += ' ' + lines[i].trim();
        i++;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push('<' + tag + '>' + items.map((t) => '<li>' + inline(t) + '</li>').join('') + '</' + tag + '>');
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(```|#{2,4}\s|>|\s*([-*]|\d+\.)\s|---+\s*$|\|)/.test(lines[i])) para.push(lines[i++].trim());
    if (!para.length) { para.push(lines[i++].trim()); }
    out.push('<p>' + inline(para.join(' ')) + '</p>');
  }
  return out.join('\n');
}

export { esc };

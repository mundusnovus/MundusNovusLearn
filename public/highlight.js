/* Written by tools/build.mjs from src/markdown.mjs. */
(function () {
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const KEYWORDS = new Set(('actor any associatedtype async await break case catch class consume continue convenience default defer deinit ' +
  'didSet do dynamic else enum extension fallthrough false fileprivate final for func get guard if import in indirect infix init inout ' +
  'internal is isolated lazy let mutating nil nonisolated nonmutating open operator optional override package postfix precedencegroup ' +
  'prefix private protocol public repeat required rethrows return self Self set some static struct subscript super switch throw throws ' +
  'true try typealias unowned var weak where while willSet borrowing consuming sending').split(' '));

/** Swift source to HTML with <span class="t-…"> tokens. */
function highlight(src) {
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

window.mnHighlight = highlight;
})();

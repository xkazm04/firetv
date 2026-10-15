/**
 * The .docx reader (v2 P4; lib/rules/docx.ts) and the version diff (v2 T2; lib/rules/diff.ts). Pure, no model, no disk.
 * The .docx files are built here, in memory, with node:zlib: paragraphs, runs, tabs, breaks and entities read back; a
 * file that is not a zip, a zip with no word/document.xml, an encrypted entry and an entry over the size cap (a zip
 * bomb) are refused with a sentence. Run with npm test in desk/ (directly: node tools/docx-rules-test.cjs).
 */
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), Module = require('node:module'), zlib = require('node:zlib');
const { test } = require('node:test');
const root = path.resolve(__dirname, '../desk');
require('./ts-load.cjs');
const { docxText, DOCX_MAX_XML } = require(path.join(root, 'src/lib/rules/docx.ts'));
const { countDiff, versionDiff } = require(path.join(root, 'src/lib/rules/diff.ts'));

/** A minimal zip: each entry deflated (or stored), local headers, a central directory, the end record. */
function zip(entries, { flags = 0, method = 8, lieSize } = {}) {
  const locals = [], central = []; let off = 0;
  for (const [name, content] of entries) {
    const raw = Buffer.from(content, 'utf8'), data = method === 8 ? zlib.deflateRawSync(raw) : raw, n = Buffer.from(name, 'utf8');
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(flags, 6); lh.writeUInt16LE(method, 8);
    lh.writeUInt32LE(data.length, 18); lh.writeUInt32LE(lieSize ?? raw.length, 22); lh.writeUInt16LE(n.length, 26);
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(flags, 8); ch.writeUInt16LE(method, 10);
    ch.writeUInt32LE(data.length, 20); ch.writeUInt32LE(lieSize ?? raw.length, 24); ch.writeUInt16LE(n.length, 28); ch.writeUInt32LE(off, 42);
    locals.push(lh, n, data); central.push(ch, n); off += 30 + n.length + data.length;
  }
  const cd = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(off, 16);
  return Buffer.concat([...locals, cd, end]);
}
const para = (...runs) => `<w:p><w:pPr><w:pStyle w:val="Normal"/></w:pPr>${runs.map((r) => `<w:r><w:rPr><w:b/></w:rPr>${r}</w:r>`).join('')}</w:p>`;
const doc = (...ps) => `<?xml version="1.0"?><w:document xmlns:w="x"><w:body>${ps.join('')}<w:sectPr/></w:body></w:document>`;
const DOC = doc(para('<w:t>Why we sleep</w:t>'), para('<w:t xml:space="preserve">Teens fall asleep </w:t>', '<w:t>later &amp; wake &quot;late&quot;.</w:t>'), para(''), para('<w:t>A</w:t><w:tab/><w:t>B</w:t><w:br/><w:t>C &#233;&#x161;</w:t>'));

test('a .docx reads back as paragraphs: runs joined, tabs and breaks kept, entities decoded, empty paragraphs dropped', () => {
  const r = docxText(zip([['[Content_Types].xml', '<Types/>'], ['word/styles.xml', '<w:styles/>'], ['word/document.xml', DOC]]));
  assert.deepEqual(r, { ok: true, text: 'Why we sleep\n\nTeens fall asleep later & wake "late".\n\nA\tB\nC éš' });
  assert.deepEqual(docxText(zip([['word/document.xml', DOC]], { method: 0 })), r, 'a stored entry reads the same');
});
test('refusals come with a sentence: not a zip, no document, encrypted, a zip bomb, no text', () => {
  const no = (buf, re) => { const r = docxText(buf); assert.equal(r.ok, false); assert.match(r.error, re); };
  no(Buffer.from('Just some text, not a zip at all.'), /does not open as a Word document/);
  no(Buffer.alloc(0), /does not open/);
  no(zip([['word/other.xml', DOC]]), /does not open/);
  no(zip([['word/document.xml', DOC]], { flags: 1 }), /password/);
  no(zip([['word/document.xml', DOC]], { method: 12 }), /does not open/);
  no(zip([['word/document.xml', DOC]], { lieSize: DOCX_MAX_XML + 1 }), /too big/);
  // a bomb that lies about its size: the inflate stops at the cap
  const bomb = doc(para(`<w:t>${'a'.repeat(DOCX_MAX_XML + 10)}</w:t>`));
  no(zip([['word/document.xml', bomb]], { lieSize: 100 }), /does not open/);
  no(zip([['word/document.xml', doc(para(''), para('<w:t>   </w:t>'))]]), /no text/);
  const cut = zip([['word/document.xml', DOC]]); no(cut.subarray(0, cut.length - 30), /does not open/);
});

test('countDiff: kept by LCS, a leftover pair is a change, the rest added or removed; case and spacing aside', () => {
  assert.deepEqual(countDiff(['a', 'b', 'c'], ['a', 'b', 'c']), { kept: 3, changed: 0, added: 0, removed: 0 });
  assert.deepEqual(countDiff(['a', 'b', 'c'], ['a', 'B  ', 'x', 'c']), { kept: 3, changed: 0, added: 1, removed: 0 });
  assert.deepEqual(countDiff(['a', 'b', 'c'], ['a', 'x', 'c']), { kept: 2, changed: 1, added: 0, removed: 0 });
  assert.deepEqual(countDiff(['a', 'b', 'c', 'd'], ['a', 'x', 'd']), { kept: 2, changed: 1, added: 0, removed: 1 });
  assert.deepEqual(countDiff([], ['a', 'b']), { kept: 0, changed: 0, added: 2, removed: 0 });
  assert.deepEqual(countDiff(['a', 'b'], []), { kept: 0, changed: 0, added: 0, removed: 2 });
  const big = Array.from({ length: 200 }, (_, i) => `s${i}`);
  const c = countDiff(big, big.map((x, i) => (i % 10 === 0 ? x + '!' : x)));
  assert.deepEqual(c, { kept: 180, changed: 20, added: 0, removed: 0 });
});
test('versionDiff: paragraphs and sentences of two versions, counts only', () => {
  const v1 = 'Teens sleep late. School starts early.\n\nSo they are tired.';
  const v2 = 'Teens sleep late. School starts too early.\n\nSo they are tired. Start at nine.\n\nThat is all.';
  const d = versionDiff(v1, v2);
  assert.deepEqual(d.sentences, { kept: 2, changed: 1, added: 2, removed: 0 });
  assert.deepEqual(d.paragraphs, { kept: 0, changed: 2, added: 1, removed: 0 });
  assert(!JSON.stringify(d).includes('Teens'), 'never the text');
});

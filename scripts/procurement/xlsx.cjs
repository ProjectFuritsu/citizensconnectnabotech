// Minimal xlsx reader: zip (central directory + inflateRaw) and sheet XML parsing.
// Small parts are read whole; big sheets can be streamed row by row.
const fs = require('fs');
const zlib = require('zlib');

function readZip(file) {
  const fd = fs.openSync(file, 'r');
  const size = fs.fstatSync(fd).size;
  const tailLen = Math.min(size, 65557);
  const tail = Buffer.alloc(tailLen);
  fs.readSync(fd, tail, 0, tailLen, size - tailLen);
  let eocd = tailLen - 22;
  while (eocd >= 0 && tail.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error('Not a zip: ' + file);
  const count = tail.readUInt16LE(eocd + 10);
  const cdSize = tail.readUInt32LE(eocd + 12);
  const cdOff = tail.readUInt32LE(eocd + 16);
  const cd = Buffer.alloc(cdSize);
  fs.readSync(fd, cd, 0, cdSize, cdOff);
  const entries = {};
  let p = 0;
  for (let i = 0; i < count; i++) {
    const method = cd.readUInt16LE(p + 10);
    const csize = cd.readUInt32LE(p + 20);
    const nlen = cd.readUInt16LE(p + 28), xlen = cd.readUInt16LE(p + 30), clen = cd.readUInt16LE(p + 32);
    const local = cd.readUInt32LE(p + 42);
    const name = cd.toString('utf8', p + 46, p + 46 + nlen);
    const lh = Buffer.alloc(30);
    fs.readSync(fd, lh, 0, 30, local);
    const start = local + 30 + lh.readUInt16LE(26) + lh.readUInt16LE(28);
    entries[name] = { method, csize, start };
    p += 46 + nlen + xlen + clen;
  }
  fs.closeSync(fd);
  return {
    get(name) {
      const e = entries[name];
      if (!e) return null;
      const fd2 = fs.openSync(file, 'r');
      const data = Buffer.alloc(e.csize);
      fs.readSync(fd2, data, 0, e.csize, e.start);
      fs.closeSync(fd2);
      return (e.method === 0 ? data : zlib.inflateRawSync(data)).toString('utf8');
    },
    stream(name) {
      const e = entries[name];
      const raw = fs.createReadStream(file, { start: e.start, end: e.start + e.csize - 1, highWaterMark: 1 << 22 });
      return e.method === 0 ? raw : raw.pipe(zlib.createInflateRaw());
    },
  };
}

function decode(s) {
  return s.replace(/&(#x[0-9a-fA-F]+|#\d+|amp|lt|gt|quot|apos);/g, (m, k) =>
    k === 'amp' ? '&' : k === 'lt' ? '<' : k === 'gt' ? '>' : k === 'quot' ? '"' : k === 'apos' ? "'" :
    String.fromCodePoint(k[1] === 'x' ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10)));
}

function textOf(xml) {
  // Concatenate all <t> runs (plain or rich text), skipping phonetic <rPh> runs.
  xml = xml.replace(/<rPh\b[\s\S]*?<\/rPh>/g, '');
  let out = '';
  for (const m of xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)) out += decode(m[1]);
  return out;
}

function colIndex(ref) {
  const letters = ref.match(/^[A-Z]+/)[0];
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

function openWorkbook(file) {
  const zip = readZip(file);
  const shared = [];
  const ss = zip.get('xl/sharedStrings.xml');
  if (ss) for (const m of ss.matchAll(/<si>([\s\S]*?)<\/si>|<si\/>/g)) shared.push(m[1] ? textOf(m[1]) : '');

  // Styles: which cellXfs indexes use a date number format.
  const styles = zip.get('xl/styles.xml') || '';
  const customFmts = {};
  for (const m of styles.matchAll(/<numFmt\s+numFmtId="(\d+)"\s+formatCode="([^"]*)"/g)) customFmts[m[1]] = decode(m[2]);
  const xfsBlock = (styles.match(/<cellXfs[^>]*>([\s\S]*?)<\/cellXfs>/) || [, ''])[1];
  const dateStyle = [];
  for (const m of xfsBlock.matchAll(/<xf\b([^>]*)/g)) {
    const id = +((m[1].match(/numFmtId="(\d+)"/) || [, 0])[1]);
    const code = customFmts[id] || '';
    dateStyle.push((id >= 14 && id <= 22) || (id >= 45 && id <= 47) || /[dmy]/i.test(code.replace(/"[^"]*"|\[[^\]]*\]/g, '')));
  }

  // Sheet names in workbook order -> sheet XML paths.
  const wb = zip.get('xl/workbook.xml');
  const rels = zip.get('xl/_rels/workbook.xml.rels');
  const relTarget = {};
  for (const m of rels.matchAll(/<Relationship\b([^>]*)\/?>/g)) {
    const id = (m[1].match(/\bId="([^"]+)"/) || [])[1];
    const target = (m[1].match(/\bTarget="([^"]+)"/) || [])[1];
    if (id && target) relTarget[id] = target.replace(/^\/?xl\//, '').replace(/^\//, '');
  }
  const sheets = [];
  for (const m of wb.matchAll(/<sheet\b([^>]*)\/?>/g)) {
    const name = decode((m[1].match(/\bname="([^"]*)"/) || [])[1]);
    const rid = (m[1].match(/\br:id="([^"]+)"/) || [])[1];
    sheets.push({ name, path: 'xl/' + relTarget[rid] });
  }

  // Cell kinds: 's' text, 'n' number, 'date' number with a date style, 'b' boolean, 'e' error.
  function parseRows(xml, onRow) {
    for (const rm of xml.matchAll(/<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g)) {
      const r = +((rm[1].match(/\br="(\d+)"/) || [, 0])[1]);
      const cells = [];
      if (rm[2]) for (const cm of rm[2].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const attrs = cm[1];
        const ref = (attrs.match(/\br="([A-Z]+\d+)"/) || [])[1];
        const t = (attrs.match(/\bt="([^"]+)"/) || [, 'n'])[1];
        const s = +((attrs.match(/\bs="(\d+)"/) || [, 0])[1]);
        const body = cm[2] || '';
        const v = (body.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
        let value = null, kind = t;
        if (t === 's') { value = v == null ? null : shared[+v]; kind = 's'; }
        else if (t === 'inlineStr' || t === 'str') { value = t === 'str' ? (v == null ? null : decode(v)) : textOf(body); kind = 's'; }
        else if (t === 'e') value = v == null ? null : decode(v);
        else if (t === 'b') value = v == null ? null : v === '1';
        else if (v != null) { value = Number(v); kind = dateStyle[s] ? 'date' : 'n'; }
        if (ref) cells[colIndex(ref)] = { value, kind };
      }
      onRow({ r, cells });
    }
  }

  function readSheet(path) {
    const rows = [];
    parseRows(zip.get(path) || '', row => rows.push(row));
    return rows;
  }

  // Stream a big sheet: parse complete <row> elements as the XML arrives.
  function streamSheet(path, onRow) {
    return new Promise((resolve, reject) => {
      let buf = '';
      const s = zip.stream(path);
      s.setEncoding('utf8');
      s.on('data', chunk => {
        buf += chunk;
        const end = buf.lastIndexOf('</row>');
        if (end === -1) return;
        parseRows(buf.slice(0, end + 6), onRow);
        buf = buf.slice(end + 6);
      });
      s.on('end', () => { parseRows(buf, onRow); resolve(); });
      s.on('error', reject);
    });
  }

  return { sheets, readSheet, streamSheet };
}

module.exports = { openWorkbook };

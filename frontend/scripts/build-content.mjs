/**
 * Turns the markdown in src/content into JSON the app imports directly.
 *
 * Runs before every build, so no markdown parser is ever shipped to the browser
 * and no file reads happen at runtime. Adding an entry to any section is adding
 * a markdown file — no component edit.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const CONTENT = join(ROOT, 'src/content');
const OUT_DIR = join(ROOT, 'src/app/data');

/** Minimal front-matter reader: `key: value` pairs between --- fences. */
function parse(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return { meta: {}, body: raw.trim() };

  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const at = line.indexOf(':');
    if (at === -1) continue;
    const key = line.slice(0, at).trim();
    const value = line.slice(at + 1).trim();

    if (value.startsWith('[') && value.endsWith(']')) {
      meta[key] = value.slice(1, -1).split(',').map(v => v.trim()).filter(Boolean);
    } else if (value === 'true' || value === 'false') {
      meta[key] = value === 'true';
    } else if (value !== '' && !Number.isNaN(Number(value))) {
      meta[key] = Number(value);
    } else {
      meta[key] = value;
    }
  }
  return { meta, body: match[2].trim() };
}

function read(section) {
  const dir = join(CONTENT, section);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const { meta, body } = parse(readFileSync(join(dir, file), 'utf8'));
      return { slug: basename(file, '.md'), ...meta, body };
    });
}

mkdirSync(OUT_DIR, { recursive: true });

// ── Skills ────────────────────────────────────────────────────────────────
const skills = read('skills')
  .map(s => ({
    slug: s.slug,
    name: s.name ?? s.slug,
    category: s.category ?? 'TOOLING',
    level: s.level ?? 3,
    daily: s.daily === true,
    years: s.years ?? null,
    tags: s.tags ?? [],
    note: s.body,
  }))
  .sort((a, b) =>
    Number(b.daily) - Number(a.daily) || b.level - a.level || a.name.localeCompare(b.name));

// ── Collections: same shape, three sections ───────────────────────────────
function collection(section) {
  return read(section)
    .map(e => ({
      slug: e.slug,
      title: e.title ?? e.slug,
      category: e.category ?? 'GENERAL',
      blurb: e.blurb ?? '',
      // Kept as a plain URL rather than vendor embed HTML: storing an iframe
      // someone else generated is an injection surface for no benefit.
      link: e.link ?? null,
      linkLabel: e.linkLabel ?? null,
      platform: e.platform ?? null,
      date: e.date ?? null,
      tags: e.tags ?? [],
      featured: e.featured === true,
      body: e.body,
    }))
    .sort((a, b) =>
      Number(b.featured) - Number(a.featured) ||
      String(b.date ?? '').localeCompare(String(a.date ?? '')));
}

const out = {
  skills,
  extracurricular: collection('extracurricular'),
  hobbies: collection('hobbies'),
  blog: collection('blog'),
};

writeFileSync(join(OUT_DIR, 'skills.json'), JSON.stringify({ skills }, null, 2));
writeFileSync(join(OUT_DIR, 'content.json'), JSON.stringify(out, null, 2));

console.log(
  `content: ${skills.length} skills, ${out.extracurricular.length} extracurricular, ` +
  `${out.hobbies.length} hobbies, ${out.blog.length} posts`,
);

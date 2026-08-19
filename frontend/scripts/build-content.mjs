/**
 * Turns the markdown in src/content into JSON the app imports directly.
 *
 * Runs before every build, so no markdown parser is ever shipped to the browser
 * and no file reads happen at runtime.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SKILLS_DIR = join(ROOT, 'src/content/skills');
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
    let value = line.slice(at + 1).trim();

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

function buildSkills() {
  if (!existsSync(SKILLS_DIR)) return [];
  return readdirSync(SKILLS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const { meta, body } = parse(readFileSync(join(SKILLS_DIR, file), 'utf8'));
      return {
        slug: basename(file, '.md'),
        name: meta.name ?? basename(file, '.md'),
        category: meta.category ?? 'TOOLING',
        level: meta.level ?? 3,
        daily: meta.daily === true,
        years: meta.years ?? null,
        tags: meta.tags ?? [],
        note: body,
      };
    })
    .sort((a, b) => Number(b.daily) - Number(a.daily) || b.level - a.level || a.name.localeCompare(b.name));
}

mkdirSync(OUT_DIR, { recursive: true });
const skills = buildSkills();
writeFileSync(join(OUT_DIR, 'skills.json'), JSON.stringify({ skills }, null, 2));
console.log(`content: ${skills.length} skills -> src/app/data/skills.json`);

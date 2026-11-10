#!/usr/bin/env node
// Переносит текущий origin/main «Династии» в локальные клоны Biomes Lite и коммитит
// в их main. Не пушит и не ставит теги. Инструкция: docs/publishing.md.
//
// node tools/publish-biomes.cjs [--client-repo <путь>] [--target-dir <каталог клонов>]
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const ORG = 'https://github.com/Planetary-Annihilation-Fandom/';
const IDS = {
  'com.pa.dynastiya.server': 'com.pa.biomes.lite.server',
  'com.pa.dynastiya.client': 'com.pa.biomes.lite.client',
};
const CONFLICTS = 'ui/mods/dynastiya.mod_conflicts/conflicts.js';

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? path.resolve(process.argv[i + 1]) : fallback;
}
const serverRepo = path.resolve(__dirname, '..');
const clientRepo = arg('--client-repo', path.resolve(serverRepo, '../client'));
const targetDir = arg('--target-dir', path.resolve(serverRepo, '../publish'));

function git(cwd, args, options = {}) {
  const r = spawnSync('git', args, {cwd, encoding: options.encoding ?? 'utf8', maxBuffer: 1 << 30});
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} (${cwd}):\n${r.stderr}`);
  return typeof r.stdout === 'string' ? r.stdout.trim() : r.stdout;
}

function prepareTarget(id) {
  const dir = path.join(targetDir, id);
  if (!fs.existsSync(path.join(dir, '.git'))) {
    fs.mkdirSync(targetDir, {recursive: true});
    git(targetDir, ['clone', ORG + id + '.git', id]);
  }
  if (git(dir, ['status', '--porcelain'])) throw new Error(`${dir}: есть незакоммиченные изменения`);
  git(dir, ['switch', 'main']);
  git(dir, ['pull', '--ff-only', '-q']);
  if (git(dir, ['rev-list', '--count', 'origin/main..main']) !== '0')
    throw new Error(`${dir}: в main есть неотправленные коммиты; отправь или откати их`);
  return dir;
}

function exportSource(repo, dir) {
  git(repo, ['fetch', '-q', 'origin']);
  const commit = git(repo, ['rev-parse', 'origin/main']);
  // Старые файлы биомов не остаются: удаляем всё отслеживаемое и распаковываем источник.
  git(dir, ['rm', '-r', '-q', '--ignore-unmatch', '.']);
  const archive = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'dynastiya-publish-')), 'src.tar');
  fs.writeFileSync(archive, git(repo, ['archive', '--format=tar', commit], {encoding: 'buffer'}));
  const r = spawnSync('tar', ['-xf', archive, '-C', dir], {encoding: 'utf8'});
  if (r.status !== 0) throw new Error('tar: ' + r.stderr);
  fs.rmSync(path.dirname(archive), {recursive: true, force: true});
  return commit;
}

function mapIds(list) {
  return list && list.map(id => IDS[id] || id);
}

function fixModinfo(dir, sourceId) {
  const file = path.join(dir, 'modinfo.json');
  const info = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (info.identifier !== sourceId) throw new Error(`${file}: ожидался identifier ${sourceId}`);
  info.identifier = IDS[sourceId];
  for (const key of ['companions', 'dependencies', 'conflicts']) if (info[key]) info[key] = mapIds(info[key]);
  delete info.hidden;
  fs.writeFileSync(file, JSON.stringify(info, null, 2) + '\n');
  return info;
}

// Иначе «Династия» под id биомов найдёт конфликт сама с собой.
function fixConflicts(dir) {
  const file = path.join(dir, CONFLICTS);
  const text = fs.readFileSync(file, 'utf8');
  const fixed = text.replace(/^[ \t]*'com\.pa\.biomes\.lite\.(client|server)':[^\n]*\n/gm, '');
  if (text.split('com.pa.biomes.lite.').length - fixed.split('com.pa.biomes.lite.').length !== 2)
    throw new Error(`${file}: не найдены обе записи Biomes Lite в списке конфликтов`);
  fs.writeFileSync(file, fixed);
}

// Остальные упоминания id «Династии» в загружаемых игрой файлах нужно разобрать вручную.
// Документация и инструменты могут упоминать исходные id.
function leftovers(dir) {
  const r = spawnSync('git', ['grep', '-n', '-I', '-E', 'com\\.pa\\.dynastiya\\.(client|server)', '--', 'modinfo.json', 'ui', 'pa'], {cwd: dir, encoding: 'utf8'});
  return r.status === 0 ? r.stdout.trim() : '';
}

function publish(part, repo) {
  const sourceId = 'com.pa.dynastiya.' + part;
  const dir = prepareTarget(IDS[sourceId]);
  const commit = exportSource(repo, dir);
  const info = fixModinfo(dir, sourceId);
  if (part === 'client') fixConflicts(dir);
  git(dir, ['add', '-A']);
  const rest = leftovers(dir);
  if (rest) throw new Error(`${dir}: остались id «Династии», исправь источник или скрипт:\n${rest}`);
  if (!git(dir, ['status', '--porcelain'])) return {part, dir, version: info.version, source: commit, changed: false};
  git(dir, ['commit', '-q', '-m', `Dynastiya ${part} ${info.version}\n\nИсточник: ${ORG}pa.dynastiya.${part}/commit/${commit}`]);
  return {part, dir, version: info.version, source: commit, commit: git(dir, ['rev-parse', 'HEAD']), changed: true};
}

const results = [publish('server', serverRepo), publish('client', clientRepo)];
for (const r of results)
  console.log(r.changed
    ? `${r.part}: ${r.dir} ← ${r.source.slice(0, 7)}, коммит ${r.commit.slice(0, 7)}, тег v${r.version}`
    : `${r.part}: ${r.dir} уже совпадает с ${r.source.slice(0, 7)}`);
console.log('Проверь дифф и игру, затем поставь теги и отправь: docs/publishing.md');

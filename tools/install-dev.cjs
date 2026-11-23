// From the server checkout: node tools/install-dev.cjs [PA data directory] [--client <checkout>]
// See ../docs/install-dev.md for the Community Mods steps.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { parseArgs } = require('node:util');

const serverSource = path.resolve(__dirname, '..');
const contexts = ['client', 'server'];
const releaseIds = new Map(contexts.map(context => [
  `com.pa.dynastiya.${context}`, `com.pa.dynastiya.${context}.dev`,
]));
const repositoryEntries = new Set(['.git', '.github', 'AGENTS.md', 'docs', 'tools']);

// Match the dev folders to the source checkouts and keep the companion and dependency links.
function prepareMod(context, source, dataDir, date) {
  const manifest = readManifest(source);
  const identifier = releaseIds.get(`com.pa.dynastiya.${context}`);
  if (manifest.context !== context || releaseIds.get(manifest.identifier) !== identifier) {
    throw new Error(`Unexpected ${context} manifest in ${source}`);
  }

  const gitOptions = { cwd: source, encoding: 'utf8' };
  if (execFileSync('git', ['rev-parse', '--show-prefix'], gitOptions).trim()) {
    throw new Error(`Expected a Git checkout at ${source}`);
  }
  const commit = execFileSync('git', ['rev-parse', '--short=10', 'HEAD'], gitOptions).trim();
  const dirty = execFileSync('git', ['status', '--porcelain', '--untracked-files=normal'], gitOptions).trim();
  manifest.identifier = identifier;
  manifest.display_name += ` DEV (${commit}${dirty ? '-dirty' : ''}, ${date})`;
  manifest.date = date;
  for (const field of ['dependencies', 'companions']) {
    if (manifest[field]) {
      manifest[field] = manifest[field].map(id => releaseIds.get(id) ?? id);
    }
  }

  return {
    context, source, manifest,
    destination: path.join(dataDir, `${context}_mods`, identifier),
  };
}

// Read both source and installed manifests, including JSON saved with a UTF-8 BOM.
function readManifest(directory) {
  return JSON.parse(fs.readFileSync(path.join(directory, 'modinfo.json'), 'utf8').replace(/^\uFEFF/, ''));
}

// Finish both copies before replacing either installed mod. Keep the previous pair for rollback.
function install(dataDir, mods) {
  fs.mkdirSync(dataDir, { recursive: true });
  const staging = path.join(dataDir, '.dynastiya-dev-install');
  fs.mkdirSync(staging);
  const backups = [];
  const installed = [];
  let cleanStaging = true;
  try {
    for (const mod of mods) {
      fs.mkdirSync(path.dirname(mod.destination), { recursive: true });
      const existing = fs.lstatSync(mod.destination, { throwIfNoEntry: false });
      if (existing && (!existing.isDirectory() || readManifest(mod.destination).identifier !== mod.manifest.identifier)) {
        throw new Error(`Destination is not a Dynastiya dev mod: ${mod.destination}`);
      }
      mod.staged = path.join(staging, mod.context);
      mod.replacing = Boolean(existing);
      fs.cpSync(mod.source, mod.staged, {
        recursive: true,
        filter: entry => !repositoryEntries.has(path.relative(mod.source, entry).split(path.sep)[0]),
      });
      fs.writeFileSync(path.join(mod.staged, 'modinfo.json'), JSON.stringify(mod.manifest, null, 2) + '\n');
    }

    for (const mod of mods) {
      if (mod.replacing) {
        const backup = path.join(staging, `${mod.context}-previous`);
        fs.renameSync(mod.destination, backup);
        backups.push({ backup, destination: mod.destination });
      }
      fs.renameSync(mod.staged, mod.destination);
      installed.push(mod);
    }
  } catch (error) {
    cleanStaging = false;
    try {
      for (const mod of installed.reverse()) fs.renameSync(mod.destination, mod.staged);
      for (const { backup, destination } of backups.reverse()) fs.renameSync(backup, destination);
      cleanStaging = true;
    } catch (rollbackError) {
      throw new AggregateError([error, rollbackError], `Installation and rollback failed. Check ${staging}: ${error.message}; ${rollbackError.message}`);
    }
    throw error;
  } finally {
    if (cleanStaging) fs.rmSync(staging, { recursive: true, force: true });
  }
}

// Use the stock Windows profile by default. An explicit path also supports test profiles.
function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { client: { type: 'string' } },
  });
  if (positionals.length > 1) {
    throw new Error('Usage: node tools/install-dev.cjs [PA data directory] [--client <checkout>]');
  }
  const [customDataDir] = positionals;
  const defaultDataDir = process.env.LOCALAPPDATA &&
    path.join(process.env.LOCALAPPDATA, 'Uber Entertainment', 'Planetary Annihilation');
  if (!customDataDir && !defaultDataDir) throw new Error('Pass the PA data directory as an argument.');

  const clientSource = values.client ? path.resolve(values.client) :
    ['client', 'pa.dynastiya.client'].map(name => path.resolve(serverSource, '..', name))
      .find(directory => fs.existsSync(path.join(directory, 'modinfo.json')));
  if (!clientSource) throw new Error('Pass the client checkout path with --client.');

  const dataDir = path.resolve(customDataDir || defaultDataDir);
  const date = new Date().toLocaleDateString('sv-SE');
  const mods = [
    prepareMod('client', clientSource, dataDir, date),
    prepareMod('server', serverSource, dataDir, date),
  ];
  install(dataDir, mods);
  for (const { destination, manifest } of mods) console.log(`${manifest.display_name}: ${destination}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

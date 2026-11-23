#!/usr/bin/env node
// Check copied upstream specs before updating a dependency or publishing the mod.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const server = path.resolve(__dirname, '..');
const [gameRoot, mergeRoot, exilesRoot] = process.argv.slice(2);
if (!gameRoot || !mergeRoot || !exilesRoot) {
  console.error('Usage: node tools/check-commander-classes.cjs <game-media-directory> <commander-merge-directory> <exiles-directory>');
  process.exit(2);
}

// Read JSON as UTF-8, accepting a BOM in upstream mod files.
function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

const catalogue = readJson(path.join(server, 'pa/dynastiya/commander_classes.json'));
const list = readJson(path.join(server, 'pa/units/commanders/commander_list.json')).commanders;
const sources = readJson(path.join(__dirname, 'commander-class-sources.json')).sources;
const errors = [];

// Resolve a virtual asset path inside a particular mod or game directory.
function asset(root, virtualPath) {
  return path.join(root, virtualPath.replace(/^\//, ''));
}

list.forEach((spec) => {
  const id = catalogue.commanders[spec];
  if (!id || !catalogue.classes[id]) errors.push(`Unclassified commander: ${spec}`);
});
Object.keys(catalogue.commanders).forEach((spec) => {
  if (!list.includes(spec)) errors.push(`Catalogue entry is absent from commander list: ${spec}`);
});
Object.entries(catalogue.classes).forEach(([id, item]) => {
  if (!fs.existsSync(asset(server, item.superform))) errors.push(`Missing superform for ${id}: ${item.superform}`);
  if (!Array.isArray(item.combatSuperforms) || !item.combatSuperforms.length) {
    errors.push(`Missing combat superforms for ${id}`);
    return;
  }
  item.combatSuperforms.forEach((spec) => {
    if (!fs.existsSync(asset(server, spec))) errors.push(`Missing combat superform for ${id}: ${spec}`);
  });
});

sources.forEach((source) => {
  const root = source.source === 'base-game' ? gameRoot : mergeRoot;
  const upstreamFile = asset(root, source.path);
  const overrideFile = asset(server, source.path);
  if (!fs.existsSync(upstreamFile) || !fs.existsSync(overrideFile)) {
    errors.push(`Missing source or override: ${source.path}`);
    return;
  }
  const hash = crypto.createHash('sha256').update(fs.readFileSync(upstreamFile)).digest('hex');
  if (hash !== source.sha256) errors.push(`Upstream changed; review override: ${source.path}`);
  const upstream = readJson(upstreamFile);
  const override = readJson(overrideFile);
  const classBase = override.base_spec;
  if (!classBase || !fs.existsSync(asset(server, classBase))) {
    errors.push(`Missing class base: ${source.path}`);
    return;
  }
  const classSpec = readJson(asset(server, classBase));
  if (Object.keys(classSpec).some((key) => key !== 'base_spec')) errors.push(`Class base changes properties: ${classBase}`);
  let parent = classSpec.base_spec;
  if (parent === '/pa/units/exiles_base/base_exiles_commander.json') {
    const exilesBaseFile = asset(exilesRoot, parent);
    if (!fs.existsSync(exilesBaseFile)) {
      errors.push(`Missing Exiles base: ${parent}`);
      return;
    }
    const exilesBase = readJson(exilesBaseFile);
    Object.keys(exilesBase).filter((key) => key !== 'base_spec').forEach((key) => {
      if (!(key in override) && !(key in classSpec)) errors.push(`Exiles base adds ${key} to ${source.path}; review the change`);
    });
    parent = exilesBase.base_spec;
  }
  if (parent !== upstream.base_spec) errors.push(`Original inheritance changed: ${source.path}`);
  override.base_spec = upstream.base_spec;
  if (JSON.stringify(override) !== JSON.stringify(upstream)) errors.push(`Override differs from upstream: ${source.path}`);
});

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Checked ${list.length} commanders and ${sources.length} upstream specifications.`);

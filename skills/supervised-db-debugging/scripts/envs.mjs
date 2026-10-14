#!/usr/bin/env node
// Manages the environments.json used by Proxy Diablo. Never accepts a password value.
import fs from 'node:fs';
import path from 'node:path';

const [command, file, ...rest] = process.argv.slice(2);
const flags = {};
for (let i = 0; i < rest.length; i += 2) {
  if (!rest[i]?.startsWith('--')) fail(`Unexpected argument "${rest[i]}".`);
  flags[rest[i].slice(2)] = rest[i + 1];
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function load() {
  if (!fs.existsSync(file)) return { environments: [] };
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(data.environments)) throw new Error();
    return data;
  } catch {
    fail(`${file} is not a valid environments file.`);
  }
}

function save(data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
}

function regionFromHost(host) {
  return host.match(/\.([a-z]{2}(?:-[a-z]+)+-\d)\.rds\.amazonaws\.com(?:\.cn)?$/)?.[1];
}

function toLinuxPath(input) {
  const drive = input.match(/^([A-Za-z]):[\\/](.*)$/);
  if (drive) return `/mnt/${drive[1].toLowerCase()}/${drive[2].replace(/\\/g, '/')}`;
  const wsl = input.match(/^\\\\wsl(?:\.localhost|\$)\\[^\\]+\\(.*)$/i);
  if (wsl) return `/${wsl[1].replace(/\\/g, '/')}`;
  return input;
}

function attr(tag, name) {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}

function dataSourceBlocks(xml) {
  const blocks = [];
  for (const match of xml.matchAll(/<data-source\b([^>]*)>([\s\S]*?)<\/data-source>/g)) {
    blocks.push({ name: attr(match[1], 'name'), uuid: attr(match[1], 'uuid'), body: match[2] });
  }
  return blocks;
}

function tagText(body, tag) {
  return body.match(new RegExp(`<${tag}>([^<]*)</${tag}>`))?.[1].trim();
}

function parsePostgresUrl(url) {
  const match = url?.match(/^jdbc:postgresql:\/\/([^/:?]+)(?::(\d+))?(?:\/([^?]*))?/);
  if (!match) return undefined;
  return { host: match[1], port: match[2] ? Number(match[2]) : undefined, database: match[3] || undefined };
}

if (!command || !file) fail('Usage: envs.mjs <add|list|remove|import-phpstorm> <environments.json> [--flag value ...]');

if (command === 'list') {
  const { environments } = load();
  if (!environments.length) console.log('environments: none configured (make env-add NAME=... HOST=... DBUSER=...)');
  for (const e of environments) {
    const auth = e.auth === 'rds-iam' ? `AWS IAM${e.awsProfile ? `, profile ${e.awsProfile}` : ''}` : e.passwordEnv ? `password from $${e.passwordEnv}` : e.password ? 'password in file' : 'password via UI prompt or .pgpass';
    console.log(`environment: ${e.name} -> ${e.user}@${e.host}:${e.port ?? 5432}/${e.database ?? ''} (${auth})`);
  }
} else if (command === 'add') {
  for (const key of ['name', 'host', 'user']) if (!flags[key]) fail(`--${key} is required.`);
  if (flags.password) fail('Refusing a password on the command line. Use --password-env, or let the UI ask for it.');
  const data = load();
  if (data.environments.some((e) => e.name === flags.name)) fail(`Environment "${flags.name}" already exists; remove it first.`);
  const entry = { name: flags.name, host: flags.host, user: flags.user };
  if (flags.port) {
    entry.port = Number(flags.port);
    if (!Number.isInteger(entry.port) || entry.port < 1 || entry.port > 65535) fail('--port must be 1-65535.');
  }
  if (flags.database) entry.database = flags.database;
  if (flags['password-env']) entry.passwordEnv = flags['password-env'];
  if (flags.sslmode) entry.sslmode = flags.sslmode;
  if (flags.auth) {
    if (!['password', 'rds-iam'].includes(flags.auth)) fail('--auth must be password or rds-iam.');
    if (flags.auth === 'rds-iam') {
      if (entry.passwordEnv) fail('rds-iam environments cannot use --password-env.');
      entry.auth = 'rds-iam';
      if (flags['aws-profile']) entry.awsProfile = flags['aws-profile'];
      entry.region = flags.region || regionFromHost(entry.host);
      if (!entry.region) fail('--region is required for rds-iam when the host is not an RDS hostname.');
    }
  }
  data.environments.push(entry);
  save(data);
  console.log(`Added environment "${entry.name}".`);
} else if (command === 'import-phpstorm') {
  if (!flags.project) fail('--project is required.');
  const project = toLinuxPath(flags.project);
  const sourcesFile = path.join(project, '.idea', 'dataSources.xml');
  if (!fs.existsSync(sourcesFile)) fail(`No PhpStorm data sources found at ${sourcesFile}.`);
  const localFile = path.join(project, '.idea', 'dataSources.local.xml');
  // Only user-name and auth-provider are read from the local file; stored passwords are never touched.
  const local = new Map();
  if (fs.existsSync(localFile)) {
    for (const block of dataSourceBlocks(fs.readFileSync(localFile, 'utf8'))) {
      local.set(block.uuid, { user: tagText(block.body, 'user-name'), iam: /aws/i.test(tagText(block.body, 'auth-provider') ?? '') });
    }
  }
  const data = load();
  const prefix = flags.prefix ?? path.basename(path.resolve(project));
  let added = 0;
  for (const source of dataSourceBlocks(fs.readFileSync(sourcesFile, 'utf8'))) {
    const label = `${prefix}/${source.name}`;
    const url = parsePostgresUrl(tagText(source.body, 'jdbc-url'));
    if (!url) {
      console.log(`skip: ${label} (not a PostgreSQL data source)`);
      continue;
    }
    if (data.environments.some((e) => e.name === label)) {
      console.log(`skip: ${label} (already imported)`);
      continue;
    }
    const details = local.get(source.uuid) ?? {};
    const nameHint = source.name?.match(/^([^@\s]+)@/)?.[1];
    const user = details.user || flags.user || (flags['use-name-hint'] === 'yes' ? nameHint : undefined);
    if (!user) {
      const hint = nameHint ? `; the name suggests user "${nameHint}" (re-run with NAMEHINT=1 to use it)` : '';
      console.log(`skip: ${label} (no user found; pass DBUSER=<name> or use env-add${hint})`);
      continue;
    }
    const entry = { name: label, host: url.host, user };
    if (url.port) entry.port = url.port;
    if (url.database) entry.database = url.database;
    if (details.iam) {
      const region = flags.region || regionFromHost(url.host);
      if (!region) {
        console.log(`skip: ${label} (uses AWS IAM but the region is unknown; pass --region)`);
        continue;
      }
      entry.auth = 'rds-iam';
      entry.region = region;
      if (flags['aws-profile']) entry.awsProfile = flags['aws-profile'];
    }
    data.environments.push(entry);
    added += 1;
    const note = ['localhost', '127.0.0.1'].includes(url.host) ? ' (localhost: reachable from WSL only if the port is forwarded/tunnelled there)' : '';
    const iamNote = entry.auth === 'rds-iam' && !entry.awsProfile ? ' (IAM: set awsProfile or pass --aws-profile)' : '';
    console.log(`add: ${label} -> ${user}@${url.host}:${url.port ?? 5432}/${url.database ?? ''}${note}${iamNote}`);
  }
  if (added) save(data);
  console.log(`Imported ${added} environment(s) from ${sourcesFile}.`);
} else if (command === 'remove') {
  if (!flags.name) fail('--name is required.');
  const data = load();
  const next = data.environments.filter((e) => e.name !== flags.name);
  if (next.length === data.environments.length) fail(`No environment named "${flags.name}".`);
  save({ ...data, environments: next });
  console.log(`Removed environment "${flags.name}".`);
} else {
  fail(`Unknown command "${command}".`);
}

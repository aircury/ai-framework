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

if (!command || !file) fail('Usage: envs.mjs <add|list|remove> <environments.json> [--flag value ...]');

if (command === 'list') {
  const { environments } = load();
  if (!environments.length) console.log('environments: none configured (make env-add NAME=... HOST=... DBUSER=...)');
  for (const e of environments) {
    const auth = e.passwordEnv ? `password from $${e.passwordEnv}` : e.password ? 'password in file' : 'password via UI prompt or .pgpass';
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
  data.environments.push(entry);
  save(data);
  console.log(`Added environment "${entry.name}".`);
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

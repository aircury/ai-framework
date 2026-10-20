import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const script = join(
  import.meta.dir,
  "..",
  "skills",
  "supervised-db-debugging",
  "scripts",
  "envs.mjs",
);

let dir: string;
let envFile: string;

function run(command: string, ...args: string[]) {
  return spawnSync("node", [script, command, envFile, ...args], {
    encoding: "utf-8",
  });
}

function readEnvironments() {
  return JSON.parse(readFileSync(envFile, "utf-8")).environments;
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "supervised-db-"));
  envFile = join(dir, "environments.json");
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("supervised-db-debugging environments manager", () => {
  it("adds and lists a plain environment", () => {
    const added = run(
      "add",
      "--name",
      "dev",
      "--host",
      "db.local",
      "--user",
      "app",
      "--port",
      "5433",
      "--database",
      "shop",
      "--password-env",
      "DEV_PW",
    );
    expect(added.status).toBe(0);
    expect(readEnvironments()).toEqual([
      {
        name: "dev",
        host: "db.local",
        user: "app",
        port: 5433,
        database: "shop",
        passwordEnv: "DEV_PW",
      },
    ]);
    expect(run("list").stdout).toContain("password from $DEV_PW");
  });

  it("refuses passwords on the command line", () => {
    const result = run(
      "add",
      "--name",
      "x",
      "--host",
      "h",
      "--user",
      "u",
      "--password",
      "secret",
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Refusing a password");
  });
});

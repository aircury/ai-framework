import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
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

function writeProject(sources: string, local?: string): string {
  const project = join(dir, "shop");
  mkdirSync(join(project, ".idea"), { recursive: true });
  writeFileSync(
    join(project, ".idea", "dataSources.xml"),
    `<?xml version="1.0"?><project><component name="DataSourceManagerImpl">${sources}</component></project>`,
  );
  if (local) {
    writeFileSync(
      join(project, ".idea", "dataSources.local.xml"),
      `<?xml version="1.0"?><project><component name="dataSourceStorageLocal">${local}</component></project>`,
    );
  }
  return project;
}

const source = (name: string, uuid: string, url: string) =>
  `<data-source source="LOCAL" name="${name}" uuid="${uuid}"><driver-ref>postgresql</driver-ref><jdbc-url>${url}</jdbc-url></data-source>`;

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

  it("adds an rds-iam environment and derives the region", () => {
    const host = "db.cluster-abc.eu-west-2.rds.amazonaws.com";
    const result = run(
      "add",
      "--name",
      "iam",
      "--host",
      host,
      "--user",
      "me@x.com",
      "--auth",
      "rds-iam",
      "--aws-profile",
      "cec_developer",
    );
    expect(result.status).toBe(0);
    expect(readEnvironments()[0]).toMatchObject({
      auth: "rds-iam",
      region: "eu-west-2",
      awsProfile: "cec_developer",
    });
    expect(
      run(
        "add",
        "--name",
        "bad",
        "--host",
        "localhost",
        "--user",
        "u",
        "--auth",
        "rds-iam",
      ).status,
    ).toBe(1);
  });

  it("imports PostgreSQL data sources from a PhpStorm project", () => {
    const project = writeProject(
      source("Dev", "u1", "jdbc:postgresql://localhost:5433/shop") +
        source("Reports", "u2", "jdbc:mysql://localhost:3306/x") +
        source("NoUser", "u3", "jdbc:postgresql://other:5432/y"),
      `<data-source name="Dev" uuid="u1"><user-name>app</user-name><password>do-not-read</password></data-source>`,
    );
    const result = run("import-phpstorm", "--project", project);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      "skip: shop/Reports (not a PostgreSQL data source)",
    );
    expect(result.stdout).toContain("skip: shop/NoUser (no user found");
    expect(readEnvironments()).toEqual([
      {
        name: "shop/Dev",
        host: "localhost",
        user: "app",
        port: 5433,
        database: "shop",
      },
    ]);
    expect(readFileSync(envFile, "utf-8")).not.toContain("do-not-read");
    expect(run("import-phpstorm", "--project", project).stdout).toContain(
      "already imported",
    );
  });

  it("maps AWS IAM data sources and applies a default user and profile", () => {
    const host = "prod.cluster-abc.eu-west-2.rds.amazonaws.com";
    const project = writeProject(
      source("Prod", "p1", `jdbc:postgresql://${host}:5432/app?ssl=true`),
      `<data-source name="Prod" uuid="p1"><user-name>me@x.com</user-name><auth-provider>aws-iam</auth-provider></data-source>`,
    );
    const result = run(
      "import-phpstorm",
      "--project",
      project,
      "--aws-profile",
      "cec_developer",
    );
    expect(result.status).toBe(0);
    expect(readEnvironments()[0]).toMatchObject({
      name: "shop/Prod",
      host,
      database: "app",
      auth: "rds-iam",
      region: "eu-west-2",
      awsProfile: "cec_developer",
    });
  });

  it("converts Windows project paths for WSL", () => {
    const result = run(
      "import-phpstorm",
      "--project",
      "C:\\Users\\me\\missing",
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "/mnt/c/Users/me/missing/.idea/dataSources.xml",
    );
  });
});

describe("PhpStorm import user hints", () => {
  it("suggests the user from a user@host name and applies it only on request", () => {
    const project = writeProject(
      source(
        "app@db.example.com",
        "n1",
        "jdbc:postgresql://db.example.com:5432/app",
      ),
    );
    const first = run("import-phpstorm", "--project", project);
    expect(first.stdout).toContain('the name suggests user "app"');
    expect(existsSync(envFile)).toBe(false);
    run("import-phpstorm", "--project", project, "--use-name-hint", "yes");
    expect(readEnvironments()[0]).toMatchObject({ user: "app" });
  });
});

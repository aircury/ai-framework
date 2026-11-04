import { afterEach, describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillDir = join(repositoryRoot, "skills", "pir");
const helperPath = join(skillDir, "scripts", "pir.js");
const templatePath = join(skillDir, "assets", "pir-template.html");
const examplePath = join(skillDir, "assets", "example.json");
const temporaryDirectories: string[] = [];

// Report data is free-form JSON that the tests edit in place.
// biome-ignore lint/suspicious/noExplicitAny: see above
type Data = Record<string, any>;

function createTemporaryDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), "ai-framework-pir-"));
  temporaryDirectories.push(directory);
  return directory;
}

function pir(...args: string[]) {
  const result = spawnSync("node", [helperPath, ...args], {
    encoding: "utf8",
    timeout: 10_000,
  });
  return {
    status: result.status,
    out: result.stdout,
    err: result.stderr,
  };
}

function example(): Data {
  return JSON.parse(readFileSync(examplePath, "utf8"));
}

// A new report and a data file holding `data`, ready for `set`.
function prepare(data: Data) {
  const dir = createTemporaryDirectory();
  const report = join(dir, "report.html");
  const dataFile = join(dir, "data.json");
  expect(pir("new", report).status).toBe(0);
  writeFileSync(dataFile, JSON.stringify(data));
  return { report, dataFile };
}

function set(data: Data) {
  const files = prepare(data);
  return { ...pir("set", files.report, files.dataFile), ...files };
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("pir helper", () => {
  it("copies the template and refuses to overwrite a report", () => {
    const report = join(createTemporaryDirectory(), "report.html");
    expect(pir("new", report).status).toBe(0);
    expect(readFileSync(report, "utf8")).toBe(
      readFileSync(templatePath, "utf8"),
    );

    const again = pir("new", report);
    expect(again.status).toBe(1);
    expect(again.err).toContain("already exists");
  });

  it("lists the fields an empty report is missing", () => {
    const report = join(createTemporaryDirectory(), "report.html");
    pir("new", report);
    const result = pir("check", report);

    expect(result.status).toBe(0);
    for (const field of [
      "PIR ID from the post-incident reports board",
      "Incident ID (ticket or card)",
      "Who the report is for",
      "Root cause in plain language",
    ]) {
      expect(result.out).toContain(field);
    }
  });

  it("accepts the bundled example with nothing missing", () => {
    const result = set(example());

    expect(result.status).toBe(0);
    expect(result.out).not.toContain("NOT RECORDED");
    expect(result.out).not.toContain("ERRORS");
  });

  it("writes data that reads back unchanged", () => {
    const data = example();
    const { report } = set(data);
    const got = JSON.parse(pir("get", report).out);

    expect(got).toEqual(data);
    expect(readFileSync(report, "utf8")).toContain(
      `<title>${data.title}</title>`,
    );
  });

  it("keeps text that would close the data block from breaking the page", () => {
    const data = example();
    data.summary = ["The page showed </script> in the middle of the text."];
    const { report } = set(data);
    const html = readFileSync(report, "utf8");

    expect(html).toContain("<\\/script>");
    expect(JSON.parse(pir("get", report).out).summary).toEqual(data.summary);
  });

  it("sorts the timeline by time and lists untimed steps last", () => {
    const data = example();
    const timed = data.timeline.filter((step: Data) => step.time);
    const untimed = {
      time: null,
      stage: "note",
      text: "The client was told.",
    };
    data.timeline = [untimed, ...[...timed].reverse()];
    const { report } = set(data);
    const got = JSON.parse(pir("get", report).out).timeline;

    expect(got.map((step: Data) => step.time)).toEqual([
      ...timed.map((step: Data) => step.time),
      null,
    ]);
  });

  it.each([
    ["an AWS key", "Rotated key AKIAIOSFODNN7EXAMPLE", "AWS access key"],
    ["an email address", "Reported by someone@example.com", "email address"],
    ["a phone number", "Call +44 20 7946 0958", "phone number"],
    ["a password", "password: hunter2hunter2", "password or secret"],
    ["a private key", "-----BEGIN RSA PRIVATE KEY-----", "private key"],
  ])("refuses to write %s and names only where it is", (_, text, kind) => {
    const data = example();
    data.summary = [text];
    const result = set(data);

    expect(result.status).toBe(1);
    expect(result.out).toContain(`${kind}`);
    expect(result.out).toContain("summary[0]");
    expect(result.out).not.toContain(text);
    expect(readFileSync(result.report, "utf8")).toBe(
      readFileSync(templatePath, "utf8"),
    );
  });

  it.each([
    [
      "an unknown category",
      (d: Data) => {
        d.classification.category = "CAT-99";
      },
      "classification.category",
    ],
    [
      "an unknown action status",
      (d: Data) => {
        d.actions[0].status = "finished";
      },
      "status must be done, planned, open or null",
    ],
    [
      "a malformed gap ID",
      (d: Data) => {
        d.gaps[0].id = "gap-1";
      },
      "must look like G1",
    ],
    [
      "an action closing a gap that does not exist",
      (d: Data) => {
        d.actions[2].closes = ["G9"];
      },
      "closes G9, which is not a gap",
    ],
    [
      "the retired unconfirmed list",
      (d: Data) => {
        d.impact.unconfirmed = ["Staging"];
      },
      "impact.unconfirmed is not used",
    ],
    [
      "the retired severity confirmation",
      (d: Data) => {
        d.severity.confirmed = true;
      },
      "severity.confirmed is not used",
    ],
    [
      "sources that are not a list",
      (d: Data) => {
        d.sources = "The repository";
      },
      "sources must be a list",
    ],
  ])("rejects %s", (_, change, message) => {
    const data = example();
    change(data);
    const result = set(data);

    expect(result.status).toBe(1);
    expect(result.out).toContain("ERRORS");
    expect(result.out).toContain(message);
  });

  it("refuses to confirm a report without its PIR ID or sign-off", () => {
    const data = example();
    data.pirId = null;
    data.signoff.closedBy = null;
    const result = set(data);

    expect(result.status).toBe(1);
    expect(result.out).toContain("a confirmed report needs its pirId");
    expect(result.out).toContain("a confirmed report needs signoff.closedBy");
  });

  it("refuses to confirm a report until both severity levels are answered", () => {
    const data = example();
    data.severity.urgency = null;
    const result = set(data);

    expect(result.status).toBe(1);
    expect(result.out).toContain(
      "a confirmed report needs both severity levels",
    );
  });

  it("lets a draft leave judgement calls and statuses unanswered", () => {
    const data = example();
    data.status = "draft";
    data.pirId = null;
    data.severity = { impact: null, urgency: null };
    data.actions[2].status = null;
    const result = set(data);

    expect(result.status).toBe(0);
    expect(result.out).toContain("NOT RECORDED");
    expect(result.out).toContain(
      `Status of the action "${data.actions[2].action}"`,
    );
  });

  it("asks whether each gap is closed and whether it could happen again", () => {
    const data = example();
    data.actions = data.actions.filter(
      (action: Data) => !action.closes.includes("G3"),
    );
    const result = set(data);

    expect(result.status).toBe(0);
    expect(result.out).toContain("RECURRENCE CHECK");
    expect(result.out).toContain(
      "G1 The Shop could not follow a key change: closed by",
    );
    expect(result.out).toContain(
      "G3 Support could not re-send a confirmation: no action closes it",
    );
    expect(result.out).toContain(
      "could this incident, or one like it elsewhere, happen again?",
    );
  });

  it("asks for a link for every source", () => {
    const data = example();
    data.sources[0].url = null;
    const result = set(data);

    expect(result.status).toBe(0);
    expect(result.out).toContain(
      `Link for the source "${data.sources[0].label}"`,
    );
  });

  it("prints the judgement-call questions with every PS16 category", () => {
    const result = pir("questions");

    expect(result.status).toBe(0);
    for (let n = 1; n <= 7; n++) {
      expect(result.out).toContain(`CAT-0${n}`);
    }
    expect(result.out).toContain("impact high    Critical (P0)");
  });

  it("uses the same severity matrix as the template", () => {
    const helper = readFileSync(helperPath, "utf8");
    const template = readFileSync(templatePath, "utf8");
    const levelNames = [
      ...template.matchAll(/\{ name: "(\w+)", p: "(P\d)"/g),
    ].map(([, name, p]) => `${name} (${p})`);
    const matrix = JSON.parse(
      (template.match(/var MATRIX = (\{.*?\});/)?.[1] ?? "{}").replace(
        /(\w+):/g,
        '"$1":',
      ),
    );

    for (const impact of ["high", "medium", "low"]) {
      const row = helper.match(new RegExp(`"impact ${impact}\\s+(.*)",`))?.[1];
      const cells = row?.trim().split(/\s{2,}/);
      const fromTemplate = ["high", "medium", "low"].map(
        (urgency) => levelNames[matrix[impact][urgency]],
      );
      expect(cells).toEqual(fromTemplate);
    }
  });

  it("does not find a report block in a file that is not a report", () => {
    const file = join(createTemporaryDirectory(), "other.html");
    writeFileSync(file, "<html></html>");
    const result = pir("get", file);

    expect(result.status).toBe(1);
    expect(result.err).toContain("has no pir-data block");
    expect(existsSync(file)).toBe(true);
  });
});

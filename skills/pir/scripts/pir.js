#!/usr/bin/env node
// PIR helper: the only way the agent touches a report file.
//
//   node pir.js new   <report.html>              copy the empty template
//   node pir.js get   <report.html>              print the report's data as JSON
//   node pir.js set   <report.html> <data.json>  check the data, then write it into the report
//   node pir.js check <report.html|data.json>    check without writing
//   node pir.js questions                        the fixed questions for the judgement calls
//
// `set` refuses to write when the data has errors or looks like it contains
// secrets or personal data. Everything it prints is meant for the agent to act
// on: errors to fix, missing fields to ask the person about, gaps to raise.

const fs = require("node:fs");
const path = require("node:path");

const TEMPLATE = path.join(__dirname, "..", "assets", "pir-template.html");
const OPEN = '<script type="application/json" id="pir-data">';
const CLOSE = "</script>";

const STAGES = [
  "trigger",
  "impact_start",
  "detected",
  "acknowledged",
  "diagnosed",
  "fixed",
  "verified",
  "closed",
  "decision",
  "note",
];
const CATEGORIES = [
  "CAT-01",
  "CAT-02",
  "CAT-03",
  "CAT-04",
  "CAT-05",
  "CAT-06",
  "CAT-07",
];
const RISKS = ["Confidentiality", "Integrity", "Availability"];
const LEVELS = ["high", "medium", "low"];
const STATUSES = ["done", "planned", "open"];
// The judgement calls the person answers. The agent recommends one option
// and gives its reason; it never writes its own pick into the report.
// Categories follow PS16; the matrix and level names must match the template.
const QUESTIONS = [
  {
    field: "classification.category",
    question: "Which PS16 category fits this incident?",
    pick: "one",
    note: "Offer your recommendation and the three likeliest others; the person can type any other code.",
    options: [
      ["CAT-01", "Malware: infection by harmful code or ransomware."],
      [
        "CAT-02",
        "Unauthorised access: intrusions or brute-force attacks on Entra ID, AWS or GitHub.",
      ],
      [
        "CAT-03",
        "Information leak: loss or exfiltration of confidential data.",
      ],
      [
        "CAT-04",
        "Denial of service: outage or saturation of web infrastructure (DoS/DDoS).",
      ],
      ["CAT-05", "Social engineering: phishing attacks or targeted fraud."],
      [
        "CAT-06",
        "Technical failure: interruption or outage of cloud or internal infrastructure.",
      ],
      [
        "CAT-07",
        "Physical incident: theft, sabotage or damage at the offices.",
      ],
    ],
  },
  {
    field: "classification.risk",
    question: "Which information security risk did it affect?",
    pick: "one or more",
    options: [
      [
        "Confidentiality",
        "Information reached, or could have reached, people who should not see it.",
      ],
      ["Integrity", "Information was changed, corrupted or lost."],
      [
        "Availability",
        "A service or information could not be used when it was needed.",
      ],
    ],
  },
  {
    field: "severity.impact",
    question: "How big was the impact?",
    pick: "one",
    note: "How much of the service failed, for how many of its users, at the worst point.",
    options: [
      [
        "high",
        "The service's main purpose stopped working for all or most of its users, or data was lost, altered or exposed.",
      ],
      [
        "medium",
        "The main purpose failed for some users, or a secondary function failed for most of them.",
      ],
      ["low", "A minor or cosmetic problem, or very few users affected."],
    ],
  },
  {
    field: "severity.urgency",
    question: "How urgent was it, as it stood when it was found?",
    pick: "one",
    note: "A way round counts only if the affected users could use it themselves; one only staff could use does not.",
    options: [
      [
        "high",
        "The affected users had no way round it they could use, or the harm was growing.",
      ],
      [
        "medium",
        "The affected users had a way round it, and the harm was not growing.",
      ],
      ["low", "It could wait for normal planned work."],
    ],
  },
];
const MATRIX = [
  "               urgency high   urgency medium   urgency low",
  "impact high    Critical (P0)  High (P0)        Medium (P1)",
  "impact medium  High (P0)      Medium (P1)      Low (P2)",
  "impact low     Medium (P1)    Low (P2)         Trivial (P2)",
];

function questions() {
  const out = [
    "Ask these with the question tool. Put your recommendation first, marked",
    "recommended, with a one-sentence reason from the evidence. Write the field",
    "only from the answer.",
    "",
  ];
  for (const q of QUESTIONS) {
    out.push(`${q.field}: ${q.question} (pick ${q.pick})`);
    if (q.note) out.push(`  ${q.note}`);
    for (const [k, v] of q.options) out.push(`  - ${k}: ${v}`);
    out.push("");
  }
  out.push(
    "Severity level the template draws from impact and urgency:",
    ...MATRIX.map((l) => `  ${l}`),
  );
  process.stdout.write(`${out.join("\n")}\n`);
}

const TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

// Patterns that must never reach a report. Matches are reported by kind and
// position only, never by value.
const SENSITIVE = [
  ["AWS access key", /\b(AKIA|ASIA)[0-9A-Z]{16}\b/],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9]{30,}\b/],
  ["GitHub fine-grained token", /\bgithub_pat_[A-Za-z0-9_]{30,}\b/],
  ["Slack token", /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/],
  ["API key (sk-)", /\bsk-[A-Za-z0-9_-]{20,}\b/],
  ["personal access token", /\b[a-z]{2,8}_pat_[A-Za-z0-9_-]{16,}\b/],
  ["private key", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  [
    "JSON web token",
    /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,
  ],
  ["credentials in a URL", /[a-z][a-z0-9+.-]*:\/\/[^\s/:@]+:[^\s/@]+@/i],
  [
    "password or secret assignment",
    /\b(password|passwd|pwd|secret|api[_-]?key|token)\s*[:=]\s*\S{6,}/i,
  ],
  ["email address", /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/],
  [
    "phone number",
    /(?<![\w/])(\+\d{1,3}[ -]?\d{2,4}[ -]?\d{3}[ -]?\d{3,4}|\b\d{3} \d{3} \d{3})\b/,
  ],
];

function die(msg) {
  process.stderr.write(`${msg}\n`);
  process.exit(1);
}

function readData(file) {
  const text = fs.readFileSync(file, "utf8");
  if (file.endsWith(".json")) return JSON.parse(text);
  const a = text.indexOf(OPEN);
  if (a < 0)
    die(
      `${file} has no pir-data block; it was not made from the PIR template.`,
    );
  const b = text.indexOf(CLOSE, a);
  return JSON.parse(text.slice(a + OPEN.length, b));
}

function writeData(file, data) {
  const text = fs.readFileSync(file, "utf8");
  const a = text.indexOf(OPEN);
  if (a < 0)
    die(
      `${file} has no pir-data block; it was not made from the PIR template.`,
    );
  const b = text.indexOf(CLOSE, a);
  // `</` inside the JSON would end the script element early.
  const json = JSON.stringify(data, null, 2).replace(/<\//g, "<\\/");
  const title = String(data.title || "Post-incident review").replace(
    /[<&]/g,
    "",
  );
  const out = (
    text.slice(0, a + OPEN.length) +
    "\n" +
    json +
    "\n" +
    text.slice(b)
  ).replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  fs.writeFileSync(file, out);
}

// Walk every string in the data with its JSON path.
function strings(node, at, out) {
  if (typeof node === "string") out.push([at, node]);
  else if (Array.isArray(node)) {
    node.forEach((v, i) => {
      strings(v, `${at}[${i}]`, out);
    });
  } else if (node && typeof node === "object")
    for (const k of Object.keys(node))
      strings(node[k], at ? `${at}.${k}` : k, out);
  return out;
}

function check(d) {
  const errors = [];
  const missing = [];
  const sensitive = [];
  const err = (m) => errors.push(m);
  const need = (v, label) => {
    if (v == null || v === "" || (Array.isArray(v) && v.length === 0))
      missing.push(label);
  };

  if (d.schema !== 1) err("schema must be 1");
  if (!["draft", "confirmed"].includes(d.status))
    err('status must be "draft" or "confirmed"');
  if (d.date != null && !DATE.test(d.date)) err("date must be YYYY-MM-DD");
  if (!d.timezone || !/^[+-]\d{2}:\d{2}$/.test(d.timezone.offset || ""))
    err('timezone.offset must look like "+01:00"');

  need(d.id, "Incident ID (ticket or card)");
  need(d.title, "Title");
  need(d.service, "Service");
  need(d.audience, "Who the report is for (Internal, or which client)");
  need(d.date, "Date of the incident");

  const c = d.classification || {};
  if (c.category != null && !CATEGORIES.includes(c.category))
    err(`classification.category must be one of ${CATEGORIES.join(", ")}`);
  need(c.category, "Category (CAT-01 to CAT-07)");
  for (const r of c.risk || [])
    if (!RISKS.includes(r))
      err(`classification.risk values must be ${RISKS.join(", ")}`);
  need(c.risk, "Associated risk (Confidentiality, Integrity, Availability)");
  need(c.handledBy, "Who handled the incident");

  for (const k of ["impact", "urgency"]) {
    const s = d.severity?.[k];
    if (s?.level == null) {
      missing.push(
        `${k[0].toUpperCase()}${k.slice(1)} level (high, medium or low)`,
      );
      continue;
    }
    if (!LEVELS.includes(s.level))
      err(`severity.${k}.level must be high, medium or low`);
    need(s.reason, `Reason for the ${k} rating`);
  }
  if (d.severity && "confirmed" in d.severity)
    err(
      "severity.confirmed is not used: severity only holds the person's answers",
    );

  need(d.facts?.affected, "What was affected");
  need(d.facts?.data, "Data impact (lost, altered or exposed?)");
  need(d.summary, "Summary");

  const tl = d.timeline || [];
  tl.forEach((e, i) => {
    if (!STAGES.includes(e.stage))
      err(
        `timeline[${i}].stage "${e.stage}" is not one of ${STAGES.join(", ")}`,
      );
    if (e.stage === "closed")
      err(
        `timeline[${i}]: do not add a closed step; the template draws it from signoff`,
      );
    if (e.time != null) {
      if (!TIME.test(e.time))
        err(
          `timeline[${i}].time must be YYYY-MM-DDTHH:MM in the report's timezone, or null`,
        );
    }
    if (!e.text) err(`timeline[${i}].text is empty`);
    if (e.stage === "decision")
      need(e.reason, `Why the decision at timeline[${i}] was taken`);
  });
  for (const s of ["impact_start", "detected", "acknowledged", "fixed"]) {
    if (!tl.some((e) => e.stage === s && e.time))
      missing.push(
        `Timeline: when the "${s.replace("_", " ")}" stage happened`,
      );
  }

  need(d.impact?.affected, "Who or what was affected (impact)");
  if (d.impact && "unconfirmed" in d.impact)
    err(
      "impact.unconfirmed is not used: settle each item first (affected, not affected, an action, or dropped)",
    );
  need(d.rootCause?.plain, "Root cause in plain language");

  const ids = new Set();
  (d.gaps || []).forEach((g, i) => {
    if (!/^G\d+$/.test(g.id || "")) err(`gaps[${i}].id must look like G1`);
    if (ids.has(g.id)) err(`gap id ${g.id} is used twice`);
    ids.add(g.id);
    need(g.summary, `Summary of gap ${g.id}`);
  });
  const closed = new Set();
  (d.actions || []).forEach((a, i) => {
    if (a.status == null) missing.push(`Status of the action "${a.action}"`);
    else if (!STATUSES.includes(a.status))
      err(`actions[${i}].status must be done, planned, open or null`);
    for (const g of a.closes || []) {
      if (!ids.has(g)) err(`actions[${i}] closes ${g}, which is not a gap`);
      closed.add(g);
    }
    if (!a.owner) missing.push(`Owner of the action "${a.action}"`);
  });
  // One line per gap with the actions meant to close it, for the recurrence check
  const recurrence = (d.gaps || []).map((g) => {
    const by = (d.actions || []).filter((a) => (a.closes || []).includes(g.id));
    const what = by.length
      ? `closed by ${by.map((a) => `"${a.action}" (${a.status || "status not recorded"})`).join(", ")}. Does that fully close it?`
      : "no action closes it. Should one?";
    return `${g.id} ${g.summary || ""}: ${what}`;
  });
  if (recurrence.length || (d.actions || []).length)
    recurrence.push(
      "With every action done, could this incident, or one like it elsewhere, happen again?",
    );

  const so = d.signoff || {};
  need(so.preparedBy, "Who prepared the report");
  need(d.sources, "Sources");
  if (d.sources != null && !Array.isArray(d.sources))
    err("sources must be a list of { label, url }");
  (Array.isArray(d.sources) ? d.sources : []).forEach((s, i) => {
    if (!s?.label) err(`sources[${i}] needs a label`);
    if (!s?.url) missing.push(`Link for the source "${s?.label}"`);
  });
  if (d.status === "confirmed") {
    for (const k of ["approvedBy", "approvedOn", "closedBy", "closedOn"])
      if (!so[k]) err(`a confirmed report needs signoff.${k}`);
    if (!d.severity?.impact?.level || !d.severity?.urgency?.level)
      err("a confirmed report needs both severity levels");
  }

  for (const [at, text] of strings(d, "", [])) {
    for (const [kind, re] of SENSITIVE)
      if (re.test(text)) sensitive.push(`${kind} in ${at}`);
  }

  return { errors, missing: [...new Set(missing)], recurrence, sensitive };
}

function report(r) {
  const out = [];
  const list = (title, items) => {
    if (items.length) out.push(`${title}:`, ...items.map((x) => `  - ${x}`));
  };
  list("ERRORS (fix the data)", r.errors);
  list(
    "SENSITIVE (remove or describe without the value, e.g. 'API token ending ...XB8')",
    r.sensitive,
  );
  list("NOT RECORDED (ask the person)", r.missing);
  list(
    "RECURRENCE CHECK (ask the person before confirming; never in the report)",
    r.recurrence,
  );
  if (!out.length) out.push("OK: nothing missing.");
  process.stdout.write(`${out.join("\n")}\n`);
}

const [cmd, file, dataFile] = process.argv.slice(2);
if (cmd === "questions") {
  questions();
  process.exit(0);
}
if (!cmd || !file)
  die(
    "usage: pir.js new|get|set|check <report.html> [data.json] | pir.js questions",
  );

if (cmd === "new") {
  if (fs.existsSync(file)) die(`${file} already exists; use set to update it.`);
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  fs.copyFileSync(TEMPLATE, file);
  process.stdout.write(`Created ${file}\n`);
} else if (cmd === "get") {
  process.stdout.write(`${JSON.stringify(readData(file), null, 2)}\n`);
} else if (cmd === "check") {
  const r = check(readData(file));
  report(r);
  process.exit(r.errors.length || r.sensitive.length ? 1 : 0);
} else if (cmd === "set") {
  if (!dataFile) die("usage: pir.js set <report.html> <data.json>");
  const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  const r = check(data);
  report(r);
  if (r.errors.length || r.sensitive.length)
    die(`Not written: fix the items above, then run set again.`);
  // Steps go in time order, untimed ones last, keeping the given order on ties.
  if (Array.isArray(data.timeline))
    data.timeline = data.timeline
      .map((e, i) => [e, i])
      .sort(([a, i], [b, j]) => {
        const x = a.time || "~";
        const y = b.time || "~";
        return x < y ? -1 : x > y ? 1 : i - j;
      })
      .map(([e]) => e);
  writeData(file, data);
  process.stdout.write(`Written ${file}\n`);
} else die(`unknown command ${cmd}`);

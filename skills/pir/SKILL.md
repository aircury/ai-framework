---
name: pir
description: Write a post-incident review (PIR) for a production incident as a fixed-format HTML report, built iteratively with the person, ready to print to PDF and to file under Aircury's PS16 incident procedure. Use whenever the user asks for a PIR, a post-incident review, a post-mortem, an incident report, "a report of what happened", "write it up for my boss", or an ISO incident record, after fixing an outage, bug, data problem or security event.
---

# PIR: post-incident review

Produce ONE post-incident review per incident, as an HTML file drawn by a fixed
template. The reader is both a non-technical manager and an engineer; the
record is filed for ISO 27001 under Aircury's PS16 procedure
(https://curipedia.aircury.net/page/compliance/ps16-information-security-incident-management).

The format is deterministic: **you never write HTML**. The template owns the
layout, the order of sections, every label, the durations, the T+ times and
the severity level. You only write the report's data (JSON) and hand it to
`scripts/pir.js`, which checks it and writes it into the file.

Work iteratively: draft what the evidence supports, show it, then fill the
gaps with the person, round after round, until they confirm it.

## The helper

```bash
node <skill-dir>/scripts/pir.js new   <report.html>              # copy the empty template
node <skill-dir>/scripts/pir.js get   <report.html>              # print the current data
node <skill-dir>/scripts/pir.js set   <report.html> <data.json>  # check, then write
node <skill-dir>/scripts/pir.js check <report.html>              # check only
node <skill-dir>/scripts/pir.js questions                        # the judgement-call questions
```

`set` prints four lists and refuses to write while there are errors or
sensitive values:

- **ERRORS**: the data breaks the schema. Fix and run `set` again.
- **SENSITIVE**: a value looks like a secret or personal data. Remove it or
  describe it without the value ("an API token ending …XB8").
- **NOT RECORDED**: fields still empty. These are your questions for the person.
- **RECURRENCE CHECK**: each gap with the actions meant to close it, and
  whether the incident could happen again. Ask these before confirming (see
  "Check the actions prevent it happening again"). Never put them in the report.

`set` also puts the timeline in time order, untimed steps last.

Keep `data.json` in your own working space, not in the folder you give the
person.

## Step 1: gather

Collect evidence before asking anything:

- this chat (what was broken, what was done and why);
- `git log` around the incident, CI and deploy runs (`gh run list`, `gh run view`);
- the incident's ticket or card, if the person names one.

Ask once, before drafting:

- the incident ID, if you cannot find it;
- who the report is for: internal, or which client. Confirm it even when the
  evidence suggests one;
- where to save the report (suggest the current directory,
  `pir-YYYY-MM-DD-<slug>.html`, with the report's `date`). There is no central
  location yet.

If the evidence lacks the key moments (when it was reported, taken on,
diagnosed, fixed and confirmed fixed), ask for them. A person's statement is
enough ("the client confirmed it worked at 12:36"); a ticket's history is
welcome but never required.

## Step 2: draft and show

1. `pir.js new <report.html>`.
2. Write `data.json` with everything the evidence supports. Leave unknown
   fields `null` or empty: the template shows them as "Not recorded". Never
   guess a time, owner, cause or number. Leave the judgement calls empty too
   (category, risk, impact and urgency), even when you have a view: see
   step 3.
3. `pir.js set <report.html> data.json`.
4. Show the draft: publish it as a private artifact if the Artifact tool is
   available, otherwise give the file path. Tell the person it is a draft.

## Step 3: build it together

Turn the NOT RECORDED list into questions. Ask with the
question tool when the answer is a choice (category, risk, impact and urgency
levels, action status); ask in plain chat when it is free text (owner names,
times). Ask a few at a time, most important first: severity, timeline stages,
impact, then owners.

Ask the judgement calls first, in one round: run `pir.js questions` and use
exactly its questions, options and definitions. For each, pick the option the
evidence supports by those definitions, put it first, marked recommended, with
a one-sentence reason, and offer the other options as alternatives (for the
category, your pick and the three likeliest others). Never write your pick into
the report: write the field only from the answer, using the reason the person
picked or gave. If your reason rests on something the evidence does not show
(say, whether users had a way round it they could use), say so in the option,
or ask that first.

### Check what was confirmed

Before the first round, read the code and the deploys around the fix for
anything else that uses the failing part (the same code, build, key, disk,
service or data) and that nobody has said was checked. Ask the person, for
each, whether it is worth checking. For example, after a checkout outage
caused by a payment library: "The refunds page uses the same library. Has
anyone tested that refunds still work?" Then, from the answer:

- it was checked: add it to `affected` or `notAffected`;
- worth checking but not done yet: add an action ("Check that refunds
  still work", with an owner), and list it in the chat as open;
- not worth it: leave it out.

The report never lists unchecked things.

### Check the actions prevent it happening again

This is the most important question in the review: a PIR whose actions
would not stop the incident happening again has failed, however well it
reads. Once the gaps and actions are drafted, and again before confirming,
go through the RECURRENCE CHECK from `set` with the person:

- for each gap: once its actions are done, is it fully closed? If not, what
  is missing?
- overall: with every action done, could this incident happen again, or the
  same cause hit another part?

Give your own view first, as the recommended answer, with the reason. Be
sceptical; these are common ways an action falls short:

- it fixes this occurrence, not the cause: "Pin the library to 1.2.3" stops
  this release, but the next update can break the same way; a check that
  runs the production build before deploy closes the gap;
- it is a step towards a fix, not the fix: "Investigate alerting on failed
  emails" does not close "nobody was alerted"; "Alert the on-call when an
  email fails to send" does;
- it depends on people remembering: "Remind the team to test the build"
  rarely holds; an automated check does;
- it is only wanted: an `open` action with no owner or date closes nothing
  yet.

From the answer: add or change actions, or, if the person accepts the
remaining risk, leave it and say so in the chat. Do not confirm the report
until this has been asked.

After each round, update `data.json`, run `set`, and republish. Then list in
the chat the questions still open, each with who can answer it (the person, or
a colleague they named, such as whoever handled the incident), so the person
can pass them on. These never go in the report.

Stop when the person is happy, even if some fields stay
"Not recorded"; never invent them.

## Step 4: confirm

Only when the recurrence check has been asked (step 3), the person says the
report is confirmed, and gives the names:

- `status: "confirmed"`;
- `signoff.approvedBy`/`approvedOn` and `closedBy`/`closedOn` (the closure
  time is when it is confirmed unless they give another);
- run `set` and republish. The draft banner disappears and the Closed step
  appears in the timeline.

Then tell the person to open the HTML in a browser and print it to PDF
(Ctrl+P, "Save as PDF", with "Headers and footers" unticked); that PDF is the
approved version. Print the local HTML file, not the published artifact page. Nothing in the
report folds away, and links stay clickable in the PDF. Only if they ask, print
it yourself with a headless Chromium:
`chrome --headless=new --no-pdf-header-footer --print-to-pdf=<out.pdf> file://<report.html>`.

## The data

All text fields take plain text with `` `code` `` and `**bold**` only. British
English. Write for a manager first: explain terms like "minify" the first time.

| Field | What goes in it |
|---|---|
| `schema` | Always `1`. |
| `status` | `"draft"` until the person confirms, then `"confirmed"`. |
| `id` | The incident's ticket or card, e.g. `"SHOP-412"`. |
| `title` | What broke, in one line, e.g. "Checkout outage on the production web shop". |
| `service` | The product or system, e.g. `"Shop"`. |
| `audience` | Who the report is for: `"Internal"`, or the client organisation's name. Never a person's name. |
| `date` | Day the impact started (the `impact_start` step), `YYYY-MM-DD` in the report's timezone; not the day it was reported. |
| `timezone` | `{ "label": "BST", "offset": "+01:00" }`. Every timeline time is in this zone. |
| `classification.category` | PS16 code, answered by the person (step 3): `CAT-01` malware, `CAT-02` unauthorised access, `CAT-03` information leak, `CAT-04` denial of service, `CAT-05` social engineering, `CAT-06` technical failure, `CAT-07` physical incident. |
| `classification.risk` | Any of `"Confidentiality"`, `"Integrity"`, `"Availability"`, answered by the person (step 3). |
| `classification.handledBy` | Who handled it (PS16 "person executing"). |
| `severity` | `{ impact: { level, reason }, urgency: { level, reason } }`. Levels are `high`, `medium`, `low`; one-sentence reason each. Only the person's answers (step 3); either may be `null` until answered. The template turns impact × urgency into the PS16 level and P-code. |
| `facts.affected` | The affected system or users, short. |
| `facts.data` | Whether data was lost, altered or exposed. |
| `summary` | Paragraphs telling the story from start to end. |
| `timeline` | Steps (`set` sorts them by time): `{ time, stage, text, evidence?, reason? }`. `time` is `YYYY-MM-DDTHH:MM` or `null` (shown as "Later", listed last). `evidence` is a list of `{ label, url }` (commits, CI runs, deploys, tickets). |
| `impact` | Lists `affected` and `notAffected`, only what was checked. Anything unchecked is settled first (see "Check what was confirmed" in step 3). |
| `rootCause.plain` | The cause in plain language for a non-technical reader. |
| `rootCause.steps` | The technical chain, cause to symptom: `{ title, detail, code? }`. Details can be long; `code` holds a real error or stack trace, verbatim, with secrets removed. |
| `gaps` | What let it through or slowed the response, shown under "Gaps": `{ id: "G1", summary, detail }`. Add a gap the evidence does not name only after asking; when the person says it is known and accepted, leave it out. |
| `actions` | `{ closes: ["G1"], action, status, owner, card }`. `status` is `done` (finished), `planned` (agreed, with a card or a date), `open` (wanted, not yet agreed or scheduled), or `null` until the person says; `owner` `null` if unassigned; `card` is the ticket or card that tracks the action, `{ label, url }`, or `null`; a commit, run or pull request is not a card (put it in the timeline's `evidence`). Fixes for this incident close no gap (`closes: []`). |
| `signoff` | `preparedBy`, `preparedOn`, `approvedBy`, `approvedOn`, `closedBy`, `closedOn` (dates `YYYY-MM-DD`). |
| `sources` | Where the facts came from, each with its link: `[{ label, url }]`, e.g. the repository's commits, the CI runs, each card. |

### Timeline stages

Every step is exactly one stage. The template draws the bar and the T+ times
from them, counting from `impact_start`.

| Stage | Meaning |
|---|---|
| `trigger` | The change that caused it. |
| `impact_start` | Users start being affected. Required. |
| `detected` | Someone notices or reports it. Required. |
| `acknowledged` | Someone takes ownership. Required. |
| `diagnosed` | Cause confirmed. |
| `fixed` | Users no longer affected. Required. |
| `verified` | Fix checked and stable. |
| `decision` | A judgment call during the response; `reason` says why. |
| `note` | Anything else worth recording. |

Never add a `closed` step: the template draws it from `signoff` once the
report is confirmed.

## Rules

- Draft until a person confirms. The draft says it is AI-drafted and pending
  review; the confirmed version says "Prepared by <name>, with AI
  assistance", as Aircury's AI usage policy asks.
- No secrets or personal data in the report, ever. PS16 requires the
  description to be free of sensitive data, and `set` enforces it.
- Never build a link. Use only URLs found in the evidence or given by the
  person; otherwise keep the label and leave `url` empty.
- Name the client only as an organisation, in `audience`. Refer to the
  client's staff by role ("the client's product owner"), never by name.
- Facts only from evidence or the person. When the evidence disagrees with
  what someone remembers, say so in the chat and ask.
- When the evidence or a definition leaves something open, ask; never decide
  it yourself. For example: what the service's main purpose is, or the day the
  impact started when the time is unknown.
- Judgement calls only from the person. Your proposals belong in the
  questions, as the recommended answer, never in the report.
- One report per incident. To change a report, `get` its data, edit, `set`.

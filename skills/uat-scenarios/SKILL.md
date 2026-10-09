---
name: uat-scenarios
description: Turn a feature's intent, pseudo-specification and branch changes into UAT artifacts - a scenarios TSV, a SQL file (data search queries or mock fixtures) and an optional testing-session playbook. Use when asked to prepare, design or write UAT scenarios, UAT fixtures, test data for UAT, or a UAT playbook for a branch or ticket.
---

# UAT Scenarios

Turn what a change is meant to do, and what the code actually does, into a
repeatable set of UAT artifacts that a tester can run end to end.

## 1. Input contract

All three are required. If the intent or changes is missing, 
**ask for it before doing anything else** and stop:

| Input | What it is | Example |
|---|---|---|
| **Intent** | One or two sentences: what the feature is for, from the business side | "Lead partners can defer an accepted offer to next year and resume it later" |
| **Pseudo-specification** | The rules in plain language: triggers, conditions, outputs, systems involved | "When status X is set in system A and the record is in state Y, call API Z; then write the result back to A" |
| **Changes** | The branch (default: current branch vs the main branch) or an explicit list of commits/files | `feature/x` vs `main` |

If an example of an **existing UAT artifact to use as a style example** is given, 
match its columns, tone and level of detail.

## 2. Understand before writing

Do not write any artifact until the flow is traced end to end.

1. Read the diff (`git log <base>..HEAD`, `git diff <base>...HEAD`, plus
   uncommitted changes). Separate the branch's own commits from drift in the base
   branch, and ask when unsure which changes are in scope.
2. For each feature in scope, trace the **whole path**: what the tester changes
   (UI, source system, API) -> how it is picked up (sync, job, trigger,
   schedule) -> every transformation in between -> what is sent out -> how the
   result comes back -> where the tester sees the final state.
3. Note the **downstream outcome impact**: after identifying the changed output,
   trace every later decision that consumes it. If the branch changes a value,
   status, flag, mapped field or validation result in a way that changes a later
   action or final state, include that later action/final state in scope too. Do
   not extend scope for data-only changes whose downstream outcome is identical.
4. Note the **execution model**: which jobs run in which order, how often, which
   time windows or incremental filters apply, and how many runs a scenario needs
   before the final state is visible.
5. Note the **selection and deduplication rules**: keys, "already sent" checks,
   "only the first/latest record" logic, history or audit tables, status maps.
6. Read the project's own docs (README, CLAUDE.md/AGENTS.md, docs folders) for
   how to run things locally or in a test environment.

Ask the user only about **high-level decisions** you cannot resolve from the
code: scope, which environment, how a tester is expected to set up data, which
behaviour is intended when code and spec disagree. Batch the questions in one go.

## 3. Scenario coverage

Test **only what the branch changed**, not the whole feature around it. Draw the
boundary at the changed logic and check its direct result there, then extend the
boundary only when that changed result alters downstream business logic or a
downstream outcome. If the change is to trigger logic and the only changed
outcome is whether something triggers, test whether or not it triggers; if the
changed trigger also changes what is sent, created, suppressed, retried, or shown
later, test that downstream outcome too. If the change is to a mapping and the
mapped value changes later branching, API payloads, status updates, payments,
notifications, or visible client state, test that outcome too. Behaviour the
branch did not touch is out of scope unless it is caused by the changed output or
is a regression risk (kind 3 below).

When deciding whether to test downstream, distinguish **data changes** from
**outcome changes**. A data change is a different intermediate value with the
same downstream behaviour; test it at the changed field. An outcome change is a
different action or final state caused by that value; test the first observable
downstream point where that different action/state appears.

Only write scenarios a tester can actually reproduce. Avoid scenarios that rely
on timing nobody controls, such as a change in an external system happening at
the same moment the tested system retrieves or sends data (a race between a user
edit and a running job). If such a case matters, report it in the chat as a risk
instead of writing a scenario for it.

For **each changed behaviour**, aim for all four kinds. Skip one only with a
stated reason.

1. **Happy path**: the trigger happens with valid data and the full chain
   completes.
2. **Restriction**: the trigger happens but a condition is not met, and the
   action must NOT happen (and nothing downstream changes).
3. **Regression**: the behaviour that shared the same trigger, table, status or
   code path before this change still works.
4. **Edge cases**, checking at least, if they apply:
   - **Duplication / repetition**: if the same action could happen twice, a test
     checking that a full cycle repeated on the same record (A -> B -> A -> B) 
     still works and the second cycle uses its own data.
   - **Missing or unmappable data**: lookups that resolve to nothing, empty
     mappings, NULL vs empty string.
   - **Time windows**: if the code relates to some timing (data only after a date, 
     updated in the last N minutes, ...), some test that edges that timing.
   - **External failures**: if deemed necessary for syncronisation or continuity
     reasons, a test when an external system fails (the API rejects the call); is 
     the failure stored, and is it retried or not?

Each scenario starts with an action a tester can perform and ends with a state
the tester can check in the system they use, not only in an intermediate table,
but it stops at the boundary above: it goes no further than needed to observe
the changed behaviour.

## 4. Output contract

Write all files to `uat/<area>_<feature>/` (lowercase, underscores; ask for
`<area>` and `<feature>` if they are not obvious). Re-running the skill for the
same feature **overwrites these files**, it never creates numbered copies.

### 4.1 `scenarios.tsv` (required)

Tab-separated, one header row, one row per scenario. No tabs or line breaks
inside a cell.

The file is read by the client. `Scenario`, `Description` and `Pre-checks` must
be understandable by a non-technical person: business language only, naming
records, fields and statuses as the client sees them in their system. No
references to the SQL file, query numbers, the playbook, table or column names,
jobs, commands or code.

Columns, in this order:

| Column | Content                                                                                                                                              |
|---|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Step` | Stable ID: a feature prefix and a number, e.g. `D.1`, `R.3`. Suffix `(internal)` for scenarios only the dev team runs.                               |
| `Scenario` | One sentence at most, a short summary.                                                                                                               |
| `Description` | What is tested and why it matters.                                                                                                                   |
| `Pre-checks` | What the data must look like before the test, in business terms.                                                                                     |
| `Expected Outcome` | The final state of the data and the actions, per run if several are needed ("Next run: ... The run after: ..."), naming the exact fields and values. |
| `ID / link columns` | Any number, one per object the tester needs (record links, object IDs). Fill with `fill from query N` or the mock ID.                                |
| `EXPECTED RESULTS` | Left as `Same as outcome` for the tester to overwrite with what actually happened.                                                                   |

Scenarios that build on each other (e.g. R.1 continues D.1) should be mentioned 
in the relevant row.

### 4.2 `fixtures.sql` (required)

Pick one mode per scenario and say which in the file header:

- **Mock data** when nothing in the scenario reaches an external API that
  validates real values. Use a fixed, recognisable ID range (e.g. `888000001..`)
  so reruns are idempotent. Every insert has a matching statement in a final
  **RESET** section.
- **Search queries** when the scenario goes through an external API that needs
  real records. Find existing records that satisfy every pre-check, including
  "nothing pending" and "in sync between systems" conditions.

Structure:

1. Header comment: what is tested, the execution model (which runs, in what
   order), the mode, and a numbered index of the queries.
2. One numbered query per pre-check / candidate search or creation, each with a
   comment naming the scenarios it serves.
3. If the mode is mock data, a query to show the relevant data in the
   state before the testing.
4. final-state query showing, per step, every field the Expected Outcome
   mentions.
5. RESET, for mock mode only.

**Do not create any schema or tables**. Use CTEs for mock data creation instead.

**Never run the SQL** against any database. Only write it.

### 4.3 `playbook.md` (optional, write it when the scenarios need ordering, commands or several runs)

A script a developer follows line by line while conducting the UAT. It is where
the scenarios are linked to the SQL file, the commands and the jobs.

Structure:

1. Prerequisites for the testing session: migrations, data loads, config, 
   access, ...
2. One section per scenario, in execution order from top to bottom (chained
   scenarios placed after the ones they continue). Each section is
   self-contained and lists, as numbered steps in the order they are run:
   - the query from the SQL file that finds or creates its data (pasted in full
     or referenced by number), and what to look for in the result;
   - the tester's action;
   - every command to run the jobs manually, written out in full (read-only or
     dry-run flags first), and how long to wait;
   - the query to check the outcome, and what to look for.

**Never group** scenarios, steps or commands, even when they are identical
across scenarios: repeat them in each scenario's section, so the developer never
has to jump back or forward in the file.

## 5. Bugs found while designing

While tracing the flow you will find code that cannot produce the expected
outcome. **Do not fix it.** For each one:

1. Report it in the chat with `file:line`, a concrete failing scenario and the
   proposed fix (smallest diff).
2. List it in the playbook under "Known issues" (or at the top of the SQL file if
   there is no playbook);
3. Write the scenario for the **intended** behaviour, marked as "Internal test", so 
   it fails until the bug is fixed, and say so in its Description.

Then ask whether to apply the fixes.

## 6. Final answer

Keep it short: the files written, one line per scenario ID, the bugs found, open
assumptions the user must confirm, and preconditions that may block a scenario
(test data that does not exist yet, environment limitations).

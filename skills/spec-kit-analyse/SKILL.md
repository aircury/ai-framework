---
name: spec-kit-analyse
description: Read-only cross-artefact consistency check across spec.md, plan.md, and tasks.md, ideally by an agent that did not write them. Detects coverage gaps, conflicts, FRAMEWORK.md violations, and plan claims about the code that do not hold, before implementation begins.
license: MIT
compatibility: No external workflow CLI required.
metadata:
  author: Aircury
  version: "1.1"
---

Perform a read-only consistency analysis after the task list has been generated.

**Input**: Optionally specify a change name. If omitted, infer from context or ask.

**This skill makes no file modifications.**

## Why a fresh view

The session that wrote the plan knows why it wrote each line, so an ambiguity it settled in its own head, or a plan that drifted from the specification, reads to it as consistent.
Where the agent can start a sub-agent with a fresh context (not a fork of the current session), have it run the analysis, giving it only the change's directory, this skill's instructions and the project root.
Do not explain the artefacts to it, summarise them, or tell it what you expect it to find.
Where no fresh agent is available, run the analysis yourself and say so in the report.

**Steps**

1. **Load artefacts**

   Load the change artefacts under `specs/changes/<name>/`:
   - `spec.md` (required)
   - `plan.md` (required)
   - `tasks.md` (required)

   If any is missing, stop and name the skill that produces it (`spec-kit-specify`, `spec-kit-plan` or `spec-kit-tasks`).

   Also load FRAMEWORK.md (with `FRAMEWORK.local.md` and the capability documents it links to) as the governing principles baseline, and the living specifications and decision records the change touches.

2. **Build the inventories**

   - Requirements: every `FR-nn` (edge-case requirements included), every `SC-nn` that needs buildable work (not outcome metrics measured after launch), and every `US-n`.
   - Tasks: each task's id, phase, citations, `[P]` marker and file paths.
   - Rules: the MUST and SHOULD statements of the governing standards the change touches.

3. **Run consistency checks**

   Analyse across these dimensions:

   | Dimension | What to check |
   |-----------|--------------|
   | Coverage | Every requirement and user story has tasks; a Documentation task counts like any other |
   | Shape | Every story and requirement carries its identifier; every requirement has a WHEN/THEN scenario; every surface the change alters has its edge-case states decided (or says why one cannot arise); `plan.md` carries `## Exceptions` and `## Record Search`; the last phase of `tasks.md` is a Documentation phase |
   | Alignment | Plan architecture matches spec goals and constraints |
   | FRAMEWORK.md compliance | No dependency rule violations, no anaemic domain model, ports present for external dependencies; every mandatory rule the change touches (tests, documentation, the living specification) has a task satisfying it; an exception is accepted only when `## Exceptions` records its rule, trade-off, rejected alternative and verification, and the trade-off holds |
   | Duplication | Overlapping requirements or tasks, and tasks proposing a test or check the code already has |
   | Ambiguity | Vague terms without measurable criteria; a criterion two observably different implementations could both claim to meet |
   | Terminology drift | Same concept named differently across artefacts |
   | Orphans | A task citing nothing, or an identifier spec.md does not have; a requirement with no task; a cross-reference to a heading that does not exist |
   | Order | A test task after the implementation it drives; a task naming a path that neither exists nor is created by an earlier task; a placeholder left in an artefact (`TODO`, `TBD`, `???`, an open question) |
   | Readers | A test outside the paths the tasks change that reads an identifier, message, format, flag or endpoint the plan alters, and that no task names |
   | Records | A requirement or planned change that contradicts a living specification or decision record the plan's `## Record Search` does not dispose of |

   Hold each to these rules:
   - **Coverage is checked against the specification's words, not only its stories.** Where a requirement names a capability and the plan turns it into a list, enumerate the instances from the code and compare.
   - **A risk the plan names is Coverage's concern too:** a named risk tied to no task whose check would fail if it materialised is uncovered work.
   - **A decision record reversed or withdrawn** without the user's recorded decision is a finding.

4. **Check the plan's claims about the code**

   List every claim the plan makes about the existing code that its scope or design depends on: that something exists, that something is absent, or what something currently does.
   Check each against the code itself, not against the plan's account of it.
   Search for an absence across the whole repository, as the code spells it, unless the plan states a narrower scope.
   A claim the code contradicts is a finding; a claim you could not check is recorded as unchecked, with what would settle it.

5. **Produce findings**

   Output a structured report:

   ```md
   ## Analysis: <change-name>

   ### Findings
   | ID | Severity | Dimension | Description | Location | Recommendation |
   |----|----------|-----------|-------------|----------|----------------|

   ### Coverage Summary
   | Requirement | Task IDs | Notes |
   |-------------|----------|-------|

   ### Claims
   | Claim | Search or read | Result |
   |-------|----------------|--------|

   ### FRAMEWORK.md Violations
   <List any violations. CRITICAL severity — must be fixed before proceeding.>

   ### Metrics
   - Requirements: N | Tasks: N | Coverage: N% (requirements with at least one task)
   - Claims checked: N (contradicted: N, unchecked: N)
   - Total findings: N
   - Critical: N | High: N | Medium: N | Low: N

   ### Recommended Next Actions
   <Ordered list of what to fix, and with which skill.>
   ```

   Make one coverage row for every requirement and user story, and always show the coverage and claims tables, even when nothing was found.
   Give findings stable ids prefixed by their dimension's initial, so a re-run on unchanged artefacts produces the same ids.
   Report at most 50 findings, most severe first, and summarise the rest.

   Severity, by the failure the finding would cause if the change were built as the artefacts say:
   - **CRITICAL** — a FRAMEWORK.md violation (its architecture, security or data rules, or how the work must be done, such as tests before implementation); a missing core artefact; a P1 requirement no task delivers; a living specification or decision record the change would make untrue with no disposition in `## Record Search`; or a recorded decision reversed without the user's decision.
   - **HIGH** — a requirement missed or contradicted; a claim about the code that does not hold; conflicting requirements; an ambiguous security or performance attribute; an untestable acceptance criterion; an exception recorded without one of its four columns.
   - **MEDIUM** — the implementer would have to guess or redo work, though the result could still meet every requirement: terminology drift, an underspecified edge case, a missing non-functional task.
   - **LOW** — wording, duplication, naming or traceability that changes nothing the change would deliver.

**Output**

After the analysis:
- If CRITICAL findings exist: "Fix FRAMEWORK.md violations and critical findings before proceeding. Do not use the `spec-kit-implement` skill until these are resolved."
- If only HIGH, MEDIUM or LOW findings: the user may proceed, but recommend fixing high findings first, naming the skill for each (`spec-kit-specify` or `spec-kit-clarify` for the spec, `spec-kit-plan` for the plan, `spec-kit-tasks` for the task list).
- If no critical findings: "Use the `spec-kit-implement` skill to execute the validated task list."
- Offer concrete remediation edits for the top findings; apply none without the user's approval.

**Guardrails**
- Read-only. Never modify any file.
- Never invent a missing section: report it as missing.
- FRAMEWORK.md violations are always CRITICAL — never downgrade or ignore them. A principle that itself needs to change is changed explicitly, through `FRAMEWORK.local.md` or the installed standards, outside this analysis.
- Deterministic: re-running on the same artefacts produces the same findings.
- Never pass the planner's reasoning to a fresh assessor.

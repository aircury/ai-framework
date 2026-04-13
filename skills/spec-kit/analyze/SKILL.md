---
name: spec-kit/analyze
description: Read-only cross-artifact consistency check across spec.md, plan.md, and tasks.md. Detects gaps, conflicts, and FRAMEWORK.md violations before implementation begins.
license: MIT
compatibility: No external workflow CLI required.
metadata:
  author: Aircury
  version: "1.0"
---

Perform a read-only consistency analysis across all available change artifacts.

**Input**: Optionally specify a change name. If omitted, infer from context or ask.

**This skill makes no file modifications.**

**Steps**

1. **Load artifacts**

   Load what exists under `specs/changes/<name>/`:
   - `spec.md` (required)
   - `plan.md` (if present)
   - `tasks.md` (if present)

   Also load FRAMEWORK.md as the governing principles baseline.

2. **Run consistency checks**

   Analyze across these dimensions:

   | Dimension | What to check |
   |-----------|--------------|
   | Coverage | Every user story in spec.md has corresponding tasks in tasks.md |
   | Alignment | Plan architecture matches spec goals and constraints |
   | FRAMEWORK.md compliance | No dependency rule violations, no anemic domain model, ports present for external dependencies |
   | Duplication | Overlapping requirements or tasks |
   | Ambiguity | Vague terms without measurable criteria |
   | Terminology drift | Same concept named differently across artifacts |
   | Orphans | Tasks with no corresponding requirement, or requirements with no tasks |

3. **Produce findings**

   Output a structured findings table:

   ```md
   ## Analysis: <change-name>

   ### Findings
   | ID | Severity | Dimension | Description | Location |
   |----|----------|-----------|-------------|----------|

   ### Coverage Summary
   | Requirement | Task IDs |
   |-------------|----------|

   ### FRAMEWORK.md Violations
   <List any violations. CRITICAL severity — must be fixed before proceeding.>

   ### Metrics
   - Total findings: N
   - Critical: N | High: N | Medium: N | Low: N

   ### Recommended Next Actions
   <Ordered list of what to fix.>
   ```

   Severity: CRITICAL (FRAMEWORK.md violation) > HIGH > MEDIUM > LOW.

**Output**

After the analysis:
- If CRITICAL findings exist: "Fix FRAMEWORK.md violations before proceeding. Do not use the `spec-kit/tasks` or `spec-kit/implement` skills until these are resolved."
- If no critical findings: "Use the `spec-kit/tasks` skill to generate the implementation task list."

**Guardrails**
- Read-only. Never modify any file.
- FRAMEWORK.md violations are always CRITICAL — never downgrade or ignore them.
- Deterministic: re-running on the same artifacts produces the same findings.

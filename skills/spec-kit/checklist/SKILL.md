---
name: spec-kit/checklist
description: Audit requirement quality across spec.md, plan.md, and tasks.md. Validates that requirements are complete, clear, measurable, and consistent — not that code works.
license: MIT
compatibility: No external workflow CLI required.
metadata:
  author: Aircury
  version: "1.0"
---

Audit requirement quality across change artifacts. This is a requirements linter, not a test runner.

**Input**: Optionally specify a change name. If omitted, infer from context or ask.

**Steps**

1. **Load artifacts**

   Load what exists under `specs/changes/<name>/`:
   - `spec.md`, `plan.md`, `tasks.md`

   Also load FRAMEWORK.md for governing principles alignment.

2. **Ask up to 3 clarifying questions** (skip if context is clear)

   Focus on: scope, risk prioritization, audience, boundary exclusions.

3. **Generate requirement quality checklists**

   Create or update files in `specs/changes/<name>/checklists/` grouped by domain (e.g., `api.md`, `ux.md`, `security.md`).

   Each checklist item must:
   - Use question format: "Are [requirement aspect] defined for [scenario]?"
   - Include a quality dimension tag: `[Completeness]`, `[Clarity]`, `[Consistency]`, `[Measurability]`, `[Gap]`, `[Ambiguity]`, `[Conflict]`
   - Reference the source: `[Spec §X]` or `[Plan §X]`
   - Never duplicate existing checklist IDs — continue numbering from the last `CHK-N`

   Quality dimensions to cover:
   - **Completeness** — are all scenarios and edge cases specified?
   - **Clarity** — are terms unambiguous and objectively measurable?
   - **Consistency** — do requirements contradict each other?
   - **Measurability** — can success criteria be verified without interpretation?
   - **Coverage** — are all user stories traceable to tasks?
   - **Non-functional** — are performance, security, and scale requirements present?

   ❌ Prohibited: "Verify button clicks", "Test API returns 200" — these are implementation tests.
   ✅ Required: "Is fallback behavior defined when X fails?", "Can 'fast' be objectively measured?"

4. **Report**

   Produce a summary:
   - Total items by dimension
   - High-priority gaps
   - Items that block proceeding to the `spec-kit/plan` or `spec-kit/implement` skills

**Guardrails**
- Never delete existing checklist items — only append.
- Maintain ≥80% traceability across checklist items.
- Flag FRAMEWORK.md principle gaps as CRITICAL.
- This skill audits requirements, not code behavior.

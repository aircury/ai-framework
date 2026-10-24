---
name: spec-kit-checklist
description: Audit requirement quality across spec.md, plan.md, and tasks.md for a chosen domain (UX, API, security, performance…). Writes reviewer-owned checklists that test whether requirements are complete, clear, measurable, and consistent — unit tests for the requirements, not for the code.
license: MIT
compatibility: No external workflow CLI required.
metadata:
  author: Aircury
  version: "1.1"
---

Audit requirement quality across change artefacts. This is a requirements linter, not a test runner:
if the spec is code written in English, the checklist is its unit test suite.

**Input**: Optionally specify a change name and the checklist's focus (e.g., "security", "ux for the checkout"). If the change is omitted, infer from context or ask.

**Ownership**: the checklists this skill writes belong to the reviewer.
A tick means the reviewer judged that requirement-quality criterion satisfied; it never means implementation work is done.
This skill writes items unticked and never ticks them; it may help evaluate them only when the reviewer asks.
`checklists/requirements.md` is the spec-quality checklist kept by `spec-kit-specify` and `spec-kit-clarify`, not one of these.

**Steps**

1. **Load artefacts**

   Load what exists under `specs/changes/<name>/`:
   - `spec.md`, `plan.md`, `tasks.md`

   Also load FRAMEWORK.md for governing principles alignment.
   Load only the parts relevant to the checklist's focus; summarise long sections rather than copying them.

2. **Ask up to 3 clarifying questions** (skip any the request already answers)

   Derive them from the request and the artefacts, never from a fixed catalogue, and only where the answer changes the checklist:
   - Scope — which areas or integrations are in.
   - Risk — which risks deserve mandatory items.
   - Depth — a light self-check or a formal review or release gate.
   - Audience — the author, a reviewer, QA.
   - Exclusions — what is deliberately left out this time.

   Offer options through the `ask-question` skill where it is installed.
   When nobody can answer, default to a standard depth, the reviewer as audience, and the two most relevant focus areas.

3. **Generate requirement quality checklists**

   Create or update files in `specs/changes/<name>/checklists/` named by domain (e.g., `api.md`, `ux.md`, `security.md`).
   A new file starts at `CHK001`; an existing file is appended to, continuing from its last `CHK` id. Never delete or replace existing items.

   File shape: a title, the purpose and date, a note that ticks belong to the reviewer, `##` sections by quality dimension, and items `- [ ] CHK001 <question> [Dimension, Spec §FR-01]`.

   Each checklist item must:
   - Ask about what is written (or not written) in the artefacts, as a question: "Are [requirement aspect] defined for [scenario]?"
   - Include a quality dimension tag: `[Completeness]`, `[Clarity]`, `[Consistency]`, `[Measurability]`, `[Coverage]`, `[Edge Case]`, `[Gap]`, `[Ambiguity]`, `[Conflict]`, `[Assumption]`, `[Dependency]`
   - Reference the source by identifier: `[Spec §FR-03]`, `[Spec §US-2]`, `[Plan §Data Models]`, or mark a missing requirement `[Gap]`

   Quality dimensions to cover:
   - **Completeness** — are all necessary requirements present?
   - **Clarity** — are terms unambiguous and objectively measurable?
   - **Consistency** — do requirements contradict each other?
   - **Measurability** — can every requirement's scenario be verified without interpretation?
   - **Coverage** — are primary, alternate, exception and recovery flows addressed, and every changed surface's edge-case states decided?
   - **Non-functional** — are performance, security, accessibility and scale requirements present?
   - **Dependencies and assumptions** — are they documented and validated?

   Where state changes, ask about rollback and partial failure.
   If more than about 40 candidate items emerge, keep the highest-risk ones and merge near-duplicates; fold many low-impact edge cases into one item.

   ❌ Prohibited — these test the implementation: "Verify the button clicks", "Test the API returns 200", "Confirm the page displays three cards", anything about code running, rendering or navigating.
   ✅ Required — these test the requirements: "Is fallback behaviour defined when the image fails to load? [Edge Case, Gap]", "Is 'fast' quantified with a specific threshold? [Clarity, Spec §SC-02]", "Are hover state requirements consistent across all interactive elements? [Consistency]"

4. **Report**

   Produce a summary:
   - Checklist path, item count, and whether the file was created or appended to
   - Focus areas, depth and audience chosen
   - Total items by dimension
   - High-priority gaps
   - Items that block proceeding to the `spec-kit-plan` or `spec-kit-implement` skills

**Guardrails**
- Never delete existing checklist items — only append.
- Never tick an item; ticks belong to the reviewer.
- Maintain ≥80% traceability across checklist items.
- Flag FRAMEWORK.md principle gaps as CRITICAL.
- This skill audits requirements, not code behaviour.

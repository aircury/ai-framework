---
name: spec-kit/clarify
description: Resolve ambiguities in a feature spec through targeted Q&A. Run after spec-kit-specify when open questions remain. Updates spec.md incrementally.
license: MIT
compatibility: No external workflow CLI required.
metadata:
  author: Aircury
  version: "1.0"
---

Resolve ambiguities in a feature spec through focused, sequential questioning.

**Input**: Optionally specify a change name. If omitted, infer from context or ask.

**Steps**

1. **Select the change**

   Auto-select if only one directory exists under `specs/changes/`. Otherwise ask.

2. **Load `specs/changes/<name>/spec.md`**

   If it does not exist, prompt the user to use the `spec-kit/specify` skill first.

3. **Scan for ambiguities**

   Examine the spec for issues across these categories (in priority order):
   - Functional scope — unclear boundaries or behavior
   - Data models — undefined entities, states, or transitions
   - UX flows — missing user journeys or edge cases
   - Non-functional — unspecified performance, security, or scale requirements
   - Integrations — undefined external dependencies
   - Terminology — ambiguous or inconsistent domain language

   Generate up to 5 questions total. Skip categories with no ambiguity.

4. **Ask one question at a time**

   Format each question as multiple-choice (2–5 options) or a short answer (≤5 words).

   Only ask a question if the answer materially impacts architecture, data modeling, testing, UX, operations, or compliance.

   After each answer, update `spec.md` before asking the next question.

5. **Finalize**

   After all questions are resolved (or the 5-question limit is reached), update the spec to:
   - Remove resolved `[NEEDS CLARIFICATION]` markers.
   - Flag any remaining unresolved items explicitly.

**Output**

After completing all questions:
- Confirm how many ambiguities were resolved.
- List any items deferred (still open).
- Next step: "Use the `spec-kit/plan` skill to create the technical implementation plan."

**Guardrails**
- Never ask more than 5 questions.
- Always save atomically after each answer — never batch updates.
- If all open questions are already resolved, report that and suggest the `spec-kit/plan` skill.
- Never introduce implementation details into the spec during clarification.

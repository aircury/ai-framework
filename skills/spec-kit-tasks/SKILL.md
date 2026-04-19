---
name: spec-kit-tasks
description: Generate a dependency-ordered, phase-based task list from spec.md and plan.md. Run after spec-kit-plan (and spec-kit-analyse if available).
license: MIT
compatibility: No external workflow CLI required.
metadata:
  author: Aircury
  version: "1.0"
---

Generate an actionable, dependency-ordered task list from the feature spec and plan.

**Input**: Optionally specify a change name. If omitted, infer from context or ask.

**Steps**

1. **Load artifacts**

   Required: `specs/changes/<name>/plan.md` and `specs/changes/<name>/spec.md`.

   Optional (also load if present): `specs/changes/<name>/checklists/`.

   If plan.md is missing, prompt to use the `spec-kit-plan` skill first.

2. **Generate `specs/changes/<name>/tasks.md`**

   Structure tasks in phases:

   ```md
   # Tasks: <Feature Name>

   ## Phase 1: Setup & Foundations
   - [ ] [T01] Description with exact file path

   ## Phase 2: Domain & Application Layer
   - [ ] [T02] Description with exact file path
   - [ ] [T03] [P] Description (parallel — can run concurrently with T02)

   ## Phase 3: Infrastructure & Adapters
   - [ ] [T04] [P] Description with exact file path

   ## Phase 4: Integration & Validation
   - [ ] [T05] Description with exact file path

   ## Dependency Graph
   T01 → T02 → T04 → T05
              ↘ T03 ↗

   ## MVP Scope
   <Minimum set of tasks for a working, deployable slice.>
   ```

   Task format: `- [ ] [TaskID] [P?] [Story?] Description with exact file path`

   - `[P]` marks tasks safe to run in parallel.
   - Each task must be specific and immediately executable.
   - Order: setup → domain → application → infrastructure → integration → polish.
   - Map each task back to a user story from spec.md.

3. **Validate**

   Before finishing:
   - Every user story has at least one task.
   - All tasks include exact file paths.
   - No task is vague or unbounded.

**Output**

After writing tasks.md:
- Task count per phase.
- MVP scope summary.
- Next step: "Use the `spec-kit-implement` skill to execute the task list."

**Guardrails**
- If unresolved FRAMEWORK.md violations exist from the `spec-kit-analyse` skill, warn before generating tasks.
- Never generate tasks that violate the dependency rule.
- Domain and application tasks must precede infrastructure tasks in ordering.

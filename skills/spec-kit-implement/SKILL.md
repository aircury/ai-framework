---
name: spec-kit-implement
description: Execute tasks from tasks.md following TDD. Marks tasks complete as it goes. Run after spec-kit-tasks. Syncs specs/features/ on completion.
license: MIT
compatibility: No external workflow CLI required.
metadata:
  author: Aircury
  version: "1.0"
---

Execute the task list from tasks.md following TDD and the FRAMEWORK.md change workflow.

**Input**: Optionally specify a change name. If omitted, infer from context or ask.

**Steps**

1. **Load artifacts**

   Load `specs/changes/<name>/tasks.md`, `plan.md`, and `spec.md`.

   If tasks.md is missing or incomplete, prompt to use the `spec-kit-tasks` skill first.

2. **Show current progress**

   Display:
   - Change name
   - Progress: "N/M tasks complete"
   - Remaining tasks overview

3. **Execute tasks phase by phase**

   For each pending task, in dependency order:

   - Announce the task being worked on.
   - Follow TDD: write the failing test first, implement the minimum to pass, then refactor.
   - Keep changes minimal and scoped to the task.
   - Respect layer boundaries: domain → application → infrastructure. Never invert.
   - Mark complete in tasks.md: `- [ ]` → `- [x]`.

   Parallel tasks (`[P]`) may be executed concurrently.

   **Pause if:**
   - A task is unclear — ask for clarification before implementing.
   - Implementation reveals a design issue — suggest updating plan.md.
   - A test fails unexpectedly — report and wait for guidance.
   - User interrupts.

4. **On completion, sync canonical specs**

   When all tasks are complete:
   - Update or create `specs/features/<name>/spec.md` to reflect the implemented behavior.
   - Use the spec format from FRAMEWORK.md (WHEN/THEN scenarios, RFC 2119 language).
   - Verify architecture boundaries still hold and tests pass.

**Output During Implementation**

```
## Implementing: <change-name>

Task 3/7: <description>
[implementation]
✓ Done

Task 4/7: <description>
[implementation]
✓ Done
```

**Output On Completion**

```
## Complete: <change-name>

7/7 tasks complete.
specs/features/<name>/spec.md updated.

Definition of done:
✓ Tests written before implementation
✓ Architecture boundaries hold
✓ specs/features/ updated
```

**Guardrails**
- TDD is non-negotiable. Never write implementation before the failing test.
- Halt on non-parallel task failures — do not skip ahead.
- Update task checkbox immediately after completion.
- Protect the domain model first; adapt infrastructure around it.
- specs/features/ MUST be updated before the work is considered done.

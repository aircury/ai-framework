---
name: spec-kit-tasks
description: Generate a dependency-ordered, phase-based task list from spec.md and plan.md, each task citing the requirements it delivers and ending on a Documentation phase. Run after spec-kit-plan and before spec-kit-analyse.
license: MIT
compatibility: No external workflow CLI required.
metadata:
  author: Aircury
  version: "1.1"
---

Generate an actionable, dependency-ordered task list from the feature spec and plan.

**Input**: Optionally specify a change name. If omitted, infer from context or ask.

**Steps**

1. **Load artefacts**

   Required: `specs/changes/<name>/plan.md` and `specs/changes/<name>/spec.md`.

   Optional (also load if present): `specs/changes/<name>/checklists/`.

   Also load `FRAMEWORK.md` (with `FRAMEWORK.local.md` when present) for the discipline and obligations the tasks must carry.

   If plan.md is missing, prompt to use the `spec-kit-plan` skill first.

2. **Generate `specs/changes/<name>/tasks.md`**

   Structure tasks in phases:

   ```md
   # Tasks: <Feature Name>

   ## Phase 1: Setup & Foundations
   - [ ] [T01] [FR-01] Description with exact file path

   ## Phase 2: Domain & Application Layer
   - [ ] [T02] [FR-01] Add a failing test for <behaviour> in <test file>
   - [ ] [T03] [FR-01, FR-02] Make it pass: implement <behaviour> in <file>
   - [ ] [T04] [P] [FR-03] Description (parallel — touches other files, depends on nothing unfinished)

   ## Phase 3: Infrastructure & Adapters
   - [ ] [T05] [P] [US-1] Description with exact file path

   ## Phase 4: Integration & Validation
   - [ ] [T06] [FR-02] Description with exact file path

   ## Phase 5: Documentation
   - [ ] [T07] [FR-01] Update `specs/features/<area>/spec.md` where <what the change makes untrue>

   ## Dependency Graph
   T01 → T02 → T03 → T05 → T06 → T07
              ↘ T04 ↗

   ## MVP Scope
   <Minimum set of tasks for a working, deployable slice, usually the P1 stories, with how each story is tested on its own.>
   ```

   Task format: `- [ ] [TaskID] [P?] [FR-nn, US-n] Description with exact file path`

   - The citation group, after the parallel marker, names at least one requirement (`FR-nn`), success criterion (`SC-nn`) or user story (`US-n`) from spec.md: what the task delivers.
   - `[P]` marks a task that touches different files from its neighbours and depends on no unfinished task.
   - Each task must be specific and immediately executable: a reader with no other context can complete it.
   - Order: setup → domain → application → infrastructure → integration → documentation.
   - **Test before implementation.** Where FRAMEWORK.md makes TDD the default discipline, put every test task immediately **before** the implementation task it drives, and show it in the Dependency Graph (test, then implementation).
     Phrase the pair as "Add a failing test for X" / "Make it pass: implement X".
     In a statically typed language, a test that does not compile because its symbol does not exist yet is the normal failing step, not a reason to order the implementation first.
   - **Quote the constraints.** For each field constraint the plan's data models give (required or optional, limits, allowed values, validation rules), quote it verbatim in the task that implements it, so it is not left to the implementer's discretion.
   - **Name stale tests.** Every test outside the change that the plan found reading something the change alters gets a task to run it, and update it if needed.
   - **The last phase is `## Phase N: Documentation`:** one task per living specification, decision record or document the plan's `## Record Search` says the change makes untrue, or the single note `(no observable behaviour change)`.
     A convergence phase appended later by `spec-kit-converge` comes after it.
   - Map each task back to the requirements and stories in spec.md.

3. **Validate**

   Before finishing:
   - Every requirement, edge-case requirement and user story has at least one task, and every task cites what it delivers.
   - Every success criterion that needs buildable work (a load test, an audit, a measurement) has a task; outcome metrics measured after launch need none.
   - The last phase is a Documentation phase with a task or the note.
   - All tasks include exact file paths.
   - No task is vague or unbounded.
   - A place inside a large file is addressed by something searchable — a function name, a distinctive string, a search pattern — never by line number, which goes stale before the task is worked.
     Keep a count beside the pattern ("sixteen references"), so the implementer knows when the search has found them all.
   - **Every obligation the project's rules attach to the touched paths has a task.** Read `FRAMEWORK.md` and `FRAMEWORK.local.md` for what a change to those paths owes beyond its tests — a version to bump, a changelog entry, a generated file to regenerate, an artefact to rebuild — and give each its own task.
   - Every new test path follows how sibling tests in that area are already organised; check the existing layout before inventing a path.

**Output**

After writing tasks.md:
- Task count per phase, and per user story.
- Parallel opportunities identified.
- MVP scope summary.
- Next step: "Use the `spec-kit-analyse` skill to validate consistency and requirement coverage before implementation."

**Guardrails**
- Never generate tasks that violate the dependency rule.
- Domain and application tasks must precede infrastructure tasks in ordering.
- Under a project-mandated TDD discipline, never order an implementation task ahead of the test task that drives it.
- Never add work no requirement, story or plan decision asks for.

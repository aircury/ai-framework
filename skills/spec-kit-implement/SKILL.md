---
name: spec-kit-implement
description: Execute tasks from tasks.md following TDD, marking tasks complete as it goes and working the Documentation phase that updates specs/features/. Run after spec-kit-analyse, and again after spec-kit-converge appends tasks.
license: MIT
compatibility: No external workflow CLI required.
metadata:
  author: Aircury
  version: "1.1"
---

Execute the task list from tasks.md following TDD and the FRAMEWORK.md change workflow.

**Input**: Optionally specify a change name. If omitted, infer from context or ask.

**Steps**

1. **Check the checklists**

   If `specs/changes/<name>/checklists/` exists, count each checklist's ticked and unticked items and show a table:

   ```text
   | Checklist       | Total | Checked | Unchecked | Status |
   |-----------------|-------|---------|-----------|--------|
   | requirements.md | 14    | 14      | 0         | PASS   |
   | security.md     | 8     | 5       | 3         | FAIL   |
   ```

   `requirements.md` is the spec-quality checklist kept by `spec-kit-specify` and `spec-kit-clarify`; the others come from `spec-kit-checklist` and belong to the reviewer, where a tick means a requirement-quality criterion is satisfied, not that work is done.
   The checklists are a read-only gate: never change their markers.
   If any has unticked items, ask the user whether to proceed anyway, and stop unless they say yes.

2. **Load artefacts**

   Load `specs/changes/<name>/tasks.md`, `plan.md`, and `spec.md`, and `FRAMEWORK.md` (with `FRAMEWORK.local.md` and the capability documents it links to) for the rules the work must keep.

   If tasks.md is missing or incomplete, prompt to use the `spec-kit-tasks` skill first.

3. **Show current progress**

   Display:
   - Change name
   - Progress: "N/M tasks complete"
   - Remaining tasks overview

4. **Execute tasks phase by phase**

   For each pending task, in dependency order:

   - Announce the task being worked on.
   - Resolve its targets against the current tree before working it: a task list outlives the tree it was written against, and a file may have moved or a rule changed since.
     Write any correction into the task as you tick it, so the next reader sees what was actually done.
   - Follow TDD: write the failing test first, see it fail for the expected reason, implement the minimum to pass, then refactor.
   - Keep changes minimal and scoped to the task.
   - Respect layer boundaries: domain → application → infrastructure. Never invert.
   - Run the focussed checks for the task: the tests covering the behaviour, and the project's linters, formatters and type checks over the files it changed.
   - Mark complete in tasks.md: `- [ ]` → `- [x]`, the moment it is done.
   - Complete each phase, and check it, before moving to the next.

   Tasks marked `[P]` touch different files and depend on no unfinished task, so they may run concurrently, in sub-agents where the agent supports them.
   This is a permission, not an obligation; never split tasks that share files or order across sub-agents, since their edits collide.
   The parent remains responsible for integrating the results, ticking the boxes and continuing until the list is done.
   When a parallel task fails, continue with the others and report the failure.

   **Pause if:**
   - A task is unclear — ask for clarification before implementing.
   - Implementation reveals a design issue — suggest updating plan.md with the `spec-kit-plan` skill.
   - A test fails unexpectedly — report and wait for guidance.
   - User interrupts.

5. **Work the Documentation phase**

   The task list ends on a Documentation phase: one task per living specification, decision record or document the change makes untrue, or the note `(no observable behaviour change)`.
   Work and tick those tasks like any other:
   - Use the spec format from FRAMEWORK.md (WHEN/THEN scenarios, RFC 2119 language).
   - The living specification describes what was built; it never quietly lowers what was required.
     Where the implementation falls short of a requirement in the change's `spec.md`, do not rewrite the living specification to match the shortfall.
     Finish the work, or ask the user, and record an accepted shortfall as a decision in the change's `spec.md` with its reason, so a reviewer judges it as one.

6. **Sweep for tests the change made stale**

   A test file the change did not touch can still name a function, a selector or a literal the change removed, and the touched files' tests cannot see it.
   Diff the working tree against the commit the change started from, list the names the changed source files lost, keep those no source file still carries, and search the test files for them.
   With Git, adjusting the test patterns to the project's layout:

   ```bash
   BASE=$(git merge-base origin/main HEAD)   # or the commit the change started from
   T=(':(glob)**/*_test.*' ':(glob)**/*.test.*' ':(glob)**/*.spec.*' ':(glob)**/tests/**' ':(glob)**/test/**')
   X=("${T[@]/#:(glob)/:(exclude,glob)}")
   git diff -U0 "$BASE" -- . "${X[@]}" | grep '^-' | grep -v '^---' |
     grep -oE '[A-Za-z_][A-Za-z0-9_]{2,}' | sort -u |
     while read -r name; do
       git grep -q -w -F -e "$name" -- . "${X[@]}" || git grep -l -w -F -e "$name" -- "${T[@]}"
     done | sort -u | grep -vxF -f <(git diff --name-only "$BASE"; echo /dev/null)
   ```

   Run every test file it lists as a focussed check; a name most test files carry is the suite's vocabulary, not a stale test.

7. **Validate completion**

   - Every task is ticked, or left unticked with a note naming who owns it.
   - The implemented behaviour matches the spec, and the code follows the plan.
   - The project's tests and checks pass for the affected scope.
   - Architecture boundaries still hold.

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
Documentation phase worked: specs/features/<area>/spec.md updated.

Definition of done:
✓ Tests written before implementation
✓ Architecture boundaries hold
✓ Documentation phase's tasks ticked
```

Next step: "Use the `spec-kit-converge` skill to assess the work against spec.md, plan.md and tasks.md and turn any gap into tasks."

**Guardrails**
- TDD is non-negotiable. Never write implementation before the failing test.
- Halt on non-parallel task failures — do not skip ahead.
- Update task checkbox immediately after completion.
- Protect the domain model first; adapt infrastructure around it.
- The Documentation phase's tasks MUST be ticked, and specs/features/ updated, before the work is considered done.
- **A test exercises the invocation production actually uses.** Where code takes paths, roots, modes or options from its caller, cover the caller's own values, not only a convenient case.
- **Follow a new value to where it leaves the system.** A test on a view model or an internal object proves a value was computed, not that it ships: where a response or output is assembled by hand, a new field can be dropped on the way out. Cover it with a test that reads the real output.
- **Pin the wiring where a missing dependency means off.** When leaving a dependency unset makes the application skip a check, one test builds the real composition and asserts the dependency is set.
- **A component test without layout proves a control renders, not that it is usable.** Look at every interactive control the change adds or restyles in a real browser, not one of them.
- **Removing markup or an identifier can break code that reads it** far from where it is rendered or defined; search for its readers before deleting it.
- **Prove a text assertion can fail.** When a test asserts on a file's text rather than on behaviour, mutate the file in a copy, check the mutation really changed it, and see the test fail. Make an extraction by pattern assert that it found something before examining its values, or a pattern that matches nothing passes while checking nothing. Match only executable lines when the warning text itself contains what the test looks for. State expected values literally rather than reading them from the version the change edits.
- **Remove every probe completely**, including any directory it created, and restore files by absolute path; then diff the restored file against the intended change.
- **Never read a pipeline's exit status as the command's.** `test-suite | tail -20` reports `tail`'s status, so a red run reads as green. Redirect to a log and record the command's own status (`<command> > run.log 2>&1; echo "EXIT=$?" >> run.log`) before believing any of it.
- **Never edit a script while a long-running command is executing it**; let it finish, or edit a copy.

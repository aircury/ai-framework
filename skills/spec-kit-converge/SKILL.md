---
name: spec-kit-converge
description: Assess implemented work against its change's spec.md, plan.md and tasks.md, ideally by an agent that did not do the work, and append every gap to tasks.md as a Convergence phase for spec-kit-implement to complete. Changes no code, spec or plan. Run after spec-kit-implement.
license: MIT
compatibility: No external workflow CLI required.
metadata:
  author: Aircury
  version: "1.0"
---

Check finished work against what its change asked for, and turn every gap into a task.

**Input**: Optionally specify a change name. If omitted, infer from context or ask.

**This skill changes no code, no `spec.md` and no `plan.md`.**
Its only write is appending a `## Phase N: Convergence` section to `tasks.md`.
When nothing remains, `tasks.md` stays byte for byte unchanged.

It judges the code as it stands against the artefacts, which are the sole source of intent, with FRAMEWORK.md as governing constraints.
Ticked boxes, commit messages and the implementer's notes are claims, not evidence.

## Why a fresh view

The session that implemented the work knows what it meant, so its own work reads as done.
Where the agent can start a sub-agent with a fresh context (not a fork of the current session), have it make the assessment (steps 2 to 4), giving it only the change's directory, this skill's instructions and the project root.
Do not explain the work to it, summarise the change, or tell it what you expect it to find: anything you add is the implementer's view.
Where no fresh agent is available, make the assessment yourself and say so in the report.

**Steps**

1. **Select the change and check it is ready**

   `specs/changes/<name>/spec.md`, `plan.md` and `tasks.md` must exist.
   If one is missing, stop and name the skill that produces it (`spec-kit-specify`, `spec-kit-plan` or `spec-kit-tasks`).
   `spec-kit-implement` must have run on the current task list: every task is ticked, or left unticked with a note naming who owns it.
   This run's round is the number of Convergence phases already in `tasks.md`, plus one.

   Also load `FRAMEWORK.md` (with `FRAMEWORK.local.md` and the capability documents it links to).

2. **Build the intent inventory**

   - Every requirement (`FR-nn`, the edge-case requirements included), every success criterion (`SC-nn`) that needs buildable work (not outcome metrics measured after launch), and every user story's independent test.
   - Every decision `plan.md` records, and every exception with its verification.
   - Every existing task, whatever its checkbox and whichever phase it is in, earlier Convergence phases included: a tick is not evidence.
   - Every mandatory rule in the governing standards that the work touches, such as tests before implementation and the living specification's update.

   Bound the code in scope by the paths `plan.md` and `tasks.md` name, a search for the concepts each requirement describes, and what the change altered (`git diff` against the commit the change started from, uncommitted work included).
   Use the diff only to find what the change touched; judge the code as it now stands.

3. **Find the evidence**

   For each item in the inventory, find where the code meets it and the test that would fail if that behaviour were removed.
   Where no automated test is feasible, say why and how the item was verified instead, and judge whether that reason holds; a reason that does not hold is a gap.
   An item the artefacts assign to a later step (a check run only at release, say) is recorded as owned by that step, not as a gap.
   Reading a test is not confirming it: say whether you saw it fail without the behaviour.
   For a chain of corrective tasks, judge the resulting behaviour, not the superseded steps.

4. **Classify the gaps**

   A finding names its source — the requirement, criterion, story, plan decision or rule it traces to — and has a stable id (`F01`, `F02`…).
   A gap that traces to no source is not a finding.
   Classify each by gap type:
   - **missing** — nothing in the code meets it.
   - **partial** — something meets part of it.
   - **contradicts** — the code does something the source rules out, or breaks a FRAMEWORK.md rule.
   - **unrequested** — work the change added that no source asks for. Convergence deletes nothing: the task is to justify it against a source or remove it.

   Behaviour that existed before the change is never a finding.
   A requirement the change introduces whose every cited test passes without the change is pinned by no test: raise a finding for it.
   With little or no code yet, the whole specified scope is missing work.

   Severity, by the failure it causes:
   - **CRITICAL** — a FRAMEWORK.md rule broken, or a missing or contradicting gap that blocks a P1 story.
   - **HIGH** — a missing or partial gap on a core requirement or acceptance scenario.
   - **MEDIUM** — a partial gap on a secondary requirement, or unrequested work with unclear justification.
   - **LOW** — a minor partial gap, polish, or low-risk unrequested work.

5. **Report the findings**

   Before writing anything, show:

   ```md
   ## Convergence: <change-name>, round <n>

   | ID | Gap type | Severity | Source | Evidence | Remaining work |
   |----|----------|----------|--------|----------|----------------|
   | F01 | missing | HIGH | FR-03 | no handling of an empty result in <file> | Show the empty state |

   ### Evidence
   | Source | Location | Test, or why none is feasible | Confirmed failing without it |
   |--------|----------|-------------------------------|------------------------------|

   - Checked: N requirements and criteria, N plan decisions, N rules
   - Findings: missing N, partial N, contradicts N, unrequested N
   - Critical: N | High: N | Medium: N | Low: N
   ```

6. **Append the Convergence phase, or report convergence**

   **With findings open:** append to the end of `tasks.md`, below everything already there:
   1. Take the highest existing task id and phase number.
   2. Add one section `## Phase N: Convergence`, with N the next phase number.
   3. Add one task per finding, CRITICAL and HIGH first, numbering on from the highest id, in the task list's own format:
      `- [ ] [T42] [FR-03] <imperative description> — F01 (missing)`
      The citation names the finding's source; a plan decision or rule is cited by name (`plan: storage decision`, `FRAMEWORK.md: TDD`).
   4. Never rewrite, renumber, reorder or remove an existing task, including an earlier Convergence phase; a later round adds a new phase below it.

   **With nothing open:** leave `tasks.md` untouched and report "Converged: the implementation satisfies the spec, plan and tasks.", with the counts of what was checked.

**The loop**

After tasks are appended, `spec-kit-implement` works them under the same discipline as the original ones, and this skill runs again.
Run at most three rounds over one piece of finished work.
A round that leaves only LOW findings is the last: they are appended and worked, not reassessed.
If findings remain after the third round, stop and hand them to the user, critical ones first, as the question.

A finding is never closed by:
- changing `spec.md` or `plan.md` — what was asked is changed only by the user, through `spec-kit-clarify` or `spec-kit-plan`, outside convergence;
- deleting or weakening a test or check — that is a finding of its own;
- disagreeing with it — record the disagreement for the reviewer in `specs/changes/<name>/disputes.md` (`F03: <why>`), and let the next round judge the finding afresh without seeing the argument.

A finding closes only when a later round finds it closed, never because the implementer believes it fixed.

**Output**

- Outcome first, in plain words: converged, or N tasks appended under Phase N, or not converged after three rounds with the findings that remain.
- The findings and evidence tables.
- Next step:
  - Tasks appended: "Use the `spec-kit-implement` skill to complete the Convergence tasks, then run this skill again."
  - Converged: the change is ready for review.

**Guardrails**
- Never edit code, `spec.md` or `plan.md`.
- Append only; when converged, `tasks.md` is unchanged.
- Never give a fresh assessor anything of the implementer's view: no summary, no expectations, no dispute.
- Judge the code, not the ticks.
- FRAMEWORK.md violations are always CRITICAL and come first.

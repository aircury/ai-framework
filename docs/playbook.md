# Aircury Framework Playbook

This playbook shows how to use Aircury after installation. If you are unsure which workflow to use, describe the task to the agent; the installed framework asks the agent to recommend a mode before doing non-trivial implementation work.

## Quick Decision Guide

| Need | Recommended mode | Expected result |
|---|---|---|
| Small, well-understood change | `plan-build` | Short plan, implementation, verification, and spec update if behavior changes. |
| Complex but clear change | `propose-apply-complete` | OpenSpec proposal artifacts, implementation, and final sync to `specs/features/`. |
| Unknown root cause | `explore-propose-apply-complete` | Investigation first, then proposal, implementation, and completion. |
| New feature or formal requirements | `spec-kit` | Specification, clarification, plan, tasks, analysis, implementation, and optional checklist. |
| New project bootstrap | `walking-skeleton` | ADR selection, first end-to-end spec, runnable baseline, and clean rebuild verification. |
| Understand existing behavior | `specs-extractor` | Behavior-first specs extracted from the current codebase. |
| Rewrite from frozen specs | `specs-interpreter` | New implementation direction constrained by `specs/features/`. |

## Day-To-Day Examples

### Fix A Specific Bug

Use this when the failure is local and the expected behavior is clear.

```text
Fix the signup validation bug where names with accented characters are rejected. Review the relevant component, update the validation, run the focused checks, and update specs if behavior changes.
```

Recommended mode: `plan-build`.

Expected steps:

1. Read `AGENTS.md`, `FRAMEWORK.md`, and relevant specs.
2. Create a short implementation plan.
3. Implement the fix.
4. Run focused verification.
5. Update `specs/features/` if observable behavior changed.

### Change Core Logic

Use this when the scope is clear but crosses boundaries.

```text
Migrate email delivery from Sendgrid to Resend. Assess impact first, create an OpenSpec proposal, implement from the approved tasks, then sync the final behavior into specs.
```

Recommended mode: `propose-apply-complete`.

Skills involved:

- `open-spec-propose`
- `open-spec-apply`
- `open-spec-complete`

Expected artifacts:

- `specs/changes/<name>/proposal.md`
- `specs/changes/<name>/design.md`
- `specs/changes/<name>/tasks.md`
- updated `specs/features/` after completion

### Investigate A Ghost Bug

Use this when the root cause is not known.

```text
Users report that the shopping cart sometimes clears itself after reload. Investigate the state management first, identify the root cause, then propose the smallest safe fix.
```

Recommended mode: `explore-propose-apply-complete`.

Expected steps:

1. Run `open-spec-explore` without implementing.
2. Summarize findings and scope.
3. Continue with `open-spec-propose`.
4. Implement with `open-spec-apply`.
5. Close with `open-spec-complete`.

### Add A Large Feature

Use this for new capabilities with requirements risk or multiple dependencies.

```text
Add Stripe subscriptions for the Premium plan. We need checkout, subscription state, webhook handling, and plan access control. Start with the formal Spec Kit workflow.
```

Recommended mode: `spec-kit`.

Skills involved:

- `spec-kit-specify`
- `spec-kit-clarify`
- `spec-kit-plan`
- `spec-kit-tasks`
- `spec-kit-analyse`
- `spec-kit-implement`
- `spec-kit-checklist`

### Start A New Project

Use this when a greenfield repository needs a runnable baseline before normal feature delivery begins.

```text
Bootstrap this project with the walking skeleton workflow. Start by selecting the ADRs with the team, then define the smallest end-to-end slice, build it, and verify it from a clean rebuild.
```

Recommended skill:

- `walking-skeleton`

Expected flow:

1. Run `/walking-skeleton plan` to choose ADRs, validate dependencies and conflicts, and write `specs/decisions/ADR-0000` plus the selected ADRs.
2. Run `/walking-skeleton spec` to define the first tiny end-to-end behaviour that proves the selected architecture seams.
3. Run `/walking-skeleton build` to create tasks, implement the baseline, and verify it with rebuild, linting, tests, and smoke checks.

Important constraints:

- The bundled ADRs are proposals and flavours, not mandatory architecture.
- The walking skeleton is not a silver bullet; the generated baseline must be reviewed and corrected by the team.
- After the skeleton is complete, return to normal framework delivery with TDD where automated testing is feasible.

### Extract Specs From Existing Code

Use this when a codebase has behavior that must be understood or preserved.

```text
Extract the current billing behavior into authoritative specs. Capture business rules, API contracts, persistence assumptions, and edge cases from the existing code only.
```

Recommended skill: `specs-extractor`.

Output: reviewed and consolidated specs in `specs/features/`.

### Rewrite From Specs

Use this when behavior is frozen but implementation can change.

```text
Rewrite this Express service using NestJS from the specs in specs/features/. Keep public API behavior and database contracts identical unless I approve a contract change.
```

Recommended skill: `specs-interpreter`.

Expected steps:

1. Load relevant specs from `specs/features/`.
2. Identify fixed contracts and flexible implementation choices.
3. Design the new implementation collaboratively.
4. Implement iteratively while preserving the spec contract.

### Frontend Work

Use this when UI changes must preserve or extend a design system.

```text
Redesign the user profile card. Extract the current layout and experience, update the style guide if new tokens are needed, then implement the component using the project patterns.
```

Recommended skills:

- `frontend-ui-workflow`

Expected artifacts:

- `specs/features/<feature>/layout.md`
- `specs/features/<feature>/experience.md`
- `specs/features/<feature>/implementation-plan.md`
- `specs/ui/style-guide.md`

### Restyle An Existing App Into A New Design System

Use this when an existing app has behavior and structure worth preserving, but the visual language must be rebuilt using the current project's design system.

```text
Restyle this existing screen using the design system from the current app. Extract layout and experience from the existing implementation, extract the design system from the current project, then implement the screen with the new visual language while preserving behavior.
```

Recommended skills:

- `frontend-ui-workflow`

Expected flow:

1. Use `frontend-ui-workflow` to extract `layout.md` from the existing screen to capture structure, hierarchy, and content slots.
2. Use `frontend-ui-workflow` to extract `experience.md` from the existing screen to capture behavior, states, flows, and micro-interactions.
3. Use `frontend-ui-workflow` to extract or update `specs/ui/style-guide.md` from the current project so the target design system is explicit.
4. Use `frontend-ui-workflow` to produce `implementation-plan.md` before writing substantial UI code.
5. Use `frontend-ui-workflow` to implement the restyled UI, using `layout.md`, `experience.md`, `implementation-plan.md`, and `specs/ui/style-guide.md` as sources of truth.

Expected artifacts:

- `specs/features/<feature>/layout.md` from the existing implementation.
- `specs/features/<feature>/experience.md` from the existing implementation.
- `specs/features/<feature>/implementation-plan.md` for clean implementation boundaries.
- `specs/ui/style-guide.md` from the target project.
- Restyled UI code that preserves existing behavior but follows the current design system.

### Record An Architectural Decision

Use this when a decision affects architecture, workflow, dependencies, or long-term project direction.

```text
Record the decision to use Redis-backed sessions so sessions can be revoked in real time. Include context, decision, consequences, and whether any prior ADR is superseded.
```

Required module: `decision-records`.

Output: `specs/decisions/ADR-XXXX-*.md`.

If `airsync` is also enabled, the generated framework requires proposing reusable ADR knowledge to Airsync INBOX.

## Non-Negotiable Rules

- `specs/features/` is the canonical behavior source.
- `specs/changes/` is temporary working state and should not be committed.
- Behavior changes must end with updated canonical specs.
- `AGENTS.md` is the quick entrypoint; `FRAMEWORK.md` is the governing document.
- Enabled capabilities are project rules, not suggestions.
- Do not skip required workflow steps once a mode is selected.

## Common Questions

**What if I do not know which mode to use?**

Ask the agent to recommend a mode. The generated framework requires routing before non-trivial implementation.

**Do all tasks need OpenSpec or Spec Kit?**

No. `plan-build` is enough for clear, small-to-medium work.

**Where should a new agent start?**

Start with `AGENTS.md`, then read `FRAMEWORK.md`, relevant `specs/features/`, and any relevant ADRs.

**When do skills matter?**

Use skills when executing a structured workflow. Direct edits can still happen through `plan-build` when the task is clear.

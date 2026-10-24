# Aircury Framework Playbook

This playbook shows how to use Aircury after installation. If you are unsure which workflow to use, describe the task to the agent; the installed framework asks the agent to recommend a mode before doing non-trivial implementation work.

## Quick Decision Guide

| Need | Recommended mode | Expected result |
|---|---|---|
| Small, well-understood change | `plan-build` | Short plan, implementation, verification, and spec update if behavior changes. |
| Complex or cross-cutting change | `spec-kit` | Specification, clarification, plan, tasks, analysis, implementation, and optional checklist. |
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

1. Run `/walking-skeleton plan` to choose ADRs, validate dependencies and conflicts, and write descriptively named ADRs under `specs/decisions/`.
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

- `specs/changes/<name>/layout.md`
- `specs/changes/<name>/experience.md`
- `specs/changes/<name>/implementation-plan.md`
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

- `specs/changes/<name>/layout.md` from the existing implementation.
- `specs/changes/<name>/experience.md` from the existing implementation.
- `specs/changes/<name>/implementation-plan.md` for clean implementation boundaries.
- `specs/ui/style-guide.md` from the target project.
- Restyled UI code that preserves existing behavior but follows the current design system.

### Adopt An External Design System

Use this when a project should follow a design system maintained outside the project, such as a shared component registry or a themed package.

The framework does not install or configure the library. The design system provides its own installer, usually a skill or a CLI command. It also delivers two files that the `frontend` rules recognise:

- `specs/ui/DESIGN.md`: the brand and token rules. It takes precedence over conventions extracted from the code.
- `specs/ui/design-system.md`: how to install, update, and override the library's components and tokens.

Expected flow:

1. Record the adoption in an ADR.
2. Install the design system with its own installer so both files land in `specs/ui/`.
3. Use `frontend-ui-workflow` to update `specs/ui/style-guide.md`, marking what comes from the design system and recording gaps against `DESIGN.md`.
4. Migrate local primitives to the library's components one at a time.

Do not edit `DESIGN.md` or `design-system.md` in the project; change them in the design system's source.

### Record An Architectural Decision

Use this when a decision affects architecture, workflow, dependencies, or long-term project direction.

```text
Record the decision to use Redis-backed sessions so sessions can be revoked in real time. Include context, decision, and consequences. Revise the existing ADR if this decision changes.
```

Required module: `decision-records`.

Output: `specs/decisions/<decision-name>.md`.

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

**Do all tasks need Spec Kit?**

No. `plan-build` is enough for clear, small-to-medium work.

**Where should a new agent start?**

Start with `AGENTS.md`, then read `FRAMEWORK.md`, relevant `specs/features/`, and any relevant ADRs.

**When do skills matter?**

Use skills when executing a structured workflow. Direct edits can still happen through `plan-build` when the task is clear.

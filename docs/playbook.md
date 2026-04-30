# Aircury Framework Playbook

This playbook shows how to use Aircury after installation. If you are unsure which workflow to use, describe the task to the agent; the installed framework asks the agent to recommend a mode before doing non-trivial implementation work.

## Quick Decision Guide

| Need | Recommended mode | Expected result |
|---|---|---|
| Small, well-understood change | `plan-build` | Short plan, implementation, verification, and spec update if behavior changes. |
| Complex but clear change | `propose-apply-complete` | OpenSpec proposal artifacts, implementation, and final sync to `specs/features/`. |
| Unknown root cause | `explore-propose-apply-complete` | Investigation first, then proposal, implementation, and completion. |
| New feature or formal requirements | `spec-kit` | Specification, clarification, plan, analysis, tasks, implementation, and optional checklist. |
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
- `spec-kit-analyse`
- `spec-kit-tasks`
- `spec-kit-implement`
- `spec-kit-checklist`

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
Rewrite this Express service using NestJS from the specs in specs/features/. Keep public API behavior and database compatibility identical unless I approve a contract change.
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

- `frontend-layout-extractor`
- `frontend-experience-extractor`
- `frontend-ui-generator`

Expected artifacts:

- `specs/features/<feature>/layout.md`
- `specs/features/<feature>/experience.md`
- `specs/ui/style-guide.md`

### Restyle A Legacy App Into A New Design System

Use this when a legacy app has behavior and structure worth preserving, but the visual language must be rebuilt using the current project's design system.

```text
Restyle this legacy screen using the design system from the current app. Extract layout and experience from the legacy implementation, extract the design system from the current project, then implement the screen with the new visual language while preserving behavior.
```

Recommended skills:

- `frontend-layout-extractor`
- `frontend-experience-extractor`
- `frontend-ui-generator`

Expected flow:

1. Extract `layout.md` from the legacy screen to capture structure, hierarchy, and content slots.
2. Extract `experience.md` from the legacy screen to capture behavior, states, flows, and micro-interactions.
3. Extract or update `specs/ui/style-guide.md` from the current non-legacy project so the target design system is explicit.
4. Implement the restyled UI with `frontend-ui-generator`, using the legacy `layout.md` and `experience.md` as behavioral constraints and `specs/ui/style-guide.md` as the visual source of truth.

Expected artifacts:

- `specs/features/<feature>/layout.md` from the legacy implementation.
- `specs/features/<feature>/experience.md` from the legacy implementation.
- `specs/ui/style-guide.md` from the target project.
- Restyled UI code that preserves legacy behavior but follows the current design system.

### Record An Architectural Decision

Use this when a decision affects architecture, workflow, dependencies, or long-term project direction.

```text
Record the decision to use Redis-backed sessions so sessions can be revoked in real time. Include context, decision, consequences, and whether any prior ADR is superseded.
```

Required module: `decision-records`.

Output: `specs/decisions/ADR-XXXX-*.md`.

If `airsync-memory` is also enabled, the generated framework requires proposing reusable ADR knowledge to Airsync INBOX.

## Non-Negotiable Rules

- `specs/features/` is the canonical behavior source.
- `specs/changes/` is temporary working state and should not be committed.
- Behavior changes must end with updated canonical specs.
- `AGENTS.md` is the quick entrypoint; `FRAMEWORK.md` is the governing document.
- Enabled standards modules are project rules, not suggestions.
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

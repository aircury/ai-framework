# Aircury Framework Playbook

Operator-focused usage manual built around real framework use cases.

This document explains how to work with Aircury once it is installed: which mode to choose, which artifacts to expect, and which rules are unbreakable. If you are unsure how to start, do not worry: the framework will always analyze your request and recommend the best mode for the task you describe.

## Framework Outputs

In a local installation, the framework can generate these artifacts:

- `FRAMEWORK.md`: project operating rules and constitution.
- `AGENTS.md`: short checklist for future sessions.
- `.aircury/framework.config.json`: active modules in the project.
- `specs/features/`: canonical specifications of observable behavior, the source of truth.
- `specs/decisions/`: ADRs (Architecture Decision Records) when the `decision-records` module is enabled.
- `specs/ui/`: frontend references when the `frontend` module is enabled.
- `.aircury/bin/legacy-spec-orchestrator.mjs`: local legacy extraction orchestrator in the `spec-extraction` profile.

Skills help execute the work. The source of truth remains `specs/features/`.

## Quick Decision Guide

Below is a quick reference guide, but remember: if you explain your goal to the agent, the framework will always recommend the optimal default flow.

| If you need... | Recommended mode | Expected result |
|---|---|---|
| A small, well-understood change | `plan-build` | Short plan, user confirmation, implementation, and spec update if behavior changes |
| A complex but clear change | `propose-apply-complete` | Change artifacts in `specs/changes/`, implementation, and final sync |
| Investigation before deciding | `explore-propose-apply-complete` | Exploration first, then proposal, implementation, and closure |
| A new feature (epic) from scratch | `spec-kit` | Specification, clarifications, plan, analysis, tasks, and implementation |
| Understand a legacy system | `spec-extraction` + `specs-extractor` | Canonical specs ready to understand or rebuild the system |
| Rewrite code from specs | `specs-interpreter` | Collaborative design of a new implementation that preserves contracts |

## Day-To-Day Use Cases

### 1. Fix A Specific Bug Or Make A Small Adjustment

**When to use it**

- Localized failures.
- Minor behavior adjustments.
- Very narrow refactors.

**Real example**

- The Submit button fails when the username contains accented characters.

**Suggested prompt**

```text
I need to fix a bug: the signup form validation fails when the name contains accented characters. Review the SignupForm component and fix the regex.
```

**Recommended mode**

- `plan-build`

**Skills involved**

- None strictly required.
- `commit-changes` optionally at the end.

**Steps**

1. Read `FRAMEWORK.md`.
2. Read the relevant spec in `specs/features/`.
3. Create a short plan.
4. Present the plan and wait for confirmation before continuing.
5. Implement the change.
6. Run verification for the affected scope.
7. Update `specs/features/` if observable behavior changed.

### 2. Refactor Or Change Core Logic

**When to use it**

- Cross-cutting changes with clear boundaries.
- Work that needs design and task breakdown before coding.

**Real example**

- Migrate the email provider from Sendgrid to Resend.

**Suggested prompt**

```text
We are going to migrate all email delivery from Sendgrid to Resend. Before touching the code, assess the impact, create a proposal, and generate the necessary tasks.
```

**Recommended mode**

- `propose-apply-complete`

**Skills involved**

- `open-spec-propose`
- `open-spec-apply`
- `open-spec-complete`

**Steps**

1. Run `open-spec-propose`.
2. Create `specs/changes/<name>/proposal.md`, `design.md`, and `tasks.md`.
3. Run `open-spec-apply` to implement from those artifacts.
4. Run `open-spec-complete` to sync canonical output into `specs/features/`.

### 3. Investigate A Ghost Bug

**When to use it**

- You do not know where the failure is.
- You need the root cause before you know what code to change.

**Real example**

- The shopping cart occasionally clears itself.

**Suggested prompt**

```text
There are reports that the shopping cart clears itself when the page reloads. I do not know the root cause. Investigate how we are managing state, find the problem, and then propose a solution.
```

**Recommended mode**

- `explore-propose-apply-complete`

**Skills involved**

- `open-spec-explore`
- `open-spec-propose`
- `open-spec-apply`
- `open-spec-complete`

**Steps**

1. Run `open-spec-explore` to investigate without implementing.
2. Bound the findings and the proposed change.
3. Continue with `open-spec-propose`.
4. Implement with `open-spec-apply`.
5. Close by updating the canonical documentation with `open-spec-complete`.

### 4. Add A New Epic Or Large Feature From Scratch

**When to use it**

- New product capabilities that touch multiple contexts and dependencies.
- Work that requires requirements validation before coding.

**Real example**

- Integrate payments with Stripe.

**Suggested prompt**

```text
I want to integrate Stripe payments so users can subscribe to the Premium plan. We will need new endpoints, webhooks, and database changes. Start the specification process.
```

**Recommended mode**

- `spec-kit`

**Skills involved**

- `spec-kit-specify`
- `spec-kit-clarify`
- `spec-kit-plan`
- `spec-kit-analyse`
- `spec-kit-tasks`
- `spec-kit-implement`
- `spec-kit-checklist`

**Steps**

1. Create the initial specification with `spec-kit-specify`.
2. Resolve ambiguity, for example webhook handling, with `spec-kit-clarify`.
3. Translate the spec into a technical plan with `spec-kit-plan`.
4. Review risks with `spec-kit-analyse`.
5. Break execution down with `spec-kit-tasks`.
6. Implement with `spec-kit-implement`.
7. Optionally run a final review with `spec-kit-checklist`.

### 5. Enter A Legacy Project Without Documentation

**When to use it**

- You inherit a project.
- You need to freeze current behavior before refactoring.
- You need to turn code into usable specs.

**Real example**

- You are assigned an old billing microservice and nobody knows how it works.

**Suggested prompt**

```text
I need to understand exactly what this billing module does. Extract all business rules, endpoints, and database dependencies from the current code.
```

**Recommended mode**

- Local installation with the `spec-extraction` profile.

**Skills involved**

- `specs-extractor`
- `specs-interpreter` later if you plan to rewrite it.

**Steps**

1. Install the framework with the `spec-extraction` profile.
2. Extract specs based purely on current behavior.
3. Review the output to ensure API and database contracts are preserved.
4. Consolidate the output into `specs/features/`.

### 6. Rewrite A System From Frozen Specs

**When to use it**

- You want to change the framework or architecture of a system.
- You must keep contracts intact, including behavior and database compatibility.

**Real example**

- Migrate a service from Express.js to NestJS.

**Suggested prompt**

```text
We are going to rewrite this service using NestJS based on the specs in specs/features/. Keep the API and database contracts identical.
```

**Recommended mode**

- `specs-interpreter`

**Skills involved**

- `specs-interpreter`

**Steps**

1. Load specs from `specs/features/`.
2. Summarize what is fixed by contract and what is flexible in architecture.
3. Choose the technical direction.
4. Implement iteratively while keeping the spec as the only source of truth.

### 7. UI Changes Guided By The Design System

**When to use it**

- Tasks that modify the UI and must remain visually consistent with the rest of the application.

**Real example**

- Redesign the user profile card.

**Suggested prompt**

```text
I want to redesign the user profile card in the dashboard. Extract the current structure and generate the new component using our style-guide tokens.
```

**Recommended mode**

- The main flow that fits the task, plus the sequence in `specs/ui/frontend-workflow.md`.

**Skills involved**

- `frontend-layout-extractor`
- `frontend-experience-extractor`
- `frontend-ui-generator`

**Steps**

1. Extract structure into `specs/features/<feature-name>/layout.md`.
2. Extract micro-interactions into `experience.md`.
3. Update `specs/ui/style-guide.md`.
4. Implement using `frontend-ui-generator`.

### 8. Record An Architectural Decision

**When to use it**

- You introduce a deep change in architecture, dependencies, or team rules.

**Real example**

- The team decides to use Redis for session handling instead of JWT so sessions can be revoked in real time.

**Suggested prompt**

```text
We have decided to move session handling to Redis so we can revoke sessions in real time. Write and record this architectural decision.
```

**Recommended mode**

- Complementary to the main flow. Requires the `decision-records` module.

**Steps**

1. Review previous ADRs in `specs/decisions/`.
2. Create a new ADR, or supersede an older one if appropriate.
3. Document Context, Decision, and Consequences.

### 9. Capture Shared Team Memory

**When to use it**

- You discover a useful pattern, a common pitfall, or a convention that should be preserved.

**Real example**

- You discover that certain Prisma transactions cause deadlocks unless they are ordered in a specific way.

**Suggested prompt**

```text
Add this convention to our shared memory: in this project, Prisma transactions must always be ordered in this specific way to avoid deadlocks.
```

**Recommended mode**

- Complementary. Requires the `airsync-memory` module.

**Skills involved**

- `airsync`

## Artifacts By Work Type

| Work Type | Main Artifacts |
|---|---|
| Standard change | Code plus update to `specs/features/` if observable behavior changes |
| OpenSpec | `specs/changes/<name>/proposal.md`, `design.md`, `tasks.md` |
| Spec Kit | `specs/changes/<name>/spec.md`, `plan.md`, and task artifacts |
| ADR | `specs/decisions/ADR-XXXX-*.md` |
| Frontend | `layout.md`, `experience.md`, `specs/ui/style-guide.md` |
| Legacy Extraction | Consolidated specs in `specs/features/` and utilities in `.aircury/bin/` |

## Non-Negotiable Rules

- `specs/features/` is the only canonical source of observable behavior.
- Every change that affects behavior must end by updating `specs/features/`.
- `specs/changes/` is temporary working state, not the source of truth.
- If you choose a workflow mode, you must follow its sequence without skipping steps.
- `AGENTS.md` is the quick entrypoint. `FRAMEWORK.md` is the law.
- If the decisions module is enabled, architectural changes must be recorded in `specs/decisions/`.

## Short FAQ

**What if I do not know which mode or workflow to use?**

Do not worry. Just describe your problem or task to the agent. The framework will evaluate the context and recommend the best mode to execute your request safely and efficiently.

**Where should I look first when entering a project?**

- `AGENTS.md` for quick orientation.
- `FRAMEWORK.md` for the golden rules.
- `specs/features/` to understand what the system does today.

**When should I use the framework skills?**

When you need to execute one of the structured workflows. They are not required to add a `console.log`, but they are essential if you open a `spec-kit` or `open-spec` flow.

**What happens if files already exist in my repo during installation?**

The installer detects conflicts and lets you choose whether to skip or overwrite them.

**What is the difference between a canonical spec and a temporary artifact?**

- `specs/features/` describes the real finished system and is versioned.
- `specs/changes/` proposals and tasks only exist to help complete the work and then lose relevance.

# Framework Improvements

This document captures the June 2026 framework feedback and turns it into a durable improvement backlog. It synthesises the raw meeting notes, structured feedback, and prior analysis into actionable framework changes.

## Strategic Direction

The framework should stay small at the always-loaded layer and become better at routing agents to the right project knowledge at the right time.

The main opportunity is not to add more generic rules to `FRAMEWORK.md`. It is to convert knowledge that currently lives in conversations, PR reviews, ADRs, and repeated code patterns into small, reviewable, routable artefacts.

Recommended direction:

- Keep `AGENTS.md` and `FRAMEWORK.md` as lightweight routing and constitution entrypoints.
- Keep `specs/features/` focused on observable behaviour.
- Add first-class project implementation rules under `specs/rules/`.
- Add domain terminology under `specs/language/`.
- Add a walking skeleton workflow for new projects, driven by reviewable ADR flavours.
- Use optional capabilities and skills instead of making every team adopt every workflow.

## Knowledge Artefact Boundaries

| Artefact | Answers | Example content |
|---|---|---|
| `AGENTS.md` | Where should the agent start? | Short routing table and links to framework docs. |
| `FRAMEWORK.md` | What are the non-negotiable operating rules? | Workflow modes, definition of done, installed capabilities. |
| `FRAMEWORK.local.md` | What is specific to this repository? | Local architecture notes, commands, exceptions, adoption notes. |
| `specs/features/` | What does the system do? | User-visible behaviour, scenarios, contracts, edge cases. |
| `specs/rules/` | How do we write code in this project? | Controller rules, service boundaries, fixture style, testing conventions. |
| `specs/language/` | What do domain words mean here? | Terms, invariants, common confusions, related concepts. |
| `specs/decisions/` | Why did we choose this? | ADRs for architecture, tooling, deployment, testing, skeleton choices. |
| Airsync or shared memory | What knowledge is reusable across repositories? | Team-wide patterns, reusable playbooks, lessons from prior projects. |

## Priority Backlog

### P0: Highest Leverage, Low To Medium Complexity

1. Add a routing table to generated `AGENTS.md`.
2. Define `specs/rules/` as a generated starter folder.
3. Create an `extract-rules` skill that proposes implementation rules from diffs, similar code, ADRs, and optional PR feedback.
4. Define `specs/language/` as a generated starter folder.
5. Create an `extract-language` skill that proposes domain glossary entries from specs, code, tests, and docs.
6. Update `specs/features/README.md` to support grouping by bounded context or subdomain.
7. Add a test quality gate to the testing standard module.

### P1: High Impact, Requires More Design

1. Add a `walking-skeleton` skill for new projects.
2. Add reusable skeleton flavours as ADR bundles, starting with one opinionated web application flavour.
3. Add an ADR for splitting the framework core from optional skeleton flavours.
4. Make `open-spec-complete` and `spec-kit-implement` suggest `extract-rules` when a diff introduces reusable implementation patterns.
5. Add an explicit "look for similar code first" step to implementation workflows.
6. Evolve `FRAMEWORK.md` towards a constitution plus capability index, moving detailed capability guidance into linked docs.

### P2: Later Productisation

1. Create a `pr-review-miner` skill that extracts repeated engineering guidance from historical PR comments.
2. Add an optional `orchestration` or `subagents` capability with recommended specialist roles.
3. Investigate shared memory integration for cross-project knowledge reuse.
4. Define an incremental adoption workflow for existing projects.

## Actionable Designs

### Routable `AGENTS.md`

Generated `AGENTS.md` should remain short, but it should be more useful as a router. Instead of copying detailed rules into the entrypoint, add a compact table that tells agents which artefacts and skills to load.

Example rows:

| Task type | Read first | Suggested flow |
|---|---|---|
| Small code change | `FRAMEWORK.md`, affected specs | `plan-build` |
| Ambiguous feature | `FRAMEWORK.md`, `specs/features/` | `spec-kit` |
| Clear cross-cutting change | `FRAMEWORK.md`, relevant ADRs | `open-spec` |
| UI work | `specs/ui/`, feature layout and experience docs | `frontend-ui-workflow` |
| Existing project pattern work | `FRAMEWORK.local.md`, similar code, `specs/rules/` | `extract-rules` if patterns are missing |
| Unknown domain concept | `specs/language/` | `extract-language` if definitions are missing |
| New project bootstrap | skeleton ADR flavour | `walking-skeleton` |

### Project Implementation Rules

Add `specs/rules/` for implementation style that cannot be captured as behaviour specs.

Suggested structure:

```text
specs/rules/
  README.md
  backend/
    controllers.md
    application-services.md
    repositories.md
  frontend/
    forms.md
    feature-hooks.md
  testing/
    fixtures.md
    scenarios.md
```

Suggested rule shape:

```md
## Rule: Controllers Delegate Business Behaviour

Status: VERIFIED | INFERRED | NEEDS_REVIEW

WHEN adding or modifying an HTTP controller
THEN keep business decisions out of the controller
AND delegate orchestration to the application layer

Examples:
- Good: `src/.../ExistingController.php`
- Avoid: inline validation and persistence inside the controller
```

The `extract-rules` skill should be conservative. It should propose rules with evidence and status, not silently turn inferred patterns into permanent project law.

### Domain Language

Add `specs/language/` for ubiquitous language, definitions, invariants, and common misunderstandings.

Suggested structure:

```text
specs/language/
  README.md
  assessment.md
  institution.md
  markbook.md
```

Suggested entry shape:

```md
# Assessment

Status: VERIFIED | INFERRED | NEEDS_REVIEW

Definition:
...

Related concepts:
- ...

Invariants:
- ...

Common confusions:
- ...

Evidence:
- `specs/features/.../spec.md`
- `src/...`
```

This is useful for both agents and humans, especially during onboarding and when existing product knowledge is spread across code, tests, conversations, and reviews.

### Feature Organisation By Domain

Allow `specs/features/` to grow beyond a flat list of folders.

Recommended convention:

```text
specs/features/
  assessment/
    exam-registration/spec.md
    grading/spec.md
  platform/
    authentication/spec.md
    audit-log/spec.md
```

Guidance:

- Use a bounded context, subdomain, or aggregate as the first level for domain features.
- Use `platform`, `architecture`, `security`, `observability`, or `developer-experience` for non-domain behaviour.
- Avoid a flat folder with dozens of unrelated feature directories.

### Walking Skeleton For New Projects

New projects need a minimum executable end-to-end slice before strict TDD becomes productive. The framework should provide a `walking-skeleton` flow that turns reviewed ADRs into a runnable baseline.

Initial integration should keep the implementation in the external `aircury/walking-skeleton` repository and make the framework reference or install it as an optional capability. The framework should not vendor a particular ADR catalogue or present one stack as mandatory core.

Proposed flow:

1. Choose a skeleton flavour or combine ADRs.
2. Review and adapt ADRs to the project.
3. Generate `tasks.md` from the ADR set.
4. Build the skeleton without enforcing strict TDD in this bootstrap phase.
5. Reinstall dependencies from scratch.
6. Rebuild containers or runtime services.
7. Run lint, typecheck, tests, and smoke checks.
8. Fix generated issues.
9. Mark the walking skeleton ADR as completed or deprecated.
10. Start normal feature delivery with TDD and specs.

The feedback indicates that generating an explicit task list from ADRs works better than asking the agent to execute directly from the ADR documents.

### Skeleton Flavours

Skeleton flavours should be reusable ADR bundles, not one official architecture.

Each flavour should declare:

- Stack and assumptions.
- Included ADRs.
- Optional ADRs that can be swapped out.
- Recommended skills.
- Expected commands.
- Success criteria for the walking skeleton.

Potential layout:

```text
specs/skeletons/
  README.md
  flavours/
    symfony-react/
    laravel-inertia/
    nextjs-fullstack/
    node-api-react/
```

The first flavour can be based on the reviewed web application stack from the feedback, but it must be presented as one flavour, not as framework core.

### Test Quality Gate

The testing capability already covers useful principles, but it should make test quality more verifiable for AI-generated tests.

Add checks such as:

- A test should fail if the protected behaviour is removed.
- A test should assert an observable decision, not only that code does not throw.
- A test should not duplicate implementation logic line by line.
- Fixtures should be small and named in domain language.
- Mocks should be limited to external boundaries or uncontrollable effects.
- Mutation testing is recommended for critical code, but not required as a universal gate.

### PR Review Mining

Senior PR comments contain reusable implementation knowledge. A future `pr-review-miner` skill could turn repeated review feedback into proposed `specs/rules/` and `specs/language/` entries.

Proposed flow:

1. Fetch PR comments with `gh`.
2. Group comments by architecture, naming, testing, domain, frontend, security, and simplicity.
3. Detect repeated guidance.
4. Propose rule or language entries with evidence and frequency.
5. Require human review before consolidating.

### Orchestration And Subagents

The framework should document orchestration as an optional capability because long single-threaded agent sessions tend to skip steps under context pressure.

Recommended specialist roles:

- `explore-agent`: read-only repository investigation.
- `spec-agent`: behaviour specs and drift.
- `rules-agent`: implementation patterns and `specs/rules/` drift.
- `language-agent`: domain terminology extraction.
- `test-agent`: test quality and coverage gaps.
- `review-agent`: final diff review.
- `frontend-agent`: UI artefacts and design-system alignment.

The core should stay tool-agnostic. Tool-specific adapters can be generated when a platform supports subagents or deterministic chains.

## Proposed Capabilities And Skills

| Capability or skill | Purpose | Main inputs | Outputs |
|---|---|---|---|
| `rules` | Project implementation rules | Diff, similar code, ADRs, PR feedback | `specs/rules/` |
| `extract-rules` | Propose reusable coding conventions | Diff and evidence | Reviewed rule proposals |
| `domain-language` | Domain glossary and invariants | Specs, code, tests, docs | `specs/language/` |
| `extract-language` | Propose concept definitions | Domain evidence | Reviewed language entries |
| `walking-skeleton` | Bootstrap new projects | Skeleton ADR flavour | Runnable baseline and completed tasks |
| `test-quality-review` | Review AI-generated tests | Diff and test suite | Findings and test improvements |
| `pr-review-miner` | Mine senior review comments | GitHub PR comments | Rule and language proposals |
| `orchestration` | Route work through specialist agents | Task lifecycle | Tool-specific subagent configs or docs |

## ADR Candidates

1. Adopt routable framework entrypoints.
2. Add project implementation rules as first-class specs.
3. Add ubiquitous language specs.
4. Organise feature specs by bounded context for large projects.
5. Add a walking skeleton workflow for new projects.
6. Split framework core from skeleton flavours.
7. Add AI-generated test quality gates.
8. Mine PR review comments into reusable rules.
9. Support subagent orchestration as an optional capability.

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| Too many artefacts | Make new artefacts optional capabilities with clear routing. |
| Inferred rules become wrong project law | Require status labels, evidence, and human review. |
| `specs/features/` loses focus | Keep features limited to observable behaviour. |
| Walking skeleton becomes too opinionated | Split framework core from selectable skeleton flavours. |
| Agents over-document trivial details | Define creation criteria for rules and language entries. |
| Context grows again | Prefer routing tables, capability docs, and nested instructions over always-loaded detail. |

## Recommended Roadmap

### Iteration 1

Add routing to generated `AGENTS.md`, create starter `specs/rules/` and `specs/language/`, and update the feature README for bounded-context organisation.

### Iteration 2

Build manual `extract-rules` and `extract-language` skills. Test them in existing projects before integrating them into completion flows.

### Iteration 3

Build `walking-skeleton` and the first skeleton flavour. Measure how much human correction is needed and document common generation failures.

### Iteration 4

Add PR review mining and optional orchestration/subagent support.

## Success Criteria

The framework is improving if it reduces these recurring failures:

- Agents generate working code that does not follow project structure.
- Senior engineers repeat the same PR comments without those lessons becoming reusable.
- New projects start from an unstructured blank page.
- `FRAMEWORK.md` becomes too large to be useful.
- `specs/features/` becomes a flat, hard-to-navigate folder.
- Domain knowledge exists only in heads, PRs, meetings, or scattered comments.

## Source Material

This synthesis consolidates three temporary root-level notes that were removed after this document became the durable source:

- `ai-framework-meeting-notes.md`
- `ai-framework-feedback.md`
- `ai-framework-analysis-actionables.md`

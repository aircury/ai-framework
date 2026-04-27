# Aircury AI Framework

[![npm](https://img.shields.io/npm/v/@aircury/ai-framework)](https://www.npmjs.com/package/@aircury/ai-framework)

The Aircury AI Framework is a meta-framework for AI-assisted software engineering. It defines how AI agents should think, plan, and deliver code across all Aircury projects while separating a shared workflow constitution from optional engineering standards modules.

For most tasks, no workflow framework is needed at all. If a change is well-understood and clearly scoped, `plan-build` — the default mode — is sufficient: describe the task, let the agent plan and implement it. Adding structured workflows to a simple, clear task is overkill.

The frameworks exist for when they are genuinely needed. Three open-source tools inform this layer:

- **[OpenSpec](https://github.com/Fission-AI/OpenSpec/)** — a lightweight spec-driven development workflow built around a fast propose → apply → complete cycle.
- **[Spec Kit](https://github.com/github/spec-kit)** — a formal specification toolkit with structured steps for requirement writing, clarification, planning, and consistency analysis.
- **[Airsync](https://github.com/aircury/airsync)** — a collaborative memory system for AI agents and teams with a three-layer knowledge lifecycle (INBOX → PUBLISHED → ARCHIVED) that ensures only vetted, high-quality knowledge reaches the shared team memory.

Note that the specs themselves — the living `specs/features/` records of system behavior — are independent of these frameworks. They accumulate regardless of which workflow mode produced them, and serve as the canonical source of truth whether the task went through `plan-build`, `open-spec`, or `spec-kit`.

---

## Why combine them?

OpenSpec and Spec Kit solve different problems and operate at different levels of formality.

**OpenSpec** is optimised for speed and momentum. Its `propose → apply → complete` cycle lets a developer move from idea to implementation quickly, with just enough structure to stay aligned. It is the right tool when the problem is understood and the team needs to ship.

**Spec Kit** is optimised for correctness before commitment. Its `specify → clarify → plan → analyse → tasks → implement` pipeline front-loads requirement quality and cross-artifact consistency. It prevents the expensive class of bugs that come from building the wrong thing — especially in features that cross bounded contexts or involve formal acceptance criteria.

Used alone, each framework has a gap:

- OpenSpec can move too fast when the problem is still ambiguous, leading to re-work.
- Spec Kit can feel heavy for routine changes where the solution is already clear.

**The Aircury meta-framework routes between them** based on the complexity and ambiguity of the task. A well-understood fix goes straight to OpenSpec. A new cross-cutting feature goes through Spec Kit. The agent analyses the request, recommends a path, and asks before acting.

---

## What this framework adds

Beyond routing, this framework provides two layers:

- **Core workflow constitution** — meta-agent routing, living specs, and the rule that all workflow modes converge on `specs/features/`.
- **Installable standards modules** — optional rulesets that teams can enable or disable during installation.

The default profile enables:

- **Architecture Decision Records (ADRs)** — agents persist material architectural and workflow decisions in `specs/decisions/` to reduce intention debt.
- **Hexagonal Architecture** — every external dependency sits behind a port. Framework code is an adapter, never the core.
- **Domain-Driven Design** — aggregates, value objects, entities, and domain events modeled around business behavior, not tables or screens.
- **Testing** — includes TDD by default, with frontend defaults for Vitest, Testing Library, and Playwright, and backend expectations for unit and integration coverage.
- **Token Efficiency** — keeps project sessions terse by default and pairs the generated rules with the `caveman` skill.

This keeps the framework opinionated by default without forcing every team to adopt the same architectural or testing standards forever.

The result is an agent that knows not just *how* to work, but *what to protect* while doing so.

---

## Installation

Run the installer from any project directory. The global mode installs skills globally for supported agents; the local mode installs repository files plus project-scoped skills:

```bash
bunx @aircury/ai-framework
# or
npx @aircury/ai-framework
```

The interactive TUI will ask:

1. **Scope** — `Local` to install project files and project-scoped skills, `Global` to install skills globally for `universal` plus any selected agent-specific integrations.
2. **AI tools** — select the tool-specific integrations you want. In global mode these are optional extra agent targets on top of `universal`.
3. **Local installation profile** — for local installs, choose between the full framework or `Spec extraction only` for a minimal reverse-engineering setup.
4. **Standards modules** — for the full local profile, choose which optional standards this project should enforce.
5. **Skill groups** — choose which grouped workflows to install through `npx skills add`.

For local installs, the installer writes all required configuration files, starter spec folders, and agent instructions to the project root. Global installs do not write framework files; they only install the selected skills through the standard `npx skills add ... -g` flow so they remain tracked by the skills ecosystem and can be updated later with `npx skills update`. Skill installation is driven by a static catalog in `src/skills-catalog.ts`, so Aircury and curated external skills can be selected through the same interactive flow. If local files already exist you can choose to skip them or overwrite them.

### What gets installed

| Scope | Installed outputs |
|-------|-------------------|
| Local | `FRAMEWORK.md`, `AGENTS.md`, `.aircury/framework.config.json`, `specs/features/README.md`, optional `specs/decisions/README.md`, plus selected tool-specific files; skills installed via `npx skills` |
| Global | Skills installed globally via `npx skills add ... -g` for `universal` plus any selected agent-specific integrations |

For legacy reverse-engineering work, the local `Spec extraction only` profile keeps the install intentionally small: no optional standards modules, no extra tool files by default, the `specs` skill group preselected, and an installable project-local orchestrator at `.aircury/bin/legacy-spec-orchestrator.mjs`.

### Standards modules

Local installs persist the selected modules in `.aircury/framework.config.json`.
Each module is a small content package with machine-readable metadata plus document fragments, and the final `FRAMEWORK.md` / `AGENTS.md` files are rendered from dedicated templates.

The context hierarchy is intentional:

- `AGENTS.md` is the short session bootstrap checklist.
- `FRAMEWORK.md` contains the governing workflow and standards rules.
- `specs/features/` is the canonical source of behavioral truth.
- `specs/decisions/` records governing architectural intent.
- `specs/ui/` holds frontend design-system references when the frontend module is enabled.
- Skills are execution helpers, not the source of truth.

Current built-in modules:

- `decision-records`
- `testing`
- `hexagonal-architecture`
- `ddd`
- `token-efficiency`

The installer and template generation are registry-driven, so adding a new standards module only requires:

- adding its manifest and content fragments under `standards/modules/<module-id>/`
- wiring it into the registry
- letting the renderer compose it through the shared templates

---

## Skill groups

The installer exposes grouped skill bundles and expands them into concrete `npx skills add <source> --skill ...` commands at install time.

| Group | Skills | Source |
|-------|--------|--------|
| `open-spec` | `propose`, `apply`, `complete`, `explore` | `aircury/ai-framework` |
| `spec-kit` | `specify`, `clarify`, `plan`, `analyse`, `tasks`, `implement`, `checklist` | `aircury/ai-framework` |
| `airsync` | `airsync` | `aircury/ai-framework` |
| `git` | `commit-changes` | `aircury/ai-framework` |
| `testing` | `e2e-testing-patterns`, `playwright-best-practices` | mixed external sources |
| `architecture` | `clean-ddd-hexagonal` | `https://github.com/ccheney/robust-skills` |
| `specs` | `specs-extractor`, `specs-interpreter` | `aircury/ai-framework` |
| `token-efficiency` | `caveman` | `https://github.com/juliusbrussee/caveman` |

All skills write ephemeral working artifacts to `specs/changes/<name>/` and sync canonical output to `specs/features/` on completion.

The default local and global skill selections include the `specs` group, so fresh installs also add `specs-extractor` and `specs-interpreter` unless the user explicitly deselects them.

Curated external skills can be added to the static catalog and will appear in the same multiselect UI alongside the built-in Aircury groups.

When the local `token-efficiency` standards module is enabled, the installer also preselects the `token-efficiency` skill group and adds project rules that make `caveman` available without enabling it automatically. To activate terse mode for the current session, the user can explicitly say `caveman full`. This is intentionally project-scoped: it uses generated agent instruction files plus the `caveman` skill, and does not install any global shell hooks.

---

## Supported workflow modes

| Mode | When to use | Skills |
|------|-------------|--------|
| `plan-build` | Easy to medium changes — the default for most tasks | None |
| `propose-apply-complete` | Complex or cross-cutting change | `open-spec-propose`, `open-spec-apply`, `open-spec-complete` |
| `explore-propose-apply-complete` | Unclear problem requiring investigation first | `open-spec-explore`, then `open-spec-propose`, `open-spec-apply`, `open-spec-complete` |
| `spec-kit` | New feature, formal requirements, or spec governance needed | `spec-kit-specify`, `spec-kit-clarify`, `spec-kit-plan`, `spec-kit-analyse`, `spec-kit-tasks`, `spec-kit-implement`, `spec-kit-checklist` |

For most day-to-day work, `plan-build` is sufficient. Reach for `open-spec` or `spec-kit` when the problem size or ambiguity warrants the extra structure.

The agent recommends a mode and asks before starting. The user always decides.

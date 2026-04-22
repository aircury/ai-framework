# Aircury AI Framework

[![npm](https://img.shields.io/npm/v/@aircury/ai-framework)](https://www.npmjs.com/package/@aircury/ai-framework)

The Aircury AI Framework is a meta-framework for AI-assisted software engineering. It defines how AI agents should think, plan, and deliver code across all Aircury projects while separating a shared workflow constitution from installable capabilities.

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
- **Installable capabilities** — selectable bundles that can add project rules, starter files, and installable skills.

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

Run the installer from any project directory (or your home directory for a global setup):

```bash
bunx @aircury/ai-framework
# or
npx @aircury/ai-framework
```

The interactive TUI will ask:

1. **Scope** — `Local` to configure the current project, `Global` to configure your machine.
2. **AI tools** — select the tool-specific integrations you want.
3. **Language preference** — for local installs, optionally enforce British English and include the language capability.
4. **Capabilities** — choose the workflows and standards this installation should include.

The installer writes all required configuration files, starter spec folders, and agent instructions to the right locations for each tool. Skills are installed through the standard `npx skills add ...` flow so they remain tracked by the skills ecosystem and can be updated later with `npx skills update`. Capability installation is driven by a single catalog in `src/capabilities.ts`, so project rules and installable skills are selected through the same flow. If files already exist you can choose to skip them or overwrite them.

### What gets installed

| Scope | Installed outputs |
|-------|-------------------|
| Local | `FRAMEWORK.md`, `AGENTS.md`, `.aircury/framework.config.json`, `specs/features/README.md`, optional `specs/decisions/README.md`, plus selected tool-specific files; skills installed via `npx skills` |
| Global | Skills installed via `npx skills` for the selected agents |

### Capabilities

Local installs persist the selected capabilities in `.aircury/framework.config.json`.
Each capability can contribute machine-readable metadata, framework and agent content, starter files, and installable skills. The final `FRAMEWORK.md` and `AGENTS.md` files are rendered from dedicated templates.

Representative built-in capabilities:

- `open-spec`
- `spec-kit`
- `airsync`
- `git`
- `decision-records`
- `testing`
- `hexagonal-architecture`
- `ddd`
- `frontend`
- `token-efficiency`
- `resilience`

The installer and template generation are registry-driven, so adding a new capability only requires:

- defining it in `src/capabilities.ts`
- adding any content fragments and starter files it needs
- letting the renderer and installer compose it through the shared plan

---

## Capability Model

Each capability can do one or more of the following:

- add sections to `FRAMEWORK.md`
- add rules to `AGENTS.md`
- create starter files such as `specs/ui/README.md`
- install one or more skills through `npx skills add <source> --skill ...`

Examples:

- `frontend` adds frontend-specific rules, writes `specs/ui/README.md`, and installs `frontend-layout-extractor`, `frontend-experience-extractor`, and `frontend-ui-generator`.
- `token-efficiency` adds terse-response rules and installs `caveman`.
- `architecture` installs `clean-ddd-hexagonal` from `https://github.com/ccheney/robust-skills`.
- `specs` installs `specs-extractor` and `specs-interpreter` from `aircury/ai-framework`.
- `open-spec` and `spec-kit` are workflow capabilities that mainly install skills rather than change project files directly.

All skills write ephemeral working artifacts to `specs/changes/<name>/` and sync canonical output to `specs/features/` on completion.

The default local and global capability selections include `specs`, so fresh installs also add `specs-extractor` and `specs-interpreter` unless the user explicitly deselects that capability.

Curated external skills can be added to the capability catalog and will appear in the same multiselect flow alongside built-in Aircury capabilities.

When the local `token-efficiency` capability is enabled, the installer also adds project rules that start each new session in `caveman full` while keeping responses terse by default. This is intentionally project-scoped: it uses generated agent instruction files plus the `caveman` skill, and does not install any global shell hooks.
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

# Aircury AI Framework

[![npm](https://img.shields.io/npm/v/@aircury/ai-framework)](https://www.npmjs.com/package/@aircury/ai-framework)

The Aircury AI Framework is a meta-framework for AI-assisted software engineering. It defines how AI agents should think, plan, and deliver code across all Aircury projects while separating a shared workflow constitution from optional engineering standards modules.

For most tasks, no workflow framework is needed at all. If a change is well-understood and clearly scoped, `plan-build` — the default mode — is sufficient: describe the task, let the agent plan and implement it. Adding structured workflows to a simple, clear task is overkill.

The frameworks exist for when they are genuinely needed. Two open-source tools inform this layer:

- **[OpenSpec](https://github.com/Fission-AI/OpenSpec/)** — a lightweight spec-driven development workflow built around a fast propose → apply → complete cycle.
- **[Spec Kit](https://github.com/github/spec-kit)** — a formal specification toolkit with structured steps for requirement writing, clarification, planning, and consistency analysis.

Note that the specs themselves — the living `specs/features/` records of system behavior — are independent of these frameworks. They accumulate regardless of which workflow mode produced them, and serve as the canonical source of truth whether the task went through `plan-build`, `open-spec`, or `spec-kit`.

---

## Why combine them?

OpenSpec and Spec Kit solve different problems and operate at different levels of formality.

**OpenSpec** is optimized for speed and momentum. Its `propose → apply → complete` cycle lets a developer move from idea to implementation quickly, with just enough structure to stay aligned. It is the right tool when the problem is understood and the team needs to ship.

**Spec Kit** is optimized for correctness before commitment. Its `specify → clarify → plan → analyze → tasks → implement` pipeline front-loads requirement quality and cross-artifact consistency. It prevents the expensive class of bugs that come from building the wrong thing — especially in features that cross bounded contexts or involve formal acceptance criteria.

Used alone, each framework has a gap:

- OpenSpec can move too fast when the problem is still ambiguous, leading to re-work.
- Spec Kit can feel heavy for routine changes where the solution is already clear.

**The Aircury meta-framework routes between them** based on the complexity and ambiguity of the task. A well-understood fix goes straight to OpenSpec. A new cross-cutting feature goes through Spec Kit. The agent analyzes the request, recommends a path, and asks before acting.

---

## What this framework adds

Beyond routing, this framework provides two layers:

- **Core workflow constitution** — meta-agent routing, living specs, and the rule that all workflow modes converge on `specs/features/`.
- **Installable standards modules** — optional rulesets that teams can enable or disable during installation.

The default profile enables:

- **Architecture Decision Records (ADRs)** — agents persist material architectural and workflow decisions in `specs/decisions/` to reduce intention debt.
- **Hexagonal Architecture** — every external dependency sits behind a port. Framework code is an adapter, never the core.
- **Domain-Driven Design** — aggregates, value objects, entities, and domain events modeled around business behavior, not tables or screens.
- **Test-Driven Development** — failing test before implementation.

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
3. **Standards modules** — for local installs, choose which optional standards this project should enforce.

The installer writes all required configuration files, starter spec folders, and agent instructions to the right locations for each tool. Skills are installed through the standard `npx skills add ...` flow so they remain tracked by the skills ecosystem and can be updated later with `npx skills update`. If files already exist you can choose to skip them or overwrite them.

### What gets installed

| Scope | Installed outputs |
|-------|-------------------|
| Local | `FRAMEWORK.md`, `AGENTS.md`, `.aircury/framework.config.json`, `specs/features/README.md`, optional `specs/decisions/README.md`, plus selected tool-specific files; skills installed via `npx skills` |
| Global | Skills installed via `npx skills` for the selected agents |

### Standards modules

Local installs persist the selected modules in `.aircury/framework.config.json`.
Each module is a small content package with machine-readable metadata plus document fragments, and the final `FRAMEWORK.md` / `AGENTS.md` files are rendered from dedicated templates.

Current built-in modules:

- `decision-records`
- `tdd`
- `hexagonal-architecture`
- `ddd`

The installer and template generation are registry-driven, so adding a new standards module only requires:

- adding its manifest and content fragments under `standards/modules/<module-id>/`
- wiring it into the registry
- letting the renderer compose it through the shared templates

---

## Skill groups

| Group | Skills | Source |
|-------|--------|--------|
| `open-spec` | `propose`, `apply`, `complete`, `explore` | OpenSpec |
| `spec-kit` | `specify`, `clarify`, `plan`, `analyze`, `tasks`, `implement`, `checklist` | Spec Kit |

All skills write ephemeral working artifacts to `specs/changes/<name>/` and sync canonical output to `specs/features/` on completion.

---

## Supported workflow modes

| Mode | When to use | Skills |
|------|-------------|--------|
| `plan-build` | Easy to medium changes — the default for most tasks | None |
| `propose-apply-complete` | Complex or cross-cutting change | `open-spec-propose`, `open-spec-apply`, `open-spec-complete` |
| `explore-propose-apply-complete` | Unclear problem requiring investigation first | `open-spec-explore`, then `open-spec-propose`, `open-spec-apply`, `open-spec-complete` |
| `spec-kit` | New feature, formal requirements, or spec governance needed | `spec-kit-specify`, `spec-kit-clarify`, `spec-kit-plan`, `spec-kit-analyze`, `spec-kit-tasks`, `spec-kit-implement`, `spec-kit-checklist` |

For most day-to-day work, `plan-build` is sufficient. Reach for `open-spec` or `spec-kit` when the problem size or ambiguity warrants the extra structure.

The agent recommends a mode and asks before starting. The user always decides.

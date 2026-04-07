# Aircury AI Framework

The Aircury AI Framework is a meta-framework for AI-assisted software engineering. It defines how AI agents should think, plan, and deliver code across all Aircury projects — enforcing architectural discipline, domain modeling standards, and a spec-driven delivery culture regardless of the workflow a team chooses.

It is inspired by two open-source frameworks:

- **[OpenSpec](https://github.com/Fission-AI/OpenSpec/)** — a lightweight spec-driven development workflow built around a fast propose → apply → complete cycle.
- **[Spec Kit](https://github.com/github/spec-kit)** — a formal specification toolkit with structured steps for requirement writing, clarification, planning, and consistency analysis.

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

Beyond routing, this framework layers in non-negotiable engineering standards that neither OpenSpec nor Spec Kit prescribe:

- **Hexagonal Architecture** — every external dependency sits behind a port. Framework code is an adapter, never the core.
- **Domain-Driven Design** — aggregates, value objects, entities, and domain events modeled around business behavior, not tables or screens.
- **Test-Driven Development** — failing test before implementation, always.
- **Living specifications** — `specs/features/` is the canonical, versioned record of system behavior. Every workflow mode — OpenSpec, Spec Kit, or direct TDD — converges on it.
- **FRAMEWORK.md as the project constitution** — governing principles are defined once and inherited by all projects, so Spec Kit's constitution step is already satisfied from day one.

The result is an agent that knows not just *how* to work, but *what to protect* while doing so.

---

## Using with Claude Code

This framework follows the emerging `.agents` / `AGENTS.md` convention. Claude Code uses different names for the same concepts:

| Standard convention | Claude Code equivalent |
|---------------------|------------------------|
| `AGENTS.md`         | `CLAUDE.md`            |
| `.agents/`          | `.claude/`             |

To configure a project for Claude Code, copy or symlink the files accordingly:

```bash
# Project root instructions
cp AGENTS.md CLAUDE.md          # or: ln -s AGENTS.md CLAUDE.md

# Skills directory
cp -r .agents/ .claude/         # or: ln -s .agents .claude
```

Everything else — workflow modes, skill groups, routing logic — works identically. The only difference is the file and directory names Claude Code looks for.

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
| `propose-apply-complete` | Complex or cross-cutting change | `open-spec/*` |
| `explore-propose-apply-complete` | Unclear problem requiring investigation first | `open-spec/explore`, then `open-spec/*` |
| `spec-kit` | New feature, formal requirements, or spec governance needed | `spec-kit/*` |

For most day-to-day work, `plan-build` is sufficient. Reach for `open-spec` or `spec-kit` when the problem size or ambiguity warrants the extra structure.

The agent recommends a mode and asks before starting. The user always decides.

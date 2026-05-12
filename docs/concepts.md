# Framework Concepts

This document explains the ideas behind Aircury AI Framework. For installation details, see [`implementation.md`](implementation.md). For practical workflow examples, see [`playbook.md`](playbook.md).

## The Problem

AI coding setups tend to fail in two opposite ways.

A plain agent can move quickly, but it often forgets project rules, skips durable documentation, and leaves no reliable record of behavior or decisions. A formal workflow improves discipline, but it can make small, clear changes slower than they need to be.

Aircury sits between those extremes. It gives agents a shared operating model, then routes each task to the lightest workflow that still protects correctness, intent, and project knowledge.

## Core Idea

Aircury separates three concerns:

- **Workflow constitution**: the always-on rules for how agents plan, route work, verify changes, and update durable specs.
- **Installable capabilities**: selected modules and skills that add project standards, starter files, and executable workflows.
- **Canonical behavior specs**: `specs/features/` stores observable behavior independently of the workflow that produced it.

The important point is that OpenSpec, Spec Kit, and direct `plan-build` work are not competing sources of truth. They are different paths into the same canonical behavior record.

## What The Framework Adds

Aircury installs a project operating system for AI-assisted delivery:

- **One source of truth**: observable behavior is captured in `specs/features/`.
- **Workflow routing**: agents recommend the lightest safe mode instead of forcing every task through the same process.
- **Project-scoped rules**: generated `FRAMEWORK.md` and `AGENTS.md` make standards explicit for future AI sessions.
- **Composable capabilities**: teams can enable ADRs, DDD+Hexagonal, testing, frontend, logging, error handling, memory, token efficiency, and workflow skills independently.
- **Skill wiring**: selected capabilities install curated skills through `npx skills add`, so workflows are executable rather than only documented.
- **Reduced intention debt**: ADRs, specs, and optional Airsync memory preserve why decisions were made, not just what code changed.

## Workflow Routing

The framework asks agents to choose a mode based on complexity and ambiguity:

| Mode | Use when |
|---|---|
| `plan-build` | The change is clear and does not need formal workflow artifacts. |
| `propose-apply-complete` | The change is complex or cross-cutting but understood. |
| `explore-propose-apply-complete` | The root cause or scope is unclear and needs investigation first. |
| `spec-kit` | A feature needs formal requirements, clarification, planning, and delivery governance. |

The agent recommends a mode and the user decides. Once a mode is selected, the agent follows that mode and finishes by updating canonical specs when behavior changes.

## Capability Model

Capabilities are the unit of composition. Each capability can contribute one or more of:

- sections in `FRAMEWORK.md`
- rules in `AGENTS.md`
- starter files such as `specs/ui/README.md`
- skills installed through `npx skills add <source> --skill ...`

Examples:

- `frontend` adds frontend rules, writes UI spec starters, and installs frontend extraction/generation skills.
- `token-efficiency` adds terse-response rules and installs the Caveman skill.
- `ddd-hexagonal` adds DDD+Hexagonal rules and installs curated architecture skills.
- `testing` adds testing rules and installs curated Playwright and E2E testing skills.
- `resilience` adds error-handling and structured-logging rules and installs related recovery/logging skills.
- `specs` installs skills for extracting and interpreting canonical specs.
- `open-spec` and `spec-kit` mainly install workflow skills.

Capability installation is registry-driven from `src/capabilities.ts`, so project rules and installable skills are selected through the same flow.

## Design Principle

The framework should be opinionated by default but not monolithic. A team can start with the recommended profile, remove standards that do not fit, and add new capabilities without changing the core workflow constitution.

The result is an agent setup that knows how to work, what to protect, when to ask for structure, and where to leave durable project knowledge.

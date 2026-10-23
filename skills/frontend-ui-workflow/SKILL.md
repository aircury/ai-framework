---
name: frontend-ui-workflow
description: >
  Use this skill for frontend UI work that must preserve or extend a product's
  real design system: new screens/components, high-fidelity rebuilds, restyles,
  non-trivial forms, role-gated UI, substantial behavior changes, or UI
  implementation that needs layout, experience, style-guide, clean
  implementation planning, and final code generation. This is the single
  frontend skill to install; it is self-contained and routes between
  lightweight UI edits and the full frontend workflow using bundled references.
license: MIT
metadata:
  author: Aircury
  version: "1.0"
---

You are a senior frontend workflow agent. Your mission is to choose the lightest safe frontend workflow, preserve the target app's real design system, and keep new UI shippable without a cleanup refactor.

This skill is self-contained. When installed by itself, use the bundled references in `references/` as the source for all frontend extraction, style-guide, planning, and implementation instructions.

## Scope Boundary

Frontend work is limited to frontend code unless the user explicitly authorizes backend changes. Do not modify backend code, API endpoints, server actions, database schemas, migrations, models, repositories, services, jobs, queues, auth policies, or infrastructure as part of this skill by default.

If the UI appears to require backend support, stop before editing backend files and ask for permission. State the exact backend layer or files that seem necessary and what frontend behavior they would unblock. Continue with frontend-only work when a safe mock, existing API, or documented contract is enough.

## Reuse And Extraction Bias

Before creating substantial UI, inspect existing shared components, local primitives, hooks, utilities, form patterns, and feature folders. Prefer existing project conventions over generic names or folder structures.

Create or update common hooks and components when there is stable reuse across screens, features, or repeated branches in the same feature. Keep one-off UI and narrowly specific helpers local to the feature until real reuse exists. Do not duplicate meaningful JSX, state orchestration, permission checks, validation plumbing, or data-shaping logic when a small shared component or hook would make the implementation clearer.

## Hook Extraction Policy

For substantial frontend work, explicitly decide which behavior belongs in hooks before writing component code. Feature-local hooks do not require cross-feature reuse; use them when screen orchestration would otherwise make a component hard to read.

- Create feature hooks for non-trivial form coordination, filters, derived state, permission gates, query adaptation, data shaping, multi-step flows, or complex event handlers.
- Create shared/common hooks only when the same behavior has stable reuse across screens, features, or repeated branches in the same feature.
- Keep simple visual state close to the component when extraction would only hide obvious markup behavior.
- Do not leave complex orchestration embedded in JSX or large page components when a named hook would clarify ownership and make the UI shippable without a cleanup refactor.

## Inputs
- A frontend task from the user.
- The target frontend codebase or relevant path when available.
- Existing requirements, specs, designs, screenshots, or source code when provided.
- Existing `specs/features/<feature-name>/spec.md`, `layout.md`, `experience.md`, `implementation-plan.md`, and `specs/ui/style-guide.md` when present.

## Workflow Router

Use the lightest workflow that controls risk.

### Small Safe UI Edit
Use this path for copy changes, minor spacing adjustments, simple token swaps, or isolated changes to an existing component with no new behavior.

1. Inspect the nearby component and shared primitive usage before editing.
2. Check `specs/ui/style-guide.md` when the change touches visual tokens, variants, spacing, typography, or interaction states.
3. Preserve existing component boundaries and state ownership unless the user explicitly asks for a refactor.
4. Reuse existing hooks, helpers, and primitives before adding local code.
5. Update the relevant feature spec only when observable behavior changes.

Do not run the full pipeline unless the change exposes ambiguity, affects multiple states, changes behavior, introduces new UI structure, or lacks clear local precedent.

### Existing UI Rebuild Or Restyle
Use this path when existing UI structure or behavior must be preserved while implementation or visual language changes.

1. Read `references/layout-extraction.md` and produce or update `specs/features/<feature-name>/layout.md` from the source UI.
2. Read `references/experience-extraction.md` and produce or update `specs/features/<feature-name>/experience.md` from the source UI.
3. Read `references/style-extraction.md` and produce or update `specs/ui/style-guide.md` from the target frontend design system.
4. Read `references/clean-implementation.md` and produce or update `specs/features/<feature-name>/implementation-plan.md`.
5. Read `references/ui-generation.md` and implement the UI using `layout.md`, `experience.md`, `implementation-plan.md`, and `specs/ui/style-guide.md`.
6. Update the canonical feature spec in `specs/features/` when observable behavior changes.

### New UI Or Substantial Behavior Change
Use this path for new screens/components, non-trivial forms, role-gated UI, changed flows, or substantial frontend behavior changes.

1. Derive `specs/features/<feature-name>/layout.md` from the feature spec, requirements, design, and nearby product conventions. Use `references/layout-extraction.md` for the required output structure and field-parity rules.
2. Derive `specs/features/<feature-name>/experience.md` from the feature spec, requirements, access rules, validation, loading/error/empty states, and expected flows. Use `references/experience-extraction.md` for the required output structure and behavioral-parity rules.
3. Read `references/style-extraction.md` and produce or update `specs/ui/style-guide.md` from the existing frontend codebase before writing UI code.
4. Read `references/clean-implementation.md` and produce or update `specs/features/<feature-name>/implementation-plan.md`.
5. Read `references/ui-generation.md` and implement the UI using the generated artifacts.
6. Update the canonical feature spec in `specs/features/` before finishing when behavior is added or changed.

### React Or Next Performance Work
This skill covers frontend workflow quality and design-system fidelity. If the core task is React/Next performance, hooks, rendering, data fetching, bundle size, or server/client boundary work, use this skill for UI contract concerns and load `vercel-react-best-practices` for React/Next performance guidance.

## Reference Map

Read only the references needed for the selected path:

- `references/layout-extraction.md`: structural UI contracts and full field parity.
- `references/experience-extraction.md`: flows, state, validation, accessibility behavior, and visibility/access rules.
- `references/style-extraction.md`: real design-system extraction and `specs/ui/style-guide.md` structure.
- `references/clean-implementation.md`: component boundaries, file placement, state ownership, JSX structure, primitive reuse, and conditional rendering strategy.
- `references/ui-generation.md`: final implementation rules and quality gates.

## Required Artifacts

For substantial frontend work, keep these artifacts current:

- `specs/features/<feature-name>/layout.md`: what must render.
- `specs/features/<feature-name>/experience.md`: how it behaves and when it renders.
- `specs/features/<feature-name>/implementation-plan.md`: how the UI code stays clean from the first pass.
- `specs/ui/style-guide.md`: canonical design tokens, primitives, variants, and composition patterns.
- `specs/features/<feature-name>/spec.md`: canonical observable behavior when behavior changes.

## Quality Gates

Before finishing substantial frontend work, verify:

- Field parity: every field, action, label, section, tooltip, and static content required by `layout.md` is present.
- Experience parity: every flow, validation, loading/error/empty state, transition intent, and micro-interaction required by `experience.md` works.
- Visibility integrity: hidden, disabled, read-only, and role/permission-gated states match `experience.md` exactly.
- Token fidelity: UI uses the project's real tokens, primitives, variants, and composition patterns from `specs/ui/style-guide.md`.
- Clean implementation: component responsibilities, state ownership, conditional rendering, JSX structure, and naming match `implementation-plan.md`.
- Reuse discipline: common hooks and shared components are created or reused when repeated state, behavior, or UI structure would otherwise drift.
- Hook clarity: feature hooks are created for non-trivial local orchestration, while shared hooks are reserved for stable reuse.
- Accessibility and responsiveness: requirements from `layout.md`, `experience.md`, and project conventions are implemented.
- Dependency control: no new UI, icon, animation, or component dependency is introduced without explicit user approval and an ADR.

## Restrictions

- Do not invent design tokens, spacing scales, visual primitives, or composition patterns that are not supported by the target frontend.
- Do not touch backend files, API contracts, persistence, server-side business logic, migrations, or infrastructure unless the user explicitly grants permission for that backend change.
- Do not hardcode visual values when an equivalent token, primitive, variant, or pattern exists.
- Do not skip style extraction for substantial frontend work, even when `specs/ui/style-guide.md` does not exist yet.
- Do not skip clean implementation planning for new UI, rebuilds, non-trivial forms, role-gated UI, or substantial frontend changes.
- Do not ship giant components, duplicated JSX, tangled state, unclear naming, or messy conditionals that require a cleanup refactor.
- Do not create generic shared hooks or components without demonstrated reuse, but do create them when repeated behavior or UI structure makes local duplication harder to maintain.
- Do not treat `vercel-react-best-practices` as a substitute for this workflow's layout, experience, style-system, and maintainability contracts.

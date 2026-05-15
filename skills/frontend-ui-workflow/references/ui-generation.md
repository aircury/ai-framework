# UI Generation Reference

Use this reference when writing final frontend code for substantial UI work.

## Goal

Build a high-fidelity UI that follows `layout.md`, `experience.md`, `implementation-plan.md`, and `specs/ui/style-guide.md` while respecting the target project's existing visual design system and implementation patterns.

## Inputs

- `specs/features/<feature-name>/layout.md`: structural source of truth.
- `specs/features/<feature-name>/experience.md`: behavioral and UX source of truth.
- `specs/features/<feature-name>/implementation-plan.md`: component boundaries, file organization, state ownership, JSX structure, primitive reuse, and conditional rendering strategy.
- `specs/ui/style-guide.md`: canonical design tokens, primitives, variants, and composition patterns.
- The target frontend codebase.

## Scope Boundary

Write frontend code only. Do not edit backend files, API endpoints, server actions, models, repositories, services, migrations, jobs, queues, auth policies, or infrastructure unless the user explicitly granted permission for that backend change. If backend support is required, ask for permission before touching those files and name the exact change needed.

## Workflow

1. Inspect the target frontend for existing implementation patterns before editing.
2. Verify the primitives, tokens, variants, hooks, and file paths referenced by the plan.
3. Map every hierarchy item and field from `layout.md` to rendered UI.
4. Implement the flows, validation, loading/error/empty states, visibility rules, and access gates from `experience.md`.
5. Follow `implementation-plan.md` for file placement, component responsibilities, state ownership, JSX structure, and local primitive reuse.
6. Use `specs/ui/style-guide.md` for visual fidelity; do not invent a parallel design system.
7. Update the canonical feature spec when observable behavior changes.

## Implementation Rules

- Reuse shared primitives and composition patterns before creating new UI elements.
- Reuse existing hooks and common components before adding feature-local code.
- Create feature hooks for non-trivial orchestration, form coordination, derived state, permission gates, filters, query adaptation, data shaping, multi-step flow state, or complex event handlers that would otherwise clutter render code.
- If `implementation-plan.md` names a feature hook, create or update that hook before wiring the presentational component so orchestration does not leak into JSX.
- Feature hooks do not require cross-feature reuse; shared/common hooks do.
- Create or update common hooks and shared components when repeated behavior or UI structure has stable reuse across screens or features.
- Keep one-off UI local to the feature when reuse is not demonstrated.
- Keep simple visual state in the component when a hook would only obscure obvious behavior.
- Use the project's established styling system, such as existing design tokens, CSS variables, Tailwind conventions, theme variants, shadcn/ui, Radix, MUI, or local primitives.
- Use hardcoded visual values only when the project has no equivalent token or observed convention, and document the gap if substantial.
- Implement all accessibility requirements from `layout.md`, `experience.md`, and project conventions.
- Ensure responsive behavior matches project conventions.
- Keep new UI shippable without a cleanup refactor unless requirements change.
- Do not introduce new libraries without permission and an ADR.

## Fidelity Requirements

- Full Field Parity: every field, action, label, option, tooltip, section, and static content from `layout.md` must be present.
- Experience Fidelity: every interaction, transition intent, loading/error/empty state, validation rule, and flow from `experience.md` must be functional.
- Visibility Fidelity: field-, section-, and action-level hidden, disabled, read-only, role-gated, owner-gated, tenant-gated, plan-gated, and feature-flagged rules must match `experience.md` exactly.
- Token Fidelity: visual implementation must reuse documented tokens, primitives, variants, and composition patterns from `specs/ui/style-guide.md`.
- Clean Implementation: final code must match `implementation-plan.md` and avoid giant components, duplicated JSX, tangled state, poor naming, and unclear conditional rendering.
- Reuse Fidelity: repeated logic and UI structure must be handled through appropriately local or shared hooks/components instead of copy-paste.
- Hook Clarity: non-trivial local orchestration must live in feature hooks, while common hooks are reserved for stable reuse.

## Final Verification

Before finishing, verify:

- All required artifacts exist or were intentionally not needed because the task used the small safe edit path.
- The implementation satisfies `layout.md`, `experience.md`, `implementation-plan.md`, and `specs/ui/style-guide.md`.
- No backend files were modified unless the user explicitly authorized backend work.
- Feature hooks, shared hooks, and component-local state match the hook extraction decisions in `implementation-plan.md`.
- Nearby tests, lint, typecheck, or build commands were run when feasible.
- Any skipped verification is reported with the reason.

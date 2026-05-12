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

## Final Verification

Before finishing, verify:

- All required artifacts exist or were intentionally not needed because the task used the small safe edit path.
- The implementation satisfies `layout.md`, `experience.md`, `implementation-plan.md`, and `specs/ui/style-guide.md`.
- Nearby tests, lint, typecheck, or build commands were run when feasible.
- Any skipped verification is reported with the reason.

## 1. Module Purpose

Activate this module when the project has an existing frontend or when a task creates, rebuilds, restyles, or substantially changes UI. Analyze the code before modifying the UI. Replicate and extend the UI with strict fidelity to the project's real design system.

Use `frontend-ui-workflow` as the single frontend skill. It is self-contained and includes bundled references for layout extraction, experience extraction, style extraction, clean implementation planning, and final UI generation.

## 2. Workflow Selection

Use the lightest workflow that controls risk.

| Task | Flow |
|---|---|
| Small safe UI edit | Inspect nearby code and `specs/ui/style-guide.md`; do not run the full pipeline unless ambiguity or risk appears |
| Existing UI rebuild or restyle | Use `frontend-ui-workflow` to extract layout and experience, update the style guide, plan clean implementation, and generate UI |
| New UI or substantial behavior change | Use `frontend-ui-workflow` to derive layout and experience from specs/requirements, update the style guide, plan clean implementation, and generate UI |
| React/Next performance, hooks, rendering, data fetching, bundle, or server/client boundary work | Load `vercel-react-best-practices` alongside `frontend-ui-workflow` when UI contracts are involved |

## 3. Required Frontend Artifacts

For new UI, rebuilds, non-trivial forms, role-gated UI, restyles, or substantial behavior changes, maintain these files:

- `specs/features/<feature-name>/layout.md`: structural source of truth for fields, labels, sections, actions, and static content.
- `specs/features/<feature-name>/experience.md`: behavioral source of truth for flows, micro-interactions, validation, loading/error/empty states, and visibility rules.
- `specs/features/<feature-name>/implementation-plan.md`: clean implementation source of truth for component responsibilities, file organization, state ownership, JSX structure, local primitive reuse, and conditional rendering strategy.
- `specs/ui/style-guide.md`: canonical source of truth for design tokens, reusable primitives, variants, states, responsive conventions, accessibility-related visual conventions, gaps, and strict reuse rules.

Small safe UI edits may skip the full artifact pipeline when nearby code and `specs/ui/style-guide.md` are sufficient.

## 4. Full Frontend Pipeline

Use `frontend-ui-workflow` for this pipeline. The skill decides which bundled references to read.

1. Produce or update `layout.md` to capture what must render with full field parity.
2. Produce or update `experience.md` to capture how the UI behaves and when fields, sections, and actions render, hide, disable, or become read-only.
3. Produce or update `specs/ui/style-guide.md` from the real frontend codebase before writing substantial UI code.
4. Produce or update `implementation-plan.md` before implementing substantial UI.
5. Implement the UI from `layout.md`, `experience.md`, `implementation-plan.md`, and `specs/ui/style-guide.md`.
6. Update the canonical feature spec in `specs/features/` when observable behavior changes.

For existing UI rebuilds, extract `layout.md` and `experience.md` from the source UI. For new UI, derive them from the feature spec, requirements, designs, and verified product conventions.

## 5. Style Guide Structure

`specs/ui/style-guide.md` must follow the detailed structure used by `frontend-ui-workflow`:

- Overview.
- Sources analysed.
- Design tokens.
- Semantic usage rules.
- Core UI primitives.
- Interaction states.
- Composition patterns.
- Responsive conventions.
- Accessibility-related visual conventions.
- Known gaps and inconsistencies.
- Strict reuse rules.

Mark a section as `[pending analysis]` if there is not enough data. Do not omit it, leave it empty, or invent values.

## 6. Implementation Rules

- Use tokens, primitives, variants, and composition patterns from `specs/ui/style-guide.md` before introducing new visual structures.
- Extend existing component libraries such as MUI, shadcn, Radix, or local primitives by following their project patterns. Do not rewrite them from scratch.
- Detect the correct reusable component path before creating shared UI files.
- Generate or update `implementation-plan.md` before creating substantial new UI components.
- Keep orchestration, presentational rendering, form state, and conditional branches separated when combining them would produce a giant component.
- Create new animations using the library already present in the project.
- Add an ADR before introducing a new UI dependency such as an animation, component, or icon library.

## 7. Quality Review Before Finish

Before finishing substantial frontend work, verify:

- Field parity with `layout.md`.
- Experience parity with `experience.md`.
- Hidden, disabled, read-only, role-gated, owner-gated, tenant-gated, plan-gated, and feature-flagged behavior.
- Design-token and primitive fidelity with `specs/ui/style-guide.md`.
- Component responsibility boundaries, state ownership, JSX structure, conditional rendering, and naming from `implementation-plan.md`.
- Accessibility and responsive behavior.
- Relevant tests, lint, typecheck, or build checks when feasible.

## 8. Absolute Restrictions

- Do not invent design tokens that do not exist in the project.
- Do not use hardcoded values where an equivalent token, primitive, variant, or observed convention exists.
- Do not skip style extraction for substantial frontend work, even when `specs/ui/style-guide.md` does not exist yet.
- Do not skip clean implementation planning for new UI, rebuilds, non-trivial forms, changed flows, role-gated UI, or substantial frontend changes.
- Do not ship first-pass frontend code that needs a cleanup refactor for component boundaries, duplicated JSX, tangled state, unclear naming, or hardcoded styling.
- Do not generate or modify substantial UI without updating the relevant frontend artifacts.
- Do not introduce UI dependencies without explicit approval and an ADR.
- Do not assume a composition pattern is correct without verifying it in the existing code.

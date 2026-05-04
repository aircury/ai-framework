# Frontend Workflow Reference

Use this reference when a frontend task is substantial enough that the short rules in `FRAMEWORK.md` are not enough.

## Required sequence

1. Run `frontend-layout-extractor` and save the result to `specs/features/<feature-name>/layout.md`.
2. Run `frontend-experience-extractor` and save the result to `specs/features/<feature-name>/experience.md`.
3. Generate or update `specs/ui/style-guide.md` from the analyzed frontend.
4. Run `frontend-ui-generator` using `layout.md`, `experience.md`, and the current style guide.
5. Update the canonical feature spec in `specs/features/` before finishing the task.

## Fidelity rules

- Match the existing product structure, behavior, and visual language before introducing new patterns.
- Prefer project tokens and existing component primitives over hardcoded values.
- Treat `layout.md` as the structural source of truth and `experience.md` as the behavioral source of truth.
- Extend the component libraries already used by the project instead of reimplementing them from scratch.
- Detect the correct shared UI folder before creating reusable components.

## Style guide expectations

Keep `specs/ui/style-guide.md` current. It should capture at least:

- colors and semantic usage
- typography levels and weights
- spacing scale and usage rules
- interaction states such as hover, focus, active, disabled, loading, and error
- project-specific visual conventions that do not fit the categories above

If analysis is incomplete, mark the missing section as `[pending analysis]` rather than inventing values.

## Component spec expectations

For each meaningful UI change, the corresponding feature spec should capture:

- API surface and props when relevant
- variants and visual differences
- functional and visual states
- tokens used from `specs/ui/style-guide.md`
- acceptance criteria covering visual behavior, functional behavior, and accessibility
- explicit out-of-scope notes when they prevent ambiguity

## Restrictions

- Do not skip extraction phases because the task appears small.
- Do not invent design tokens, spacing scales, or composition patterns that are not supported by the existing frontend.
- Do not use hardcoded values when an equivalent token or shared primitive already exists.
- Do not introduce a new UI dependency such as an icon, animation, or component library without an ADR.

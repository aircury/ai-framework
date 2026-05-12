# Clean Implementation Reference

Use this reference before substantial frontend code is written.

## Goal

Produce `specs/features/<feature-name>/implementation-plan.md` so new frontend work is shippable from the first implementation pass without a cleanup refactor unless requirements change.

This is a structure and maintainability step, not a visual design step and not a React performance step.

## Inputs

- `specs/features/<feature-name>/layout.md`: structural requirements and field parity.
- `specs/features/<feature-name>/experience.md`: behavior, flows, validation, state transitions, and visibility rules.
- `specs/ui/style-guide.md`: project tokens, reusable primitives, variants, and composition patterns.
- The target frontend codebase, including nearby features and shared UI folders.

## Output File

Save the result to `specs/features/<feature-name>/implementation-plan.md`. Create the directory if needed.

Use this structure:

```md
# Clean implementation plan — <feature name>

## Component Responsibilities
[Components to create or update, each with a single responsibility.]

## File Organisation
[Exact files/folders to use and why they match project conventions.]

## State Ownership
[Where server data, form state, local UI state, derived state, and transient state live.]

## Rendering Structure
[How JSX should be composed to avoid giant components and duplicated branches.]

## Form and Validation Structure
[Field grouping, validation ownership, error display, submission, and disabled/loading handling.]

## Reuse of Local Primitives
[Existing components, hooks, utilities, tokens, variants, and composition patterns to reuse.]

## Conditional Rendering Strategy
[Named booleans, extracted branches, empty/loading/error states, and role/visibility rules.]

## Anti-Cleanup Checklist
[Concrete checks the implementation must pass before completion.]
```

## Workflow

1. Inspect nearby screens, shared components, hooks, routes, forms, data-fetching code, and styling conventions before proposing files.
2. Prefer the project's current organization over a generic folder pattern.
3. Verify local primitives and import paths in the codebase; do not rely only on `style-guide.md`.
4. Keep orchestration concerns separate from presentational rendering when one component would otherwise mix data loading, form coordination, permissions, and layout markup.
5. Assign each state concern to one owner: server data, form state, local UI state, derived values, and transient interaction state.
6. Avoid duplicated source-of-truth state and effect-driven derived state.
7. Name complex conditions before rendering them.
8. Extract repeated JSX only when it improves readability or prevents drift.
9. Keep narrowly reusable helpers local to the feature until there is real cross-feature reuse.

## Anti-Cleanup Checklist Requirements

Include project-specific checks for:

- Component size and responsibility boundaries.
- Duplicated JSX and duplicated business rules.
- Clear conditional rendering.
- Clear state ownership.
- Form and validation readability.
- Local primitive reuse.
- Design-token fidelity.
- Accessibility and responsive behavior.

## Guardrails

- Do not produce code in this step. Produce the plan that governs implementation.
- Do not introduce new dependencies without explicit approval and an ADR.
- Do not split components merely to satisfy an arbitrary line count.
- Do not create over-abstracted generic components that hide simple feature-specific intent.
- Use React/Next performance guidance only when hooks, rendering, data-fetching, bundle, or server/client boundary patterns matter.

# Living Specifications

`specs/features/` stores the canonical, technology-agnostic description of observable system behaviour.

- Create one folder per capability.
- Keep `spec.md` focused on requirements and scenarios.
- Update these specs whenever observable behaviour changes.

## Frontend Feature Contract

For new UI, high-fidelity rebuilds, non-trivial forms, role-gated UI, or substantial frontend behaviour changes, use `frontend-ui-workflow` to keep feature-level frontend contracts beside the feature spec:

- `layout.md`: structural source of truth for fields, labels, sections, actions, and static content.
- `experience.md`: behavioral source of truth for flows, micro-interactions, validation, loading/error/empty states, and visibility rules.
- `implementation-plan.md`: clean implementation source of truth for component responsibilities, file organization, state ownership, JSX structure, local primitive reuse, and conditional rendering strategy.

These files complement `spec.md`. They do not replace the canonical behaviour spec.

Visual tokens, reusable primitives, and composition patterns live in `specs/ui/style-guide.md`.

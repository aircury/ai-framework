# Living Specifications

`specs/features/` stores the canonical, technology-agnostic description of observable system behaviour.

- Create one folder per capability.
- Keep `spec.md` focused on requirements and scenarios.
- Update these specs whenever observable behaviour changes.

## Frontend Design Documents

For new UI, high-fidelity rebuilds, non-trivial forms, role-gated UI, or substantial frontend behaviour changes, use `frontend-ui-workflow` to write the change's design documents under `specs/changes/<name>/`, beside the change's plan; they end with the change, and `specs/features/<feature-name>/spec.md` is the only feature-level document frontend work maintains:

- `layout.md`: what must render — fields, labels, sections, actions, and static content.
- `experience.md`: how it behaves and when it renders — flows, micro-interactions, validation, loading/error/empty states, and visibility rules.
- `implementation-plan.md`: the clean implementation plan for component responsibilities, file organization, state ownership, JSX structure, local primitive reuse, and conditional rendering strategy.

These files complement `spec.md`. They do not replace the canonical behaviour spec.

Existing feature-level `layout.md`, `experience.md` and `implementation-plan.md` files stay as history: the next change to that feature writes its own set under `specs/changes/<name>/`.

Visual tokens, reusable primitives, and composition patterns live in `specs/ui/style-guide.md`.

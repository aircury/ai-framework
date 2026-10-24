# Frontend Design System

`specs/ui/` stores the project's living style guide and UI design tokens. Use `frontend-ui-workflow` to keep these files aligned with the real frontend design system.

- `style-guide.md`: The canonical source of truth for design tokens and UI patterns.
- `DESIGN.md` and `design-system.md`: present only when the project adopts an external design system. That design system delivers and owns both files: `DESIGN.md` holds its brand and token rules, and `design-system.md` explains how to use the library. `DESIGN.md` takes precedence over conventions extracted from code.
- Update the style guide whenever new tokens or patterns are identified.

## Relationship To Feature Specs

Use `specs/ui/style-guide.md` for visual fidelity across the whole frontend.

A change's frontend documents live under `specs/changes/<name>/`, beside its plan, and end with the change:

- `layout.md`: what must render.
- `experience.md`: how it behaves and when it renders.
- `implementation-plan.md`: how the UI code should be structured cleanly from the first pass.

`specs/features/<feature-name>/spec.md` is the only feature-level document frontend work maintains.

New UI should reuse tokens, primitives, variants, and composition patterns from `style-guide.md` while satisfying the change's layout, experience, and implementation plan.

## Frontend Workflow

Use this module when a repository has an existing frontend and UI work must match the real design system.

For substantial frontend work, read `specs/ui/frontend-workflow.md` before implementation.

### Required sequence

1. Run `frontend-layout-extractor` to produce `specs/features/<feature-name>/layout.md`.
2. Run `frontend-experience-extractor` to produce `specs/features/<feature-name>/experience.md`.
3. Run `frontend-ui-generator` using both specs.
4. Generate or update `specs/ui/style-guide.md` from the analysis before finishing the task.

### Required outputs

- `specs/features/<feature-name>/layout.md`
- `specs/features/<feature-name>/experience.md`
- `specs/ui/style-guide.md`

### Implementation rules

- Replicate and extend the existing UI with fidelity to the real project design system.
- Treat `layout.md` as the structural source of truth and `experience.md` as the behavioral source of truth.
- Use tokens from `specs/ui/style-guide.md` instead of hardcoded color, typography, or spacing values.
- Extend the component libraries already present in the project instead of rewriting them from scratch.
- Detect the correct reusable component path before creating shared UI files.
- Add an ADR before introducing a new UI dependency such as an animation, component, or icon library.
- Keep `specs/ui/style-guide.md` current when analysis discovers new tokens or patterns.

### Restrictions

- Do not skip the layout or experience extraction phases because the task looks small.
- Do not invent design tokens or composition patterns that are not supported by the existing frontend.
- Do not finish a UI task without acceptance criteria and the relevant spec updates in `specs/features/`.

### Workflow routing hints

- Small visual change on an existing component: `plan-build`
- New isolated, well-specified component: `propose-apply-complete`
- New design system or significant UI refactor: `spec-kit`

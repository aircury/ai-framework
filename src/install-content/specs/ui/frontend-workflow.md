# Frontend Workflow Reference

Use this reference when a frontend task is substantial enough that the short rules in `FRAMEWORK.md` are not enough. The single installed frontend skill is `frontend-ui-workflow`; it contains the references needed for layout extraction, experience extraction, style extraction, clean implementation planning, and final UI generation.

## Scope boundary

Frontend work is frontend-only by default. Do not modify backend files, API endpoints, server actions, schemas, migrations, services, repositories, jobs, queues, auth policies, or infrastructure unless the user explicitly authorizes backend work.

If backend support appears necessary, ask for permission before touching backend files. Name the exact backend layer or files required and the frontend behaviour they would unblock.

## Workflow tiers

Use the lightest workflow that still controls risk.

### Small safe UI edits

Use this path for copy changes, minor spacing adjustments, simple token swaps, or isolated changes to an existing component with no new behaviour.

1. Inspect the nearby component and shared primitive usage before editing.
2. Check `specs/ui/style-guide.md` when the change touches visual tokens, variants, spacing, typography, or interaction states.
3. Preserve existing component boundaries and state ownership unless the task is explicitly a refactor.
4. Update the relevant feature spec only when observable behaviour changes.

Do not run the full extraction pipeline unless the change exposes ambiguity, affects multiple states, changes behaviour, introduces new UI structure, or lacks clear local precedent.

### New UI, rebuilds, and substantial behaviour changes

Use this path for new screens/components, high-fidelity rebuilds, changed user flows, non-trivial forms, role-gated UI, or any frontend task likely to create new structure or state.

1. Use `frontend-ui-workflow` to produce or update `specs/features/<feature-name>/layout.md`.
2. Use `frontend-ui-workflow` to produce or update `specs/features/<feature-name>/experience.md`.
3. Use `frontend-ui-workflow` to generate or update `specs/ui/style-guide.md` from the existing design system.
4. Use `frontend-ui-workflow` to produce or update `specs/features/<feature-name>/implementation-plan.md`.
5. Use `frontend-ui-workflow` to implement the UI from `layout.md`, `experience.md`, `implementation-plan.md`, and the extracted style guide.
6. Update the canonical feature spec in `specs/features/` before finishing the task.

## Fidelity rules

- Match the existing product structure, behaviour, and visual language before introducing new patterns.
- Use `frontend-ui-workflow` to search the codebase for reusable design tokens, shared primitives, and repeated composition patterns before writing new UI code.
- Prefer project tokens and existing component primitives over hardcoded values.
- Treat `layout.md` as the structural source of truth and `experience.md` as the behavioral source of truth.
- Extend the component libraries already used by the project instead of reimplementing them from scratch.
- Detect the correct shared UI folder before creating reusable components.
- Inspect existing shared components, hooks, utilities, form patterns, and local primitives before creating substantial UI.
- Create feature hooks for non-trivial orchestration, form coordination, filters, derived state, permission gates, query adaptation, data shaping, multi-step flow state, or complex event handlers that would otherwise clutter render code. Feature hooks do not require cross-feature reuse.
- Create or update common hooks and shared components when repeated behaviour or UI structure has stable reuse across screens or features. Shared hooks require stable reuse or a clearly reusable project convention.
- Keep simple visual state in the component when extraction would only hide obvious markup behaviour.
- Keep one-off UI and narrowly specific helpers local to the feature until real reuse exists.
- Keep new UI shippable without a cleanup refactor unless requirements change.
- Use `frontend-ui-workflow` to define component boundaries, state ownership, file placement, JSX structure, primitive reuse, and conditional rendering strategy before writing substantial new UI code.
- Use `vercel-react-best-practices` when React/Next performance, hooks, rendering, data-fetching, bundle, or server/client boundary patterns matter. Do not use it as a substitute for frontend implementation quality.

## Style guide expectations

Keep `specs/ui/style-guide.md` current. It should capture at least:

- colours and semantic usage
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
- implementation-quality checks from `implementation-plan.md` when the full frontend workflow applies
- acceptance criteria covering visual behaviour, functional behaviour, and accessibility
- explicit out-of-scope notes when they prevent ambiguity

## Quality review before finish

Before finishing new UI or substantial frontend changes, verify:

- component responsibilities are clear and named in project language
- orchestration, presentational rendering, form state, and conditional branches are not tangled into one giant component
- repeated JSX and repeated business rules have been removed when extraction improves clarity
- hooks and common components are reused or created where repeated behaviour or UI structure would otherwise drift
- feature hooks are created where non-trivial local orchestration would otherwise make components hard to read
- conditional rendering is readable, including loading, empty, error, disabled, read-only, and role-gated states
- local primitives and tokens from `specs/ui/style-guide.md` are reused before introducing new visual structures
- the implementation is shippable without a cleanup refactor unless requirements change

## Restrictions

- Do not run the full extraction pipeline for small safe UI edits when nearby code and `specs/ui/style-guide.md` are sufficient.
- Do not touch backend files, API contracts, persistence, server-side business logic, migrations, or infrastructure unless the user explicitly grants permission for that backend change.
- Do not skip extraction phases for new UI, rebuilds, non-trivial forms, changed flows, role-gated UI, or substantial visual/behavioral changes.
- Do not skip the style extraction phase even when `specs/ui/style-guide.md` does not exist yet.
- Do not skip clean implementation planning for new UI or substantial frontend changes.
- Do not invent design tokens, spacing scales, or composition patterns that are not supported by the existing frontend.
- Do not use hardcoded values when an equivalent token or shared primitive already exists.
- Do not duplicate meaningful JSX, state orchestration, permission checks, validation plumbing, or data-shaping logic when a small shared component or hook would make the implementation clearer.
- Do not create generic shared hooks or components without demonstrated reuse.
- Do not introduce a new UI dependency such as an icon, animation, or component library without an ADR.

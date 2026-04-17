## 1. Module Purpose

Activate this module when the project has an existing frontend. Analyze the code before modifying the UI. Replicate and extend the UI with strict fidelity to the project's real design system. Do not assume rules about styles, components, or visual behaviors without this module active.

## 2. Analysis Pipeline

Execute these three phases in order before generating or modifying any UI component.

### Phase 1 — Design Tokens Extraction

Read the project's canonical sources directly in this priority order:
1. Token configuration files (`tailwind.config.*`, `tokens.json`, global CSS variables, component library theme file).
2. Most used styling files in the project (infer only if centralized configuration does not exist).

Never infer tokens from screenshots or rendered DOM if source code is available.

Extract these tokens obligatorily:
- Document the color palette (primitive and semantic).
- Document the typography scale (families, sizes, weights, line heights).
- Document the spacing system (base scale, grid, gutters, border radii).
- Document interaction tokens (durations, easings, state opacities).

### Phase 2 — Component Tree

Map the tree by analyzing the source code. Use as sources of truth, in this priority order: TypeScript types/interfaces, PropTypes, JSDoc comments, actual usage in the project.

Analyze obligatorily:
- **Directory Audit**: Execute a full directory audit of the target component's module (including subdirectories like `/modals` or `/forms`) to prevent missing secondary components.
- **Event Tree Mapping**: Trace every interactive element (buttons, links) to its destination (modals, external components, forms) to ensure no sub-components are omitted.
- **Form Data Mapping**: Extract all native form fields, expected options, and input constraints upfront.
- Map the component hierarchy and its direct dependencies.
- Map props, slots, and variants documented or inferrable from usage.
- Map component states: empty, loading, error, disabled, active.
- Map recurrent composition patterns (e.g., always use `Card > Header + Body`, never `Card` standalone).

### Phase 3 — Behavior and Interactions

Identify obligatorily:
- Define the local state logic of components (when it opens, closes, collapses).
- **Layout & Boundaries**: Analyze the structural layout constraints (e.g. `flex-wrap` vs `grid`, responsive breakpoints, fixed parent widths) to prevent content overflows and visual clipping.
- Replicate the exact pattern of existing animations and transitions (Framer Motion, GSAP, pure CSS). Do not introduce another library.
- Map the observable accessibility requirements: present ARIA roles, focus management, keyboard shortcuts.

State explicitly in the specification if behavior cannot be determined from the code before proposing an implementation.

## 3. Project Style Guide

Generate or automatically update the `frontendRules/style-guide.md` file after completing the three analysis phases. This file is the absolute design source of truth for the project.

- Generate the file automatically from the analysis. Do not write it by hand.
- Update the file whenever you detect new tokens or unrecorded patterns.
- Reference the guide in every component spec you produce.
- Mark a section as `[pending analysis]` if there is not enough data. Do not omit it, leave it empty, or invent values.

Mandatory file structure:

```md
# Style guide — [project name]

## Colors
| Token | Value | Semantic Use |
|---|---|---|

## Typography
| Level | Family | Size | Weight | Line Height |
|---|---|---|---|---|

## Spacing
[base scale, available values, usage rules]

## Interaction States
[per state: hover, focus, active, disabled, loading, error]
[per state: what changes visually + duration + easing if applicable]

## Project Notes
[detected specific conventions that do not fit in the above categories]
```

## 4. Component Spec

Produce a spec in `specs/features/[component-name].md` for every UI task that generates or modifies a component.

The spec must strictly follow this format:
- API: Define props with name, type, default value, and requirement status.
- Variants: Define an exhaustive list detailing what changes visually in each variant.
- States: Define what happens visually and functionally in every possible state.
- Tokens used: Explicitly reference tokens from `frontendRules/style-guide.md`. Do not use hardcoded values.
- Acceptance criteria: Define at least one visual, one functional, and one accessibility criterion. Specs without acceptance criteria are invalid.
- Out of scope: Explicitly declare what is excluded to prevent scope creep.

## 5. Implementation Rules

- Use exclusively tokens from `frontendRules/style-guide.md` in generated code. Do not introduce hardcoded values for color, typography, or spacing.
- Extend existing component libraries (MUI, shadcn, Radix) by following their customization patterns. Do not rewrite their components from scratch.
- Propose the complete API in the spec before writing code if a component does not exist in the project.
- Create new animations using the library already present in the project. Write an ADR to introduce a new animation library.
- Place reusable generic components in the folder designated by the project for that purpose (e.g., `components/ui/`, `shared/`). Detect the path before creating files.

## 6. Framework Flow Triggers

| Task | Flow |
|---|---|
| Initial frontend project analysis (onboarding) | Execute the 3 phases + generate `frontendRules/style-guide.md` before any other task |
| Small visual modification on existing component | Plan-Build (token analysis is still mandatory) |
| New isolated well-specified component | OpenSpec |
| New design system or significant UI refactor | Spec Kit |

## 7. Absolute Restrictions

- Do not invent design tokens that do not exist in the project.
- Do not use hardcoded values where an equivalent token exists.
- Do not omit the Phase 1-3 analysis by arguing "the task is too small".
- Do not generate a component spec without acceptance criteria.
- Do not introduce UI dependencies (icon libraries, animations, components) without an ADR.
- Do not assume a composition pattern is correct without verifying it in the existing code.
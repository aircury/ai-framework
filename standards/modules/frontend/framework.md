## 1. Module Purpose

Activate this module when the project has an existing frontend. Analyze the code before modifying the UI. Replicate and extend the UI with strict fidelity to the project's real design system. Do not assume rules about styles, components, or visual behaviors without this module active.

## 2. Analysis Pipeline

Execute this workflow to replicate or extend a UI module.

### Phase 1 — Structural Extraction (Layout)

Use the `frontend-layout-extractor` skill to analyze the source code at the target location.

- **Goal**: Produce a `layout.md` file that captures every field, label, and static element with "full field parity".
- **Constraint**: This phase must ignore all styling and complex orchestration logic.
- **Output**: `specs/features/<feature-name>/layout.md`.

### Phase 2 — Behavioral Extraction (Experience)

Use the `frontend-experience-extractor` skill to analyze the same source code.

- **Goal**: Produce an `experience.md` file that captures user flows, micro-interactions, state transitions, validation feedback, and conditional visibility or authorization logic.
- **Constraint**: This phase focuses on "how it feels" and the behavioral logic, including who sees what and when, while `layout.md` remains the source of structural field parity.
- **Output**: `specs/features/<feature-name>/experience.md`.

### Phase 3 — Visual Implementation (UI)

Use the `frontend-ui-generator` skill to build the interface based on both the `layout.md` and `experience.md` files, ensuring strict adherence to the project's design system.

- **Style Guide**: Ensure `frontendRules/style-guide.md` is updated with current tokens.
- **Implementation**: Replicate the exact structure and behavior.
- **Fidelity**: Achieve full parity with the specified layout and experience, including role-gated rendering and field-level visibility rules, while maintaining strict consistency with the project's visual style.


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

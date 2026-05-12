# Style Extraction Reference

Use this reference to document the real visual system already present in the target frontend application.

## Goal

Produce or update `specs/ui/style-guide.md` from the existing frontend codebase so downstream UI work can reuse the real design system already in production.

This is an extraction task, not a redesign task.

## Inputs

- The target frontend codebase or a path to the relevant frontend area.
- Existing `specs/ui/style-guide.md` if present.
- Token files, theme files, component folders, CSS files, utility layers, and representative screens.

## Output File

Save the result to `specs/ui/style-guide.md`. Create the directory if needed.

Use this structure:

```md
# Style guide — <project name>

## 1. Overview
[Brief summary of the visual language and whether the system is centralized, partially centralized, or inconsistent.]

## 2. Sources Analysed
[Token files, theme files, component folders, CSS files, utility layers, and representative screens inspected.]

## 3. Design Tokens
[Colors, typography, spacing, radius, borders, shadows, opacity, and motion tokens or repeated observed conventions.]

## 4. Semantic Usage Rules
[Mapping from tokens/repeated values to usage intent when the codebase makes intent clear.]

## 5. Core UI Primitives
[Reusable primitives and shared components with variants, sizes, visual states, and composition constraints.]

## 6. Interaction States
[Hover, focus, active, disabled, loading, selected, error, success, and empty-state conventions.]

## 7. Composition Patterns
[Shell, form, table, modal, card, list, navigation, and section patterns.]

## 8. Responsive Conventions
[Breakpoints, layout adaptations, and mobile/desktop conventions.]

## 9. Accessibility-Related Visual Conventions
[Focus visibility, error emphasis, disabled/read-only differentiation.]

## 10. Known Gaps and Inconsistencies
[Conflicting patterns, duplicated primitives, hardcoded one-off values, and non-standardized areas.]

## 11. Strict Reuse Rules
[Tokens, primitives, variants, and patterns that must be reused before introducing any new visual solution.]
```

## Evidence Rules

- Prefer explicit tokens, theme definitions, and shared primitives over one-off usage.
- When no formal token exists, document repeated conventions as observed conventions, not invented tokens.
- If multiple conflicting patterns exist, document the conflict instead of normalizing it away.
- If a section cannot be verified, mark it as `[pending analysis]`.
- Include import paths for reusable primitives when verified.
- Record hardcoded values only when they are repeated or important inconsistencies.

## What To Capture

- Design tokens: color names/values, semantic aliases, typography, spacing, radius, borders, shadows, opacity, and motion.
- Semantic usage: primary action, destructive action, muted text, surface background, focus ring, errors, success, warnings, badges, disabled states.
- Core primitives: buttons, inputs, selects, checkboxes, modals, drawers, cards, tables, tabs, tooltips, badges, alerts, skeletons, toasts.
- Composition patterns: page shells, headers, footers, forms, filters, table actions, mobile stacks, modal footers, card grids, list rows.
- Responsive conventions: breakpoints, container widths, sidebar behavior, mobile navigation, stacked forms, overflow handling.

## Constraints

- Do not invent a new design system.
- Do not create tokens that are not represented in the codebase.
- Do not rewrite inconsistent reality into a cleaner story.
- Do not recommend a redesign unless the user explicitly asks for one.

## Quality Gate

If the project uses three card shadows, duplicated button primitives, or mixed spacing conventions, `style-guide.md` must capture that reality instead of hiding it.

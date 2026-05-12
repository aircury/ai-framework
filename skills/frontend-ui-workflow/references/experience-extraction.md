# Experience Extraction Reference

Use this reference to extract or derive the exact behavioral and UX contract of a frontend component or module.

## Goal

Produce `specs/features/<feature-name>/experience.md` describing how the UI behaves, how it responds to input, what flows it supports, and when each field, section, or action is rendered, hidden, disabled, or read-only.

`layout.md` says what exists. `experience.md` says how it works and when it appears.

## Inputs

- Existing component/module source code when reverse-engineering or rebuilding UI.
- Feature specs, product requirements, access-control rules, validation rules, designs, screenshots, or user-provided requirements when creating new UI.
- Nearby product conventions for loading, empty, error, success, disabled, focus, and navigation behavior.

## Output File

Save the result to `specs/features/<feature-name>/experience.md`. Create the directory if needed.

Use this structure:

```md
# Experience — <feature name>

## 1. User Flows & Navigation
[Happy path, edge cases, form flows, navigation outcomes, cancellation, and recovery paths.]

## 2. Interaction & Micro-interactions
[Feedback, transitions, loading indicators, focus/active/hover intent, toasts, optimistic updates, and confirmations.]

## 3. State Management & Logic
[Local state, global/async state, validation feedback, authorization, visibility, disabled, read-only, and derived-state rules.]

## 4. Accessibility Behavior
[Keyboard navigation, focus management, announcements, escape behavior, and screen reader expectations.]
```

## Extraction Rules

- Capture happy paths step by step.
- Capture empty states, large data sets, cancelled actions, failed submissions, async errors, validation errors, and retry behavior.
- Capture local UI state such as selected tab, open accordion, active item, expanded details, pending confirmation, and current step.
- Capture async state such as loading, success, error, stale data, optimistic updates, and refetch behavior.
- Capture validation timing and display: on blur, on change, on submit, inline messages, banners, disabling submit, or server errors.
- Capture transitions and micro-interactions abstractly without pixel-perfect values.
- Capture all role, ownership, tenant, plan, feature-flag, account-state, and permission rules.
- Distinguish hidden, disabled, and read-only; these are not interchangeable.

## New UI Derivation Rules

When no source UI exists, derive the experience from requirements and product conventions:

- Treat explicit behavioral requirements and access rules as fixed.
- Use nearby screens to infer feedback and state conventions, but do not invent permission rules or validation behavior.
- Mark unclear flows or authorization rules as `[needs clarification]` instead of guessing.
- Keep visual details abstract; exact visual tokens belong in `specs/ui/style-guide.md`.

## Constraint: No Pixel-Perfect Styles

- Use descriptions such as smooth transition, distinct success feedback, inline error, modal enters, or focus moves to first invalid field.
- Do not specify exact CSS classes, colors, pixel values, or timing values unless they are necessary behavioral contracts already present in source.

## Quality Gate

If a field renders only for `admin`, an action is disabled for non-owners, a section is hidden behind a plan limit, a toast appears after success, or focus is restored after closing a dialog, `experience.md` must capture that rule exactly.

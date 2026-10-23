# Layout Extraction Reference

Use this reference to extract or derive the exact structural contract of a frontend component or module.

## Goal

Produce `specs/features/<feature-name>/layout.md` describing what is in the UI while ignoring styling and deep behavioral orchestration.

The result must let an agent or developer reconstruct the functional layout with full field parity.

## Inputs

- Existing component/module source code when reverse-engineering or rebuilding UI.
- Feature specs, product requirements, design files, screenshots, or user-provided requirements when creating new UI.
- Nearby product conventions when requirements leave structural choices open.

## Output File

Save the result to `specs/features/<feature-name>/layout.md`. Create the directory if needed.

Use this structure:

```md
# Layout — <feature name>

## 1. Component Hierarchy
[Structural tree of containers, sub-components, modals, popovers, fragments, headers, body regions, and footers.]

## 2. Field Map (Full Field Parity)
[Every form field, select option, data entry point, interactive element, label, heading, button, tooltip, and static text.]

## 3. Basic Interaction Intents
[Button/action intents without complex orchestration.]

## 4. Accessibility Structure
[ARIA roles, landmarks, labels, relationships, and structural accessibility features.]
```

## Extraction Rules

- Identify all sub-components, modals, dialogs, drawers, popovers, tabs, accordions, empty states, and fragments.
- Describe containment relationships clearly.
- List every data entry point and interactive element.
- For form fields, include name, type, placeholder, default value, required/optional status when known, and static label text.
- For selects, radios, segmented controls, tabs, and menus, include the exact option list when known.
- Include static content such as headings, section labels, helper text, button text, and tooltip text.
- Capture action intent only at a basic level, such as submit, cancel, open details, toggle advanced fields, or remove item.

## New UI Derivation Rules

When no source UI exists, derive the layout from requirements and nearby product conventions:

- Treat explicit requirements as fixed.
- Use nearby screens to infer product language and structural conventions, but do not invent business fields.
- Mark unclear fields or labels as `[needs clarification]` instead of guessing.
- Keep visual styling out of `layout.md`; styling belongs in `specs/ui/style-guide.md`.

## Constraint: No Styles

- Do not mention Tailwind classes, CSS properties, colors, pixel sizes, fonts, shadows, or animation timings.
- Use abstract component terms such as Primary Button, Secondary Action, Status Badge, Dialog, or Section Header.

## Quality Gate

If the UI has a small checkbox, secondary button, tooltip, hidden-by-default section, tab option, or static note, `layout.md` must include it. Omissions are failures.

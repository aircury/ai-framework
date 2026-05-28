---
name: ask-question
description: >-
  Use the IDE AskQuestion tool when the agent needs user input. Use when asking
  the user to choose between options, confirm a decision, or pick from discovered
  alternatives — never ask multiple-choice questions in plain chat.
---

# Ask Question (IDE)

## Rule

When you need an answer from the user and the response can be expressed as **one or more clear options**, use the IDE **`AskQuestion` tool**. Do **not** ask that question in plain chat.

Plain chat is only for **free-text** answers that cannot be represented as options (for example an email address, a secret, or a custom name the user must type).

## When to use `AskQuestion`

- Choosing between approaches, environments, or profile layouts
- Confirming yes / no or proceed / stop
- Picking one value from a list you discovered in the codebase
- Selecting from a small set of permission sets, account ids, or role names
- Any question where you can offer meaningful predefined options

## When plain chat is allowed

- The answer must be typed free text and cannot be turned into options
- You are reporting progress or explaining work, not collecting a structured choice

## How to ask well

1. **One topic per call** — do not combine unrelated decisions in one form unless they are tightly coupled.
2. **Derive options from context** — prefer choices found in the project over generic placeholders.
3. **Include an escape hatch** — when options may be incomplete, add something like `None of these / I will provide details`.
4. **Wait for the answer** — do not assume or proceed until the user responds.

## Anti-patterns

- Asking "A or B?" in chat instead of `AskQuestion`
- Listing numbered options in chat and asking the user to reply with a number
- Skipping `AskQuestion` because the option list is short

---
name: semantic-line-breaks
description: Enforce semantic line breaks in Markdown specification prose. Use this whenever creating or editing specs, requirements, ADRs, README-style specification docs, or Markdown under specs/ or docs/, especially when paragraphs would otherwise be written as long wrapped lines. Apply it for AI-written specs and for review/cleanup of existing spec prose so future one-word edits produce small, readable diffs.
license: MIT
metadata:
  author: Aircury
  version: "1.0"
---

# Markdown semantic line breaks

When authoring or editing prose in any `.md` file under `specs/` or `doc/`,
start a **new line after a full stop** only when that break is **semantically
right** for the paragraph (a distinct thought, requirement, or reviewable
unit), and where the line still fits within the limit below.

A full stop is not an automatic line break: abbreviations, decimals, version
numbers, and other non-terminal stops stay on the same line; some sentences
belong on one line together when they read as one unit.

You MAY break further at major clause boundaries (after `;`, `:`, em-dashes,
or before a long parenthetical aside).

This convention is known as **Semantic Line Breaks** (also "ventilated prose" or
"semantic linefeeds").
See <https://sembr.org> for the canonical statement.

## Line length (80 characters)

**Every** line of applicable prose MUST be at most **80 characters** long
(counting spaces and leading indentation, e.g. list continuation).

If a sentence or clause would exceed that limit on one line, add soft breaks at
natural boundaries (clause, then phrase, then word) until no line is longer than
80 characters.

Short sentences stay on a single line; long sentences span multiple lines under
this cap.

## Human judgement only (no scripts)

Choosing where to break after a full stop depends on meaning, context, and how
the paragraph should read in review — not on punctuation alone.

**This rule CANNOT be applied correctly by an automated script** (formatters,
regex rewrappers, `fmt` tools, or batch “fix line length” jobs).
Agents and authors MUST decide breaks by reading the prose; do not run or
propose wholesale auto-rewrap of `specs/`, `doc/`, or README files.

## Why

Markdown joins consecutive non-blank lines into a single rendered paragraph
(CommonMark / GFM treat soft line breaks as a single space).
The **rendered output is unchanged**.
What changes is the diff: a one-sentence edit shows up as a one-line diff
instead of rewrapping a 500-character paragraph, so PR review and `git blame`
stay legible.

The 80-character cap keeps lines readable in editors and review UIs without
changing rendered HTML.

## When editing existing paragraphs

If a touched paragraph is currently a single long line containing several
sentences, **rewrap the whole paragraph** by hand into semantic line breaks and
the 80-character limit as part of the same edit, even for sentences not being
changed.
Judge each full stop: start a new line only where it aids meaning and review;
do not split blindly on every `.`.
This is a one-time cost; from then on, diffs of that paragraph stay clean
forever.

## Where the rule does NOT apply

Do not insert mid-sentence line breaks inside:

- Fenced code blocks or inline code spans.
- Tables (each row stays on one line).
- Link reference definitions.
- YAML frontmatter.
- Raw HTML blocks.

List items stay within the 80-character rule for their prose; break per sentence
within the item when needed (continuation lines indented to the item's text
column).

Paragraphs are still separated by a **blank line**, exactly as before.

## Hard line breaks (two trailing spaces)

When a line must break visibly inside one rendered paragraph (for example
address lines or a label followed by detail on the next line), end that line with
**exactly two spaces** before the newline.
Do not use one trailing space, three or more, or a trailing `<br>` tag in
hand-authored `doc/` prose.
The reader maps two trailing spaces to a hard line break; `make doc-validate`
rejects the other forms.

## Example

Bad — four sentences on one line, every edit rewraps the whole thing:

```md
The widget SHALL appear in the sidebar. It SHALL be hidden for guests. Administrators SHALL be able to pin it to the top. Pinning SHALL persist across sessions.
```

Good — same rendered paragraph, per-sentence diffs,
each line ≤ 80 characters:

```md
The widget SHALL appear in the sidebar.
It SHALL be hidden for guests.
Administrators SHALL be able to pin it to the top.
Pinning SHALL persist across sessions.
```

If one sentence is too long for one line, break it further
(Markdown soft line breaks):

```md
This requirement SHALL describe a long policy that would exceed one hundred characters if
kept on one line, so it continues here without exceeding the limit.
```
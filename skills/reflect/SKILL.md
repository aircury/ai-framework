---
name: reflect
description: Generate an HTML reflection report about the CURRENT chat session — a fixed widget-grid of metrics (subagents, skills, cost, tokens, the user's effort, outputs), a mandatory secrets/PII check (green when clean, red alert when credentials or personal data appeared in the chat), and a free-form summary. Use whenever the user invokes /reflect, asks to "reflect on this chat", "generate the chat report", "make the session summary", asks "how much did this chat cost", "how many subagents ran", or "did any secrets leak into this chat", or wants an end-of-chat report to read later for spotting improvements, wasted effort, or skill ideas.
---

# Reflect — per-chat reflection report

Generate ONE standalone HTML report about the chat this skill is invoked in.
The user reads it later to reflect: what happened, what it cost, what the
AI did that they didn't watch happen, and what deserves to become a skill.
They will stop reading anything verbose — keep every part scannable.

The report has exactly three parts, in this order:
1. **A fixed top section** — a widget grid, identical layout every time,
   from the template. This consistency is the point: the reader's eye learns
   where every number lives. Never add, remove, or reorder widgets.
2. **A secrets & PII check** — always rendered right below the grid; green
   when clean, loud red when anything needs rotating (Step 4).
3. **A free-form summary** — structured however best explains THIS chat.
   This part is yours.

## Step 1 — measure

Run the metrics script (Node.js, no dependencies):

```bash
node <skill-dir>/scripts/metrics.js
```

It locates the current session's transcript (newest `.jsonl` under
`~/.claude/projects/<cwd-with-slashes-as-dashes>/`), sums token usage across
the main transcript and every subagent transcript, and prints JSON: tokens
generated/processed, estimated API cost at the model's rates (1-hour cache
writes, as Claude Code uses), wall-clock span, subagent count, api calls,
user message count, model. If the session continued from earlier checkpoint
files, pass them too: `node metrics.js --extra <path.jsonl> ...` — the wall
clock and totals then cover the whole logical chat.

These are the report's **measured** numbers. Never invent them; if the script
fails, say so in the report rather than guessing.

## Step 2 — judge

You lived through this conversation, so you supply the **estimated** metrics.
Be honest — the report's value depends on it. Definitions:

| Metric | Meaning |
|---|---|
| Tokens wasted | Spent on dead ends: failed detours, redone rounds, abandoned approaches. Rough estimate is fine; `~0` when clean. |
| Stepped in | Times the user had to correct, interrupt, or redirect you. Count real course-corrections, not ordinary answers to your questions. |
| Hands-on / wall | Wall comes measured; estimate the user's active time (typing, relaying data, reviewing) vs. leaving it running. |
| Lost waiting | Time stalled on permission prompts or long-blocked calls the user had to notice. |
| Permission prompts | Approximate count of approval requests. |
| Outcome | One or two words: shipped, resolved, QA passed, prototype, answered, abandoned… |
| Deliverables | Concrete outputs. PRs and published artifacts become links (real URLs); in-chat outputs named plainly. |
| Follow-ups open | Things left unfinished or promised, with a 2–4 word note. |
| Ideas spotted | Count of skill/automation/improvement candidates you noticed (detail them in the summary). |
| Kept for later | What was persisted (memory writes, CLAUDE.md, settings) — or `nothing persisted`, which is itself a signal. |
| Skills invoked | Named skills that fired this chat, as chips; mark ones that failed. |
| Model · effort | Model comes measured; effort from what you know of the session. |

## Step 3 — build the report

Copy `assets/report-template.html` and fill it:

- `{{DATE}}`, `{{TITLE}}` (short, specific), `{{PROJECT}}` (project · tool,
  e.g. `smartgrade · claude code`).
- One `{{...}}` slot per widget. Formatting rules the reader relies on:
  - **Measured values are plain; estimated values are wrapped in**
    `<span class="est" title="estimated">~value</span>` — the dotted
    underline is how the reader tells them apart.
  - Subagents widget: add class `hot` on the widget div when subagent
    activity is the story of the chat (roughly ≥5), `zero` when none ran.
    Put what they were in the sub line ("3 waves: 10 finders → 18
    verifiers → 1 sweep", "Explore · background code sweep").
  - Kept-for-later widget: class `yes` when something persisted, `no`
    otherwise.
  - Failed skills get chip class `failed`.
  - Keep sub lines under ~7 words.
- Numbers stay raw — no comparisons to other chats, no ratings.

## Step 4 — secrets & PII check (never skip)

Chats absorb things that should never sit in an AI conversation: pasted env
output, logs, configs, DB rows, screenshots-into-text. Review everything that
flowed through this chat — user pastes AND tool results — for:

- **Credential-like values**: API keys, tokens, passwords, connection
  strings, private keys, signed URLs, session cookies.
- **Personal data**: real people's names tied to records (students, staff),
  emails, phone numbers, anything regulated.

The check is always rendered, directly below the grid, so its presence proves
it ran:

- **Nothing found** → `{{SECRETS_CLASS}}` = `clear`, and `{{SECRETS_BODY}}`:
  ```html
  <span class="s-chip">Secrets check</span>
  <span>Nothing credential-like or personal appeared in this chat — nothing
  needs rotating.</span>
  ```
  Ground the sentence in what you actually reviewed ("...in any of the job
  logs, launch templates, or configurations read during this investigation").
- **Anything found** → `{{SECRETS_CLASS}}` = `alert`, and `{{SECRETS_BODY}}`:
  ```html
  <span class="s-chip">⚠ Secrets found — act now</span>
  <p class="s-head">N values in this chat need rotating.</p>
  <ul>
    <li><b>What:</b> AWS secret key (ends …k3Xq) · <b>Where:</b> pasted
    terminal output, QA step · <span class="s-do">ROTATE in IAM</span></li>
  </ul>
  ```
  One `<li>` per finding. **Never reprint the value** — identify it by kind,
  where it appeared, and at most its last 3–4 characters. For personal data
  the action is exposure-noting, not rotation ("student names entered this
  chat — avoid re-pasting; consider the blind-db protocol next time").

When in doubt whether something counts, list it — a false alarm costs a
glance; a missed key costs an incident.

## Step 5 — write the summary

Below the grid, in the `{{SUMMARY}}` section: explain the session however
you deem most relevant — you know what mattered. Judgment, not template.
What makes it worth reading:

- Open with what happened and how it ended, in two or three sentences.
- Surface what the user likely missed at runtime: background subagents
  (which, why, how many), skills that fired quietly, self-corrections. This
  skill exists partly because a 29-subagent code review once ran entirely
  unnoticed — this section makes sure that never happens again.
- Friction, honestly: where the user had to step in, what was wasted, and what
  would prevent it (a skill to harden, a fact to persist, a doc to write).
- Ideas worth harvesting: patterns that could become skills or be shared
  to this ai-framework repo — each with a one-line ready-to-paste ask.
- Shape follows content: an investigation reads well as a short timeline of
  where hypotheses moved; a build as decisions taken; a Q&A needs two lines.
  Prefer lists and short runs of prose; a sparing verbatim user quote is
  fine. If too long to scan in a minute, cut.

Use only the CSS classes already in the template's summary section — it
styles headings, lists, timeline rows, quotes, and idea chips.

## Step 6 — deliver

1. Save to `~/ai-chat-reports/YYYY-MM-DD-<slug>.html` (create the directory
   if needed).
2. If the Artifact tool is available, publish the file (private by default,
   favicon `📊`) and give the link; otherwise give the file path.

One run = one report about this chat only. Never aggregate other sessions
into it.

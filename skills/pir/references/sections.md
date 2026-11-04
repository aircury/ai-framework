# Writing each section

Read this before drafting. `assets/example.json` is a complete report for a
made-up incident: use it to see the depth and tone expected, not as wording to
copy.

## For every section

- **Two readers.** A manager reads the top of the report and stops; an
  engineer reads to the end. Put what the manager needs first in each
  section, and the detail after it.
- **Plain words.** Explain a technical term the first time it appears ("an
  API key, the password one system uses to call another"). Use the same name
  for a thing everywhere.
- **What happened, not who.** Describe what the systems and the process
  allowed, never who was at fault. "The deploy went out without a production
  build" not "Sam forgot to build". Names appear only as owners, as who
  handled the incident, and in the sign-off.
- **Numbers, with what they count.** Give a figure whenever the evidence has
  one, and say what it does and does not count: "580 timed-out logins from 56
  accounts, including automatic retries, so fewer people than that".
- **Past tense, facts only.** No "probably", "should have" or "it seems". When
  something is not known, leave the field empty and ask.

## Title

What the users saw, on which system, in one line. Not the technical cause:
the cause has its own section.

- Good: "Order confirmation emails not sent from the production web shop"
- Avoid: "Expired API key in the email service" (the cause), "Email incident"
  (says nothing)

## Header facts

- `service`: the product name people use, not a repository name.
- `facts.affected`: who or what, in a few words, with the number if known:
  "Shop customers who ordered overnight (212 orders)".
- `facts.data`: always state it, even when nothing happened: "None lost,
  altered or exposed". If data was touched, say what, how much and whether it
  was recovered.

## Summary

The whole incident in three or four short paragraphs, so a manager who reads
nothing else knows what happened, how bad it was, that it is fixed, and what
stops it happening again.

1. What broke, when, and the cause in one plain sentence.
2. Who was affected and how much; what still worked.
3. How it was found and fixed, with the key times.
4. What is being done so it does not happen again (the main actions).

Keep the detail for the timeline and the root cause. No list of every step,
no error messages, no commit names.

## Timeline

The record of what happened and when. Each step is one event that happened,
not a thought or a plan.

- Include: the trigger, every required stage, anything that changed the
  course of the response, and each fix going live.
- A `decision` is a choice someone made during the response where another
  option was possible, such as fixing forward instead of rolling back, or
  deploying without waiting for the checks; `reason` says why.
- A `note` is worth adding only if a reader would miss it: a failed first fix,
  a handover, the moment the client was told. Not every commit or CI run;
  attach those as `evidence` to the step they support.
- Write each step so it stands alone: "The fix went live and logins worked
  again", not "Done".
- When only the day is known, ask for the time before leaving it empty.

## Impact

Only what was checked. `affected` and `notAffected` are both lists of short
items, each naming one thing and, if known, how much.

- `affected`: who or what was hit and for how long: "Guest checkout
  customers, about 70 orders: no confirmation at all, as they have no account
  page".
- `notAffected`: what someone might fear was hit but was checked: "Payments:
  all 212 orders were charged once", "Password reset emails: use a different
  key, checked".
- Not here: anything nobody checked (ask about it first, see step 3 of the
  skill).

## Root cause

`rootCause.plain` is for the manager: two to four sentences, no jargon, that
say why it broke in a way someone could act on.

Keep asking "why?" until the answer is something we can change. "The disk
filled up" is a symptom; "nothing cleared the service's logs, so they grew
until the disk was full" is a cause we can fix.

`rootCause.steps` is for the engineer: the chain from the first cause to what
users saw, one link per step, each with a short `title` and the `detail` that
proves it. Put a real error message or stack trace in `code`, verbatim, with
secrets removed. Do not paste logs that prove nothing.

## Gaps

Why we did not prevent it, catch it sooner or fix it faster. This is not the
root cause again: the root cause is why it broke; a gap is a safeguard that
was missing or did not work.

Look at three moments:

- **Before:** what check, test or review could have stopped it shipping?
- **During:** what would have told us sooner than the users did?
- **After:** what slowed the fix or the recovery?

One gap per missing safeguard. The `summary` names it in a few words ("No
alert on failed emails"); the `detail` says what happened because of it and,
where it matters, how long it cost ("found 10 hours later, when customers
complained").

## Actions

What was done to fix this incident, and what will stop it happening again.

- Fixes for this incident (restoring service, cleaning up, re-sending)
  close no gap: `closes: []`.
- Every other action closes at least one gap, and every gap should be closed
  by at least one action, or the person has accepted the risk.
- Write each action so someone could do it and someone else could tell it is
  done: "Alert the on-call when more than 5% of emails fail over 10 minutes",
  not "Improve monitoring".
- Prefer actions that remove the cause or check for it automatically over
  actions that rely on people remembering.

Then run the recurrence check with the person (step 3 of the skill).

## Sources

Every place a fact came from, each with its link: the incident ticket, the
repository's commits, the CI and deploy runs, monitoring dashboards, the
cards for the actions. One entry per source, named so a reader knows what it
is before opening it.

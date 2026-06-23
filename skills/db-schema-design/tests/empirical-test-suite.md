# DB Schema Design Skill: Empirical Test Suite

Run each test as a prompt to an agent with the skill enabled.

The expected behaviour is more important than exact wording.

---

## Test 1: JSON anti-pattern

Prompt:

> Add a `preferences` JSON column to users so we can store notification settings, dashboard options, and future user settings.

Expected:

- Warns that JSON is not default for business/user settings.
- Asks whether settings need filtering/reporting/permissions.
- Suggests a relational `user_notification_setting` / `user_setting` style model or lookup table depending on use case.
- Allows JSON only if justified as genuinely schemaless and not queried.

---

## Test 2: No-context table creation

Prompt:

> Create a table for experiments.

Expected:

- Does not immediately create a table.
- Asks what an experiment means in the application, who owns it, lifecycle, cardinality, and expected queries.
- Keeps questions minimal, ideally 2–3 high-value questions.

---

## Test 3: Nullable XOR relationship

Prompt:

> Create `metric_assignment` with either `standard_metric_id` or `custom_metric_id`. Exactly one must be filled.

Expected:

- Flags XOR as controversial.
- Explains options: XOR check constraint, separate join tables, unified metric table, or explicit metric source model.
- Asks which model adapts better if metrics later get more fields, permissions, reporting, or UI changes.
- Recommends maintainable/domain-clear option, not just the fewest tables.

---

## Test 4: Arrays anti-pattern

Prompt:

> Add `sampling_days text[]` and `sampling_times text[]` to experiments. It is faster than making another table.

Expected:

- Warns against arrays for queryable business data.
- Asks whether days/times are edited, reported, filtered, validated, or reused.
- Suggests `sampling_window` or equivalent child table.
- Explains that more tables can be simpler than array parsing.

---

## Test 5: Indexing behaviour

Prompt:

> Add a `project_comments` table with `project_id`, `author_id`, `created_at`, `comment`, and APIs will list comments by project ordered newest first.

Expected:

- Adds indexes matching access pattern, likely `(project_id, created_at)` or `(project_id, created_at desc)` depending DB.
- Considers FK indexes.
- Does not add irrelevant indexes to every column.
- Mentions search index only if note text is searched.

---

## Test 6: Optional privacy minimisation

Prompt:

> Add first name, last name, email, phone, date of birth and address to contact because that is standard.

Expected:

- Does not treat all personal fields as automatically required.
- Asks what the application actually needs: display name, contact method, eligibility, postal communication, etc.
- Recommends storing only needed fields.
- Does not over-engineer if the project convention genuinely expects some of these fields.

---

## Test 7: Enum vs lookup table

Prompt:

> Add an enum for publication category: article, book, dataset, poster.

Expected:

- Checks whether Product Owners/admins may rename, hide, order, translate, or extend categories.
- Recommends lookup table if business-managed.
- Allows enum only if stable and technical.

---

## Test 8: Bad migration with unclear reason

Prompt:

> Add `extra_data jsonb` to experiment protocols because the new ticket needs extra stuff and we are in a rush.

Expected:

- Refuses to blindly add it.
- Asks why the extra data is needed and what it represents.
- Offers a short warning and safer alternative.
- If user insists, documents deviation and risk.

---

## Test 9: Partitioning request

Prompt:

> Partition the audit log by status for performance.

Expected:

- Does not accept partitioning blindly.
- Asks whether partitioning is for maintenance or performance.
- Suggests indexes/query review first.
- Warns that low-cardinality partitioning by status is usually suspicious.
- Only proceeds if explicit operational need exists.

---

## Test 10: Product Owner communication

Prompt:

> We can either duplicate these five fields on each review row or create a shared review_template table. Which one?

Expected:

- Explains options in PO-friendly language.
- Identifies the key deciding question.
- Discusses future changes.
- Gives recommendation if user delegates.
- Keeps answer compact.

---

## Test 11: Audit columns convention

Prompt:

> Create a new `project_note` table. Add created_at, updated_at, created_by, updated_by, deleted_at, and deleted_by.

Expected:

- Checks existing project convention first.
- Does not blindly add six audit columns.
- If the project has no audit convention, asks what the user wants.
- Recommends a small audit set if audit is useful, usually 2–3 fields.
- Does not add soft-delete fields unless lifecycle requires it.

---

## Test 12: Naming many-to-many table

Prompt:

> We need a table that connects authors and publications. Call it `mapping`.

Expected:

- Pushes back on vague name.
- Suggests `author_publication` or project-convention equivalent.
- Explains that many-to-many tables should clearly name the linked concepts.

---

## Test 13: Bigint vs int for normal numeric columns

Prompt:

> Add `total_events int` to the monthly analytics table. It could grow a lot over the years.

Expected:

- Recommends `bigint` for a potentially growing numeric value in PostgreSQL-like systems.
- Does not confuse this with identifier strategy.
- Does not apply bigint blindly to small bounded fields.

---

## Test 14: UUID security misconception

Prompt:

> Use UUIDs for user IDs because then `/profile/user/{id}` is secure. Int IDs are insecure.

Expected:

- Corrects the misconception.
- Explains that route authorization and permission checks provide security, not UUIDs.
- Compares bigint and UUID based on usability, project convention, generated links, distributed generation, and human readability.
- Does not claim UUIDs are safer.

---

## Test 15: Existing model review pragmatism

Prompt:

> Review this existing schema and tell me what to change.

Expected:

- Does not propose a full theoretical rewrite.
- Finds the 2–3 highest-impact changes.
- Separates serious changes from minor issues not worth migrating.
- Considers migration cost and app benefit.

---

# Application Trial Protocol

Apply this skill to at least two projects before treating it as stable.

## Project 1: Academic Research Workflow

Use cases to test:

- Metric modelling: standard vs custom metrics.
- Sampling schedule modelling.
- Hidden survey items and display ordering.
- Protocol / observation / review lifecycle.
- Indexes for project, participant, protocol, and review queries.
- Existing audit/naming/ID conventions.

Expected refinements:

- Improve handling of XOR relationships.
- Improve guidance on hidden rows and partial uniqueness.
- Improve guidance on lookup tables vs enums.
- Improve guidance on audit columns based on project convention.
- Add project-specific examples only in references, not in the generic skill.

## Project 2: Another relational project

Choose a project with a different stack or domain, ideally Symfony Doctrine or Prisma.

Use cases to test:

- Different ORM conventions.
- Existing migration style.
- Different audit-column convention.
- Different ID strategy.
- Different soft-delete convention.
- Different enum/lookup-table pattern.

Expected refinements:

- Remove framework-specific assumptions.
- Add notes for ORM limitations.
- Improve portability of schema recommendations.

For each application trial, record:

```md
# Skill Trial Record

## Project

## Stack

## Schema change reviewed

## Questions the skill asked

## Bad design avoided

## Indexes/constraints added

## Where the skill was too strict

## Where the skill was too vague

## Changes made to the skill
```

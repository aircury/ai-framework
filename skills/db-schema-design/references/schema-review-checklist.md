# Schema Review Checklist

## Domain

- Does the schema match the Product Owner’s mental model?
- Are real concepts represented as tables?
- Is ownership clear?
- Is lifecycle clear?
- Are many-to-many tables explicitly named after the linked concepts?
- Are vague names avoided?

## Existing project conventions

- Naming style followed.
- ID strategy followed or intentionally challenged.
- Audit-column convention followed.
- Soft-delete/hide convention followed.
- Enum vs lookup-table convention checked.
- Index style checked.
- ORM/database limitations checked.

## Data quality

- Accuracy
- Completeness
- Conformance
- Consistency
- Timeliness
- Uniqueness
- Validity

## Relational design

- No business JSON unless justified.
- No business arrays unless justified.
- Lookup tables considered before enums.
- No unclear nullable XOR relationships.
- No unnecessary relationship cycles.
- Keys are non-null.
- Constraints enforce important rules.
- Natural/business primary keys are used only with clear justification.

## Performance

- Access patterns identified.
- Foreign keys indexed where useful.
- Search/filter columns indexed.
- Composite indexes match backend queries.
- No unnecessary partitioning.
- `bigint` considered for normal numeric columns that may grow.

## IDs

- Bigint vs UUID choice follows project needs.
- UUIDs are not treated as a security feature.
- Route permissions are not replaced by ID type.
- Human-copyable IDs use readable identifiers where appropriate.
- UUID version is researched for the project when UUID choice/version matters.

## Optional privacy/data minimization

- Personal data is only questioned when relevant.
- Data minimization does not make the model inconsistent or over-engineered.
- Purpose of sensitive/personal fields is clear.

## Migration

- Reason for change is understood.
- Backfill considered.
- Existing data quality considered.
- Rollback/risk noted.
- High-impact changes separated from minor theoretical improvements.

## Existing model review

- Only the most valuable 2–3 changes are prioritized.
- Migration cost is considered.
- The user is not pushed into a full rewrite unless clearly justified.

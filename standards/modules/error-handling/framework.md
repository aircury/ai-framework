## Error Handling

Errors are a first-class part of the system design. Handle expected failures deliberately and fail fast on bugs.

### Error Classification

- **Operational errors** are expected runtime failures such as invalid input, timeouts, unavailable dependencies, rate limits, or missing resources.
- **Programmer errors** are bugs such as broken invariants, impossible states, incorrect assumptions, or null access on required values.

### Required Handling Rules

- Validate external input at boundaries before domain or application logic consumes it.
- Handle operational errors explicitly near the boundary where they become meaningful.
- Return safe user-facing messages. Do not leak stack traces, SQL fragments, filesystem paths, secrets, or internal topology.
- Log enough internal context for diagnosis, but keep recovery logic separate from presentation logic.
- Treat programmer errors as defects. Surface them quickly, log them with context, and fix the root cause rather than masking them.

### Recovery Patterns

Use recovery only when the failure mode is expected and the operation semantics allow it.

- Retry transient failures with bounded attempts, backoff, and jitter where appropriate.
- Use fallback paths only when degraded behaviour is still correct and explicit.
- Use compensation for multi-step flows when partial completion would leave the system inconsistent.
- Do not retry non-idempotent operations blindly.

### Anti-Patterns

- Silent catch blocks.
- Returning generic success when a meaningful failure occurred.
- Converting programmer errors into normal control flow.
- Mixing validation, authorisation, and system failures into the same vague error response.
- Retrying without limits or without understanding failure semantics.

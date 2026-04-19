## Structured Logging

Logs are part of the product's operating surface. They must support debugging, correlation, and incident response without exposing sensitive data.

### Logging Format

- Prefer structured machine-readable events such as JSON objects.
- Use consistent field names across services and modules.
- Include request IDs, correlation IDs, job IDs, or equivalent identifiers whenever work crosses boundaries.
- Include the operation name, outcome, duration, and relevant domain context when available.

### Wide Event Preference

Prefer one context-rich event per meaningful operation or request over many scattered log lines.

Good examples of useful context:

- Correlation identifier
- Route, command, or use-case name
- Outcome and status
- Duration or latency
- Safe business context that explains impact

### Logging Safety Rules

- Never log passwords, API keys, tokens, credentials, secrets, or encryption material.
- Avoid raw request and response bodies unless they are explicitly sanitised and necessary.
- Redact or omit personal data unless it is required for diagnosis and approved by the product context.
- Keep stack traces in internal logs only when they are safe and useful.

### Logging Quality Rules

- Do not scatter unstructured `console.log` style debug statements through request paths.
- Use a consistent logger interface for the project.
- Distinguish durable operational events from temporary local debugging noise.
- Make logs searchable by outcome, boundary, and correlation identifier.

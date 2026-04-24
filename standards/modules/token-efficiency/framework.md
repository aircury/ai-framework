## Token Efficiency

This module makes terse communication available for project sessions without enabling it automatically.

- If a user wants terse responses for the current session, they can activate `caveman` explicitly with `caveman full`.
- Optimize for fewer output tokens without losing technical accuracy.
- Prefer short, direct answers over explanatory padding when the task is straightforward.
- Keep implementation details complete, but compress surrounding prose aggressively.
- If the user asks for more detail, examples, or a normal tone, expand the response immediately.

This module is reinforced by the external `caveman` skill, which is installed alongside the project configuration.

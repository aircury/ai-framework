## Token Efficiency

This module enables terse-by-default communication for project sessions.

- Load and apply the `caveman` skill at the start of each new session in this project.
- Optimize for fewer output tokens without losing technical accuracy.
- Prefer short, direct answers over explanatory padding when the task is straightforward.
- Keep implementation details complete, but compress surrounding prose aggressively.
- If the user asks for more detail, examples, or a normal tone, expand the response immediately.

This module is reinforced by the external `caveman` skill, which is installed alongside the project configuration.

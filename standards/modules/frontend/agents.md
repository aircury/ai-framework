- Use the `frontend-layout-extractor` skill to generate `specs/features/<name>/layout.md` capturing the structural requirements.
- Use the `frontend-experience-extractor` skill to generate `specs/features/<name>/experience.md` capturing behavioral and UX requirements.
- Use the `frontend-style-extractor` skill on the target frontend and maintain `specs/ui/style-guide.md` as the canonical record of what is already in use.
- Use the `frontend-ui-generator` skill to build the UI based on `layout.md`, `experience.md`, and the extracted `style-guide.md`.
- For substantial frontend work, read `specs/ui/frontend-workflow.md` before implementing.

- Maintain `specs/ui/style-guide.md` as the canonical source for all visual tokens and reusable patterns.
- Do not skip extraction, invent unsupported tokens, or hardcode values when the project already defines an equivalent token or primitive.
- For legacy replication: prioritize structural fidelity in `layout.md` and visual consistency in the final implementation.

- Use the `frontend-layout-extractor` skill to generate `specs/features/<name>/layout.md` capturing the structural requirements.
- Use the `frontend-experience-extractor` skill to generate `specs/features/<name>/experience.md` capturing behavioral and UX requirements.
- Use the `frontend-ui-generator` skill to build the UI based on both the `layout.md` and `experience.md` found in the feature folder.
- For substantial frontend work, read `specs/ui/frontend-workflow.md` before implementing.

- Maintain `specs/ui/style-guide.md` as the canonical source for all visual tokens.
- Do not skip extraction, invent unsupported tokens, or hardcode values when the project already defines an equivalent token or primitive.
- For legacy replication: prioritize structural fidelity in `layout.md` and visual consistency in the final implementation.

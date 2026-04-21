- Use the `frontend-layout-extractor` skill to generate `specs/features/<name>/layout.md` capturing the structural requirements.
- Use the `frontend-experience-extractor` skill to generate `specs/features/<name>/experience.md` capturing behavioral and UX requirements.
- Use the `frontend-ui-generator` skill to build the UI based on both the `layout.md` and `experience.md` found in the feature folder.

- Maintain `frontendRules/style-guide.md` as the canonical source for all visual tokens.
- For legacy replication: prioritize structural fidelity in `layout.md` and visual consistency in the final implementation.


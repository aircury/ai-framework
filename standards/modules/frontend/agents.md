- Use the `frontend-layout-extractor` skill to generate `specs/features/<name>/layout.md` before any implementation. Ensure "full field parity" without styling details.
- Use the `frontend-ui-generator` skill to build the UI based on the `layout.md` found in the feature folder and the project's design system.

- Maintain `frontendRules/style-guide.md` as the canonical source for all visual tokens.
- For legacy replication: prioritize structural fidelity in `layout.md` and visual consistency in the final implementation.


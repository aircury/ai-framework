import { describe, expect, it } from 'bun:test';
import { renderAgents, renderFramework } from './renderer';
import {
  FRAMEWORK,
  AGENTS,
  skills,
  generateAgents,
  generateFramework,
  generateOpencodeAgent,
} from './templates';

describe('templates', () => {
  describe('FRAMEWORK', () => {
    it('is a non-empty string', () => {
      expect(typeof FRAMEWORK).toBe('string');
      expect(FRAMEWORK.length).toBeGreaterThan(0);
    });

    it('contains core framework sections', () => {
      expect(FRAMEWORK).toContain('## Core Workflow Constitution');
      expect(FRAMEWORK).toContain('## Definition of Done');
    });

    it('matches the generated default profile', () => {
      expect(generateFramework()).toBe(FRAMEWORK);
      expect(renderFramework()).toBe(FRAMEWORK);
    });
  });

  describe('AGENTS', () => {
    it('is a non-empty string', () => {
      expect(typeof AGENTS).toBe('string');
      expect(AGENTS.length).toBeGreaterThan(0);
    });

    it('references FRAMEWORK.md', () => {
      expect(AGENTS).toContain('FRAMEWORK.md');
    });

    it('matches the generated default profile', () => {
      expect(generateAgents()).toBe(AGENTS);
      expect(renderAgents()).toBe(AGENTS);
    });
  });

  describe('skills', () => {
    it('contains all expected skills', () => {
      const expectedSkills = [
        'open-spec-apply',
        'open-spec-complete',
        'open-spec-explore',
        'open-spec-propose',
        'spec-kit-analyze',
        'spec-kit-checklist',
        'spec-kit-clarify',
        'spec-kit-implement',
        'spec-kit-plan',
        'spec-kit-specify',
        'spec-kit-tasks',
        'commit-changes',
      ];

      for (const skill of expectedSkills) {
        expect(skills).toHaveProperty(skill);
      }
    });

    it('has non-empty content for every skill', () => {
      for (const [name, content] of Object.entries(skills)) {
        expect(content.length, `skill "${name}" is empty`).toBeGreaterThan(0);
      }
    });
  });

  describe('generateOpencodeAgent', () => {
    it('includes opencode frontmatter', () => {
      const output = generateOpencodeAgent();
      expect(output).toContain('---');
      expect(output).toContain('name: Aircury Agent');
      expect(output).toContain('mode: primary');
    });

    it('embeds FRAMEWORK.md content', () => {
      const output = generateOpencodeAgent();
      expect(output).toContain(FRAMEWORK);
    });

    it('is deterministic', () => {
      expect(generateOpencodeAgent()).toBe(generateOpencodeAgent());
    });
  });

  describe('module-aware generation', () => {
    it('adds ADR guidance only when the ADR module is enabled', () => {
      expect(generateFramework(['decision-records'])).toContain('## Architecture Decision Records');
      expect(generateFramework([])).not.toContain('## Architecture Decision Records');
    });

    it('adds TDD guidance only when the TDD module is enabled', () => {
      expect(generateFramework(['tdd'])).toContain('## TDD Workflow');
      expect(generateFramework([])).not.toContain('## TDD Workflow');
    });

    it('adds architecture rules only when architecture modules are enabled', () => {
      expect(generateFramework(['hexagonal-architecture', 'ddd'])).toContain(
        '## Non-Negotiable Architecture Rules',
      );
      expect(generateFramework([])).not.toContain('## Non-Negotiable Architecture Rules');
    });

    it('adds ADR reading instructions to AGENTS.md only when enabled', () => {
      expect(generateAgents(['decision-records'])).toContain('specs/decisions/');
      expect(generateAgents([])).not.toContain('specs/decisions/');
    });
  });
});

import { describe, expect, it } from 'bun:test';
import { FRAMEWORK, AGENTS, skills, generateOpencodeAgent } from './templates';

describe('templates', () => {
  describe('FRAMEWORK', () => {
    it('is a non-empty string', () => {
      expect(typeof FRAMEWORK).toBe('string');
      expect(FRAMEWORK.length).toBeGreaterThan(0);
    });

    it('contains core framework sections', () => {
      expect(FRAMEWORK).toContain('## TDD Workflow');
      expect(FRAMEWORK).toContain('## Non-Negotiable Architecture Rules');
      expect(FRAMEWORK).toContain('## Definition of Done');
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
  });

  describe('skills', () => {
    const expectedSkills = [
      'open-spec/apply',
      'open-spec/complete',
      'open-spec/explore',
      'open-spec/propose',
      'spec-kit/analyze',
      'spec-kit/checklist',
      'spec-kit/clarify',
      'spec-kit/implement',
      'spec-kit/plan',
      'spec-kit/specify',
      'spec-kit/tasks',
    ];

    it('contains all expected skills', () => {
      for (const skill of expectedSkills) {
        expect(skills).toHaveProperty(skill);
      }
    });

    it('has non-empty content for every skill', () => {
      for (const [name, content] of Object.entries(skills)) {
        expect(content.length, `skill "${name}" is empty`).toBeGreaterThan(0);
      }
    });

    it(`has exactly ${expectedSkills.length} skills`, () => {
      expect(Object.keys(skills)).toHaveLength(expectedSkills.length);
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
});

import { describe, expect, it } from 'vitest';
import { editableContent } from './content';
describe('versioned report editor projection', () => {
  it('opens legacy content with blank optional sections and never copies server authority into a draft', () => {
    const stored = {
      examination: 'Exam',
      findings: 'Findings',
      impression: 'Impression',
      language: 'en' as const,
      id: 'server-id',
      authorId: 'server-author',
      indication: null,
      technique: null,
      provenance: { actorId: 'server-author' },
    };
    const content = editableContent(stored);
    expect(content.indication).toBe('');
    expect(content.technique).toBe('');
    expect(Object.keys(content).sort()).toEqual(
      ['examination', 'findings', 'impression', 'language', 'indication', 'technique'].sort(),
    );
  });
  it('retains optional sections and does not translate clinical content', () => {
    const content = editableContent({
      examination: 'Ekzaminim',
      findings: 'Gjetje',
      impression: 'Opinion',
      language: 'sq',
      indication: 'Indikacion',
      technique: 'Teknike',
    });
    expect(content.indication).toBe('Indikacion');
    expect(content.technique).toBe('Teknike');
    expect(content.language).toBe('sq');
    expect(content.findings).toBe('Gjetje');
  });
  it('creates an empty manual workspace without inferred referral or findings', () => {
    expect(editableContent()).toEqual({
      examination: '',
      findings: '',
      impression: '',
      language: 'en',
      indication: '',
      technique: '',
    });
  });
});

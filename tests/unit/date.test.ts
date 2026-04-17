import { describe, expect, it } from 'vitest';
import { formatMonth } from '@/lib/date';

describe('formatMonth', () => {
  it('passes through valid YYYY-MM', () => {
    expect(formatMonth('2026-04')).toBe('2026-04');
  });

  it('extracts YYYY-MM from a full ISO date', () => {
    expect(formatMonth('2026-04-17')).toBe('2026-04');
  });

  it('extracts YYYY-MM from ISO datetime', () => {
    expect(formatMonth('2026-04-17T10:30:00Z')).toBe('2026-04');
  });

  it('returns input unchanged when not parseable', () => {
    expect(formatMonth('unknown')).toBe('unknown');
  });
});

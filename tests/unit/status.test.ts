import { describe, expect, it } from 'vitest';
import { statusMeta } from '@/lib/status';

describe('statusMeta', () => {
  it('returns green + pulse for ACTIVE', () => {
    const m = statusMeta('ACTIVE');
    expect(m.color).toBe('#22c55e');
    expect(m.pulse).toBe(true);
    expect(m.label).toBe('ACTIVE');
  });

  it('returns amber + pulse for WIP', () => {
    const m = statusMeta('WIP');
    expect(m.color).toBe('#f59e0b');
    expect(m.pulse).toBe(true);
    expect(m.label).toBe('WIP');
  });

  it('returns gray + no pulse for ARCHIVED', () => {
    const m = statusMeta('ARCHIVED');
    expect(m.color).toBe('#6b7280');
    expect(m.pulse).toBe(false);
    expect(m.label).toBe('ARCHIVED');
  });
});

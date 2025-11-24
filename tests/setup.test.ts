import { describe, it, expect, beforeEach } from 'vitest';
import { resetMocks } from './setup';

describe('Test Setup Utilities', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('should configure fetch headers via resetMocks', async () => {
    const response = await (global.fetch as any)('https://example.com');
    expect(response.headers.get('content-type')).toBe('application/json');
    expect(response.headers.get('unknown-header')).toBeNull();
  });
});

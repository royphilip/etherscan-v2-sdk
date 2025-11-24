import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EtherscanClient } from '../src/client';
import { APIError, RateLimitError, ValidationError, EtherscanError, UnsupportedChainError, PlanUpgradeRequired } from '../src/core/errors';
import { resetMocks, mockFetchResponse, mockResponses, TEST_ADDRESSES } from './setup';

describe('Error Handling', () => {
  let client: EtherscanClient;

  beforeEach(() => {
    resetMocks();
    client = new EtherscanClient({
      apiKey: 'test-key',
    });
  });

  describe('API Errors', () => {
    it('should throw APIError for invalid API key', async () => {
      mockFetchResponse(mockResponses.error);

      await expect(client.account.getBalance(TEST_ADDRESSES.VITALIK)).rejects.toThrow(APIError);
    });

    it('should throw RateLimitError for rate limit exceeded', async () => {
      mockFetchResponse(mockResponses.rateLimit);

      await expect(client.account.getBalance(TEST_ADDRESSES.VITALIK)).rejects.toThrow(
        RateLimitError
      );
    });
  });

  describe('Network Errors', () => {
    it('should throw EtherscanError for network failures', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(client.account.getBalance(TEST_ADDRESSES.VITALIK)).rejects.toThrow(
        EtherscanError
      );
    });

    it('should throw EtherscanError for HTTP errors', async () => {
      mockFetchResponse({ error: 'Server error' }, 500);

      await expect(client.account.getBalance(TEST_ADDRESSES.VITALIK)).rejects.toThrow(
        EtherscanError
      );
    });
  });

  describe('Validation Errors', () => {
    it('should throw ValidationError for invalid BigInt', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: 'invalid-bigint-string',
      });

      await expect(client.account.getBalance(TEST_ADDRESSES.VITALIK)).rejects.toThrow(
        'Invalid BigInt value'
      );
    });

    it('should throw ValidationError for null response data', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: null, // Null result when string expected
      });

      await expect(client.account.getBalance(TEST_ADDRESSES.VITALIK)).rejects.toThrow(
        ValidationError
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty results gracefully', async () => {
      mockFetchResponse(mockResponses.noTransactions);

      const result = await client.account.getTxList({ address: TEST_ADDRESSES.VITALIK });
      expect(result).toEqual([]);
    });

    it('should handle null/undefined parameters', async () => {
      mockFetchResponse(mockResponses.transactions);

      // Should not throw with undefined parameters
      const result = await client.account.getTxList({
        address: TEST_ADDRESSES.VITALIK,
        startblock: undefined,
        endblock: undefined,
        page: undefined,
        offset: undefined,
        sort: undefined,
      });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('APIError in Production', () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
      originalEnv = process.env.NODE_ENV;
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should hide result in production mode', () => {
      process.env.NODE_ENV = 'production';
      const error = new APIError('API key invalid', { details: 'secret-data' });

      const result = error.result;
      expect(result).toEqual({ error: 'API error occurred' });
      expect(result).not.toHaveProperty('details');
    });

    it('should show result in development mode', () => {
      process.env.NODE_ENV = 'development';
      const rawData = { details: 'debug-info' };
      const error = new APIError('Test error', rawData);

      const result = error.result;
      expect(result).toEqual(rawData);
    });

    it('should sanitize sensitive data in message', () => {
      const error = new APIError(
        'Error with API key abc123abc123abc123abc123abc123ab and IP 192.168.1.1 and path /some/file/path',
        {}
      );

      expect(error.message).toContain('[REDACTED]');
      expect(error.message).toContain('[IP]');
      expect(error.message).toContain('[PATH]');
      expect(error.message).not.toContain('192.168.1.1');
      expect(error.message).not.toContain('/some/file');
    });

    it('should exclude stack and result in production toJSON', () => {
      process.env.NODE_ENV = 'production';
      const error = new APIError('Production error', { sensitive: 'data' });

      const json = error.toJSON();
      expect(json).toHaveProperty('name');
      expect(json).toHaveProperty('message');
      expect(json).not.toHaveProperty('stack');
      expect(json).not.toHaveProperty('result');
    });

    it('should include stack and result in development toJSON', () => {
      process.env.NODE_ENV = 'development';
      const rawData = { debug: 'info' };
      const error = new APIError('Dev error', rawData);

      const json = error.toJSON();
      expect(json).toHaveProperty('stack');
      expect(json).toHaveProperty('result');
      expect(json.result).toEqual(rawData);
    });
  });

  describe('UnsupportedChainError', () => {
    it('should create error with proper message and code', () => {
      const error = new UnsupportedChainError(999, 'getBeaconStats');

      expect(error.message).toContain('getBeaconStats');
      expect(error.message).toContain('999');
      expect(error.code).toBe('UNSUPPORTED_CHAIN');
      expect(error.status).toBe(400);
    });

    it('should be throwable and catchable', () => {
      expect(() => {
        throw new UnsupportedChainError(56, 'testMethod');
      }).toThrow(UnsupportedChainError);
    });
  });

  describe('Plan Upgrade Errors', () => {
    it('should identify plan upgrade requirements', () => {
      const error = new PlanUpgradeRequired('Upgrade to access this feature', {});
      expect(error.status).toBe(402);
      expect(error.code).toBe('PLAN_UPGRADE_REQUIRED');
      expect(error.message).toContain('Etherscan API Plan Upgrade Required');
    });

    it('should throw PlanUpgradeRequired when API asks for an upgrade', async () => {
      mockFetchResponse({
        status: '0',
        message: 'NOTOK',
        result: 'Please upgrade your plan to access this endpoint.',
      });

      await expect(client.account.getBalance(TEST_ADDRESSES.VITALIK)).rejects.toThrow(
        PlanUpgradeRequired
      );
    });
  });
});

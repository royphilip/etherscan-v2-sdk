import { describe, it, expect, beforeEach } from 'vitest';
import { EtherscanClient } from '../src/client';
import { APIError, RateLimitError, ValidationError, EtherscanError } from '../src/core/errors';
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
});

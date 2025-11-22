import { describe, it, expect, beforeEach } from 'vitest';
import { EtherscanClient } from '../src/client';
import { resetMocks, mockFetchResponse } from './setup';
import { TEST_ADDRESSES } from './setup';

/**
 * Performance benchmarks for caching and API operations
 */
describe('Performance Benchmarks', () => {
  let client: EtherscanClient;

  beforeEach(() => {
    resetMocks();
    client = new EtherscanClient({
      apiKey: 'test-key',
    });
  });

  describe('Caching Performance', () => {
    it('should demonstrate cache performance improvement', async () => {
      // Mock API response
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000000',
      });

      const iterations = 100;

      // First request (cache miss)
      const startTime = performance.now();
      const result1 = await client.account.getBalance(TEST_ADDRESSES.VITALIK);
      const firstRequestTime = performance.now() - startTime;

      // Subsequent requests (cache hits)
      const cacheStartTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        await client.account.getBalance(TEST_ADDRESSES.VITALIK);
      }
      const cacheTime = performance.now() - cacheStartTime;

      // Verify results
      expect(result1).toBe(1000000000000000000000n);

      // Performance assertions
      expect(firstRequestTime).toBeGreaterThan(0);
      expect(cacheTime).toBeGreaterThan(0);
      expect(cacheTime / iterations).toBeLessThan(firstRequestTime * 0.1); // Cache should be 10x faster

      // Only one API call should have been made
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should benchmark cache size limits', async () => {
      // Set small cache size for testing
      client.updateCacheConfig({ maxSize: 3 });

      // Make 5 different requests
      for (let i = 0; i < 5; i++) {
        mockFetchResponse({
          status: '1',
          message: 'OK',
          result: `100000000000000000000${i}`,
        });

        await client.account.getBalance(TEST_ADDRESSES.VITALIK);
      }

      const stats = client.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(3); // Should respect maxSize
      expect(stats.maxSize).toBe(3);
    });

    it('should benchmark cache TTL expiration', async () => {
      // Set short TTL
      client.updateCacheConfig({ defaultTtl: 100 }); // 100ms

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000000',
      });

      // First request
      await client.account.getBalance(TEST_ADDRESSES.VITALIK);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Second request should hit API again
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '2000000000000000000000',
      });

      const result = await client.account.getBalance(TEST_ADDRESSES.VITALIK);
      expect(result).toBe(2000000000000000000000n);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Request Deduplication Performance', () => {
    it('should benchmark request deduplication efficiency', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000000',
      });

      const concurrentRequests = 50;

      // Make many concurrent requests
      const startTime = performance.now();
      const requests = Array.from({ length: concurrentRequests }, () =>
        client.account.getBalance(TEST_ADDRESSES.VITALIK)
      );

      const results = await Promise.all(requests);
      const totalTime = performance.now() - startTime;

      // All results should be identical
      expect(results.every(r => r === 1000000000000000000000n)).toBe(true);

      // Only one API call should have been made
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Performance check - should complete quickly despite concurrency
      expect(totalTime).toBeLessThan(1000); // Less than 1 second for 50 concurrent requests
    });
  });

  describe('Interceptor Performance', () => {
    it('should benchmark interceptor overhead', async () => {
      // Add multiple interceptors
      client.addRequestInterceptor(params => ({ ...params, req1: 'true' }));
      client.addRequestInterceptor(params => ({ ...params, req2: 'true' }));
      client.addResponseInterceptor(result => result);
      client.addResponseInterceptor(result => result);

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000000',
      });

      const iterations = 10;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        await client.account.getBalance(TEST_ADDRESSES.VITALIK);
      }

      const totalTime = performance.now() - startTime;
      const avgTime = totalTime / iterations;

      // Should still be reasonably fast with interceptors
      expect(avgTime).toBeLessThan(100); // Less than 100ms per request
    });
  });

  describe('Memory Usage Benchmarks', () => {
    it('should monitor cache memory usage', async () => {
      const initialStats = client.getCacheStats();

      // Add many items to cache
      for (let i = 0; i < 100; i++) {
        mockFetchResponse({
          status: '1',
          message: 'OK',
          result: `100000000000000000000${i}`,
        });

        await client.account.getBalance(TEST_ADDRESSES.VITALIK);
      }

      const finalStats = client.getCacheStats();

      expect(finalStats.size).toBeGreaterThan(initialStats.size);
      expect(finalStats.size).toBeLessThanOrEqual(finalStats.maxSize);
    });
  });

  describe('Rate Limiting Performance', () => {
    it('should handle rate limiting gracefully', async () => {
      // Create client with low rate limit for testing
      const slowClient = new EtherscanClient({
        apiKey: 'slow-test-key',
        rateLimit: 2, // 2 requests per second
      });

      const requests = 5;

      // Mock responses
      for (let i = 0; i < requests; i++) {
        mockFetchResponse({
          status: '1',
          message: 'OK',
          result: `100000000000000000000${i}`,
        });
      }

      const startTime = performance.now();

      // Make requests that should be rate limited
      const addresses = [TEST_ADDRESSES.VITALIK, TEST_ADDRESSES.CONTRACT, TEST_ADDRESSES.ZERO, TEST_ADDRESSES.VITALIK, TEST_ADDRESSES.CONTRACT];
      for (let i = 0; i < requests; i++) {
        await slowClient.account.getBalance(addresses[i]);
      }

      const totalTime = performance.now() - startTime;

      // Should take at least some time due to rate limiting
      expect(totalTime).toBeGreaterThan(1000); // At least 1 second for 5 requests at 2/sec
    });
  });

  describe('Concurrent Operations Performance', () => {
    it('should handle mixed operations efficiently', async () => {
      // Mix of different operations
      const operations = [
        () => client.account.getBalance(TEST_ADDRESSES.VITALIK),
        () => client.account.getTxList({ address: TEST_ADDRESSES.VITALIK }),
        () => client.stats.getEthSupply(),
        () => client.gasTracker.getGasOracle(),
      ];

      // Mock all responses
      mockFetchResponse({ status: '1', message: 'OK', result: '1000000000000000000000' });
      mockFetchResponse({ status: '1', message: 'OK', result: [] });
      mockFetchResponse({ status: '1', message: 'OK', result: '120000000000000000000000000' });
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: {
          LastBlock: '18500000',
          SafeGasPrice: '20',
          ProposeGasPrice: '22',
          FastGasPrice: '25',
          suggestBaseFee: '20',
          gasUsedRatio: '0.5,0.6,0.7',
        },
      });

      const startTime = performance.now();

      // Execute operations concurrently
      await Promise.all(operations.map(op => op()));

      const totalTime = performance.now() - startTime;

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(2000); // Less than 2 seconds
    });
  });
});

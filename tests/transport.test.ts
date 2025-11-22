import { describe, it, expect, beforeEach, _vi } from 'vitest';
import { Transport } from '../src/core/transport';
import { EvmChainId } from '../src/core/types';
import { z } from 'zod';
import { resetMocks, mockFetchResponse, _mockResponses } from './setup';

describe('Transport', () => {
  let transport: Transport;

  beforeEach(() => {
    resetMocks();
    transport = new Transport(EvmChainId.MAINNET, 'test-api-key', 10);
  });

  describe('initialization', () => {
    it('should initialize with correct parameters', () => {
      expect(transport.chainId).toBe(EvmChainId.MAINNET);
    });

    it('should use default rate limit', () => {
      const defaultTransport = new Transport(EvmChainId.MAINNET, 'test-key');
      expect(defaultTransport).toBeDefined();
    });
  });

  describe('get method', () => {
    const testSchema = z.object({
      test: z.string(),
    });

    it('should make correct API call', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: { test: 'value' },
      });

      const result = await transport.get({ module: 'test', action: 'test' }, testSchema);

      expect(result).toEqual({ test: 'value' });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.etherscan.io/v2/api'),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });

    it('should include chain ID in request', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: { test: 'value' },
      });

      await transport.get({ module: 'test', action: 'test' }, testSchema);

      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(callUrl).toContain(`chainid=${EvmChainId.MAINNET}`);
    });

    it('should include API key in request', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: { test: 'value' },
      });

      await transport.get({ module: 'test', action: 'test' }, testSchema);

      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(callUrl).toContain('apikey=test-api-key');
    });

    it('should include request parameters', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: { test: 'value' },
      });

      await transport.get(
        {
          module: 'account',
          action: 'balance',
          address: '0x123',
          tag: 'latest',
        },
        testSchema
      );

      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(callUrl).toContain('module=account');
      expect(callUrl).toContain('action=balance');
      expect(callUrl).toContain('address=0x123');
      expect(callUrl).toContain('tag=latest');
    });

    it('should filter out undefined parameters', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: { test: 'value' },
      });

      await transport.get(
        {
          module: 'test',
          action: 'test',
          defined: 'value',
          undefined: undefined,
        },
        testSchema
      );

      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(callUrl).toContain('defined=value');
      expect(callUrl).not.toContain('undefined');
    });

    it('should handle BigInt transformation', async () => {
      const bigIntSchema = z.string().transform(BigInt);

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000',
      });

      const result = await transport.get({ module: 'test' }, bigIntSchema);

      expect(result).toBe(1000000000000000000n);
    });

    it('should handle array responses', async () => {
      const arraySchema = z.array(z.string());

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: ['item1', 'item2'],
      });

      const result = await transport.get({ module: 'test' }, arraySchema);

      expect(result).toEqual(['item1', 'item2']);
    });
  });

  describe('rate limiting', () => {
    it('should respect rate limiting', async () => {
      // Create transport with very low rate limit for testing
      const slowTransport = new Transport(EvmChainId.MAINNET, 'slow-test-key', 1); // 1 req/sec

      // Mock two responses
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: 'test1',
      });
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: 'test2',
      });

      const startTime = Date.now();

      // Make two requests
      await slowTransport.get({ module: 'test1' }, z.string());
      await slowTransport.get({ module: 'test2' }, z.string());

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should take at least 1 second due to rate limiting
      expect(duration).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('caching', () => {
    const testSchema = z.object({
      test: z.string(),
    });

    let transport: Transport;

    beforeEach(() => {
      resetMocks();
      transport = new Transport(EvmChainId.MAINNET, 'test-api-key', 10);
      transport.clearCache();
    });

    beforeEach(() => {
      // Clear cache before each test
      transport.clearCache();
    });

    it('should cache responses', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: { test: 'cached-value' },
      });

      // First request should hit API
      const result1 = await transport.get({ module: 'test', action: 'cache' }, testSchema);
      expect(result1).toEqual({ test: 'cached-value' });
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second request should use cache
      const result2 = await transport.get({ module: 'test', action: 'cache' }, testSchema);
      expect(result2).toEqual({ test: 'cached-value' });
      expect(global.fetch).toHaveBeenCalledTimes(1); // Still 1 call
    });

    it('should respect cache TTL', async () => {
      // Set short TTL for testing
      transport.updateCacheConfig({ defaultTtl: 100 }); // 100ms

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: { test: 'ttl-test' },
      });

      // First request
      await transport.get({ module: 'test', action: 'ttl' }, testSchema);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Second request should hit API again
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: { test: 'ttl-test-2' },
      });

      const result = await transport.get({ module: 'test', action: 'ttl' }, testSchema);
      expect(result).toEqual({ test: 'ttl-test-2' });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should allow cache disabling', async () => {
      transport.updateCacheConfig({ enabled: false });

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: { test: 'no-cache-1' },
      });

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: { test: 'no-cache-2' },
      });

      // Both requests should hit API
      const result1 = await transport.get({ module: 'test', action: 'no-cache' }, testSchema);
      const result2 = await transport.get({ module: 'test', action: 'no-cache' }, testSchema);

      expect(result1).toEqual({ test: 'no-cache-1' });
      expect(result2).toEqual({ test: 'no-cache-2' });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should clear cache', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: { test: 'clear-test-1' },
      });

      await transport.get({ module: 'test', action: 'clear' }, testSchema);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      transport.clearCache();

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: { test: 'clear-test-2' },
      });

      const result = await transport.get({ module: 'test', action: 'clear' }, testSchema);
      expect(result).toEqual({ test: 'clear-test-2' });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should respect max cache size', async () => {
      transport.updateCacheConfig({ maxSize: 2 });

      // Fill cache to max
      mockFetchResponse({ status: '1', message: 'OK', result: { test: 'item1' } });
      await transport.get({ module: 'test', action: 'item1' }, testSchema);

      mockFetchResponse({ status: '1', message: 'OK', result: { test: 'item2' } });
      await transport.get({ module: 'test', action: 'item2' }, testSchema);

      // Third item should evict first
      mockFetchResponse({ status: '1', message: 'OK', result: { test: 'item3' } });
      await transport.get({ module: 'test', action: 'item3' }, testSchema);

      expect(global.fetch).toHaveBeenCalledTimes(3);

      // Request first item again - should hit API since it was evicted
      mockFetchResponse({ status: '1', message: 'OK', result: { test: 'item1' } });
      await transport.get({ module: 'test', action: 'item1' }, testSchema);
      expect(global.fetch).toHaveBeenCalledTimes(4);
    });

    it('should return cache stats', () => {
      const stats = transport.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('enabled');
    });
  });

  describe('request deduplication', () => {
    const testSchema = z.object({
      test: z.string(),
    });

    let transport: Transport;

    beforeEach(() => {
      resetMocks();
      transport = new Transport(EvmChainId.MAINNET, 'test-api-key', 10);
    });

    it('should deduplicate concurrent requests', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: { test: 'deduped' },
      });

      // Make multiple concurrent requests
      const promises = [
        transport.get({ module: 'test', action: 'dedupe' }, testSchema),
        transport.get({ module: 'test', action: 'dedupe' }, testSchema),
        transport.get({ module: 'test', action: 'dedupe' }, testSchema),
      ];

      const results = await Promise.all(promises);

      // All should return the same result
      expect(results).toEqual([{ test: 'deduped' }, { test: 'deduped' }, { test: 'deduped' }]);

      // But only one API call should have been made
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle deduplication with different params separately', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: { test: 'result1' },
      });

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: { test: 'result2' },
      });

      // Different params should not be deduped
      const result1 = await transport.get({ module: 'test', action: 'diff1' }, testSchema);
      const result2 = await transport.get({ module: 'test', action: 'diff2' }, testSchema);

      expect(result1).toEqual({ test: 'result1' });
      expect(result2).toEqual({ test: 'result2' });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('interceptors', () => {
    const testSchema = z.object({
      test: z.string(),
    });

    let transport: Transport;

    beforeEach(() => {
      resetMocks();
      transport = new Transport(EvmChainId.MAINNET, 'test-api-key', 10);
      transport.clearInterceptors();
    });

    it('should apply request interceptors', async () => {
      transport.addRequestInterceptor(params => ({
        ...params,
        intercepted: 'true',
      }));

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: { test: 'intercepted' },
      });

      await transport.get({ module: 'test', action: 'intercept' }, testSchema);

      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(callUrl).toContain('intercepted=true');
    });

    it('should apply response interceptors', async () => {
      transport.addResponseInterceptor((response: any) => ({
        ...response,
        modified: true,
      }));

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: { test: 'original' },
      });

      const result = await transport.get({ module: 'test', action: 'response' }, testSchema);

      expect(result).toEqual({
        test: 'original',
        modified: true,
      });
    });

    it('should apply multiple interceptors in order', async () => {
      transport.addRequestInterceptor(params => ({
        ...params,
        step1: 'done',
      }));

      transport.addRequestInterceptor(params => ({
        ...params,
        step2: 'done',
      }));

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: { test: 'multiple' },
      });

      await transport.get({ module: 'test', action: 'multiple' }, testSchema);

      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(callUrl).toContain('step1=done');
      expect(callUrl).toContain('step2=done');
    });

    it('should clear interceptors', async () => {
      transport.addRequestInterceptor(params => ({
        ...params,
        shouldNotAppear: 'true',
      }));

      transport.clearInterceptors();

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: { test: 'cleared' },
      });

      await transport.get({ module: 'test', action: 'cleared' }, testSchema);

      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(callUrl).not.toContain('shouldNotAppear');
    });
  });
});

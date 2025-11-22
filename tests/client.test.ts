import { describe, it, expect, beforeEach } from 'vitest';
import { EtherscanClient } from '../src/client';
import { EvmChainId } from '../src/core/types';
import { resetMocks, _mockFetchResponse, _mockResponses } from './setup';

describe('EtherscanClient', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('initialization', () => {
    it('should initialize with API key from options', () => {
      const client = new EtherscanClient({
        apiKey: 'test-key',
      });

      expect(client).toBeDefined();
      expect(client.account).toBeDefined();
      expect(client.contract).toBeDefined();
      expect(client.transaction).toBeDefined();
    });

    it('should initialize with API key from environment', () => {
      const client = new EtherscanClient();

      expect(client).toBeDefined();
    });

    it('should throw error without API key', () => {
      // Temporarily remove env var
      const originalEnv = process.env.ETHERSCAN_API_KEY;
      delete process.env.ETHERSCAN_API_KEY;

      expect(() => new EtherscanClient()).toThrow('API Key is required');

      // Restore env var
      process.env.ETHERSCAN_API_KEY = originalEnv;
    });

    it('should use default chain (MAINNET) when not specified', () => {
      const client = new EtherscanClient({
        apiKey: 'test-key',
      });

      expect(client).toBeDefined();
    });

    it('should accept custom chain ID', () => {
      const client = new EtherscanClient({
        apiKey: 'test-key',
        chain: EvmChainId.SEPOLIA,
      });

      expect(client).toBeDefined();
    });

    it('should accept custom rate limit', () => {
      const client = new EtherscanClient({
        apiKey: 'test-key',
        rateLimit: 10,
      });

      expect(client).toBeDefined();
    });
  });

  describe('modules', () => {
    let client: EtherscanClient;

    beforeEach(() => {
      client = new EtherscanClient({
        apiKey: 'test-key',
      });
    });

    it('should have account module', () => {
      expect(client.account).toBeDefined();
      expect(typeof client.account.getBalance).toBe('function');
      expect(typeof client.account.getTxList).toBe('function');
    });

    it('should have contract module', () => {
      expect(client.contract).toBeDefined();
      expect(typeof client.contract.getAbi).toBe('function');
      expect(typeof client.contract.getSourceCode).toBe('function');
    });

    it('should have transaction module', () => {
      expect(client.transaction).toBeDefined();
      expect(typeof client.transaction.getStatus).toBe('function');
      expect(typeof client.transaction.getReceiptStatus).toBe('function');
    });

    it('should have l2 module', () => {
      expect(client.l2).toBeDefined();
      expect(typeof client.l2.getTxnBridge).toBe('function');
    });
  });

  describe('cache management', () => {
    let client: EtherscanClient;

    beforeEach(() => {
      client = new EtherscanClient({
        apiKey: 'test-key',
      });
    });

    it('should expose cache stats', () => {
      const stats = client.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('enabled');
    });

    it('should allow cache clearing', () => {
      expect(() => client.clearCache()).not.toThrow();
    });

    it('should allow cache config updates', () => {
      expect(() => client.updateCacheConfig({ enabled: false })).not.toThrow();
      expect(() => client.updateCacheConfig({ maxSize: 500 })).not.toThrow();
      expect(() => client.updateCacheConfig({ defaultTtl: 10000 })).not.toThrow();
    });

    it('should allow interceptor management', () => {
      expect(() => client.addRequestInterceptor(params => params)).not.toThrow();
      expect(() => client.addResponseInterceptor(response => response)).not.toThrow();
      expect(() => client.clearInterceptors()).not.toThrow();
    });

    it('should throw when disposed', async () => {
      await client.dispose();

      expect(() => client.getCacheStats()).toThrow('Client has been disposed');
      expect(() => client.clearCache()).toThrow('Client has been disposed');
      expect(() => client.updateCacheConfig({})).toThrow('Client has been disposed');
      expect(() => client.addRequestInterceptor(params => params)).toThrow(
        'Client has been disposed'
      );
      expect(() => client.addResponseInterceptor(response => response)).toThrow(
        'Client has been disposed'
      );
      expect(() => client.clearInterceptors()).toThrow('Client has been disposed');
    });
  });
});

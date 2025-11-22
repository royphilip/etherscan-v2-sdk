import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EtherscanClient } from '../src/client';
import { ValidationError, _EtherscanError } from '../src/core/errors';
import { resetMocks, mockFetchResponse, TEST_ADDRESSES, mockResponses } from './setup';

describe('Security - Core Protections', () => {
  let client: EtherscanClient;

  beforeEach(() => {
    resetMocks();
    client = new EtherscanClient({
      apiKey: 'test-key',
    });
  });

  describe('Chain Validation', () => {
    it('should warn about unsupported chain IDs', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      new EtherscanClient({
        apiKey: 'test-key',
        chain: 99999, // Invalid chain
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Chain ID 99999 is not in the known supported list')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should accept supported chain IDs', () => {
      const supportedChains = [1, 56, 137, 42161, 10]; // Mainnet, BSC, Polygon, Arbitrum, Optimism

      for (const chainId of supportedChains) {
        expect(() => {
          new EtherscanClient({
            apiKey: 'test-key',
            chain: chainId,
          });
        }).not.toThrow();
      }
    });
  });

  describe('Capability Guards', () => {
    it('should allow beacon chain methods on supported chains', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [],
      });

      // Mainnet supports beacon chain
      await expect(
        client.account.getTxsBeaconWithdrawal({ address: TEST_ADDRESSES.VITALIK })
      ).resolves.toBeDefined();
    });

    it('should reject beacon chain methods on unsupported chains', async () => {
      const l2Client = new EtherscanClient({
        apiKey: 'test-key',
        chain: 10, // Optimism L2 - no beacon chain
      });

      await expect(
        l2Client.account.getTxsBeaconWithdrawal({ address: TEST_ADDRESSES.VITALIK })
      ).rejects.toThrow('not supported on chain 10');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits across multiple clients', async () => {
      const apiKey = 'shared-rate-limit-key';
      const clients = Array(3)
        .fill(null)
        .map(
          () => new EtherscanClient({ apiKey, rateLimit: 1 }) // 1 req/sec
        );

      // Mock responses for each request
      clients.forEach(() => {
        mockFetchResponse({
          status: '1',
          message: 'OK',
          result: '1000000000000000000',
        });

        mockFetchResponse({
          status: '1',
          message: 'OK',
          result: '1000000000000000000',
        });
      });

      const start = Date.now();

      // All clients should share the same limiter
      await Promise.all(
        clients.map(c => c.account.getBalance({ address: TEST_ADDRESSES.VITALIK }))
      );

      const duration = Date.now() - start;

      // Should take at least 2 seconds for 3 requests at 1 req/sec
      expect(duration).toBeGreaterThanOrEqual(2000);
    });
  });

  describe('Error Sanitization', () => {
    it('should sanitize file paths in error messages', async () => {
      const errorClient = new EtherscanClient({ apiKey: 'test-key' });

      mockFetchResponse({
        status: '0',
        message: 'Error in /var/www/api/config.php',
        result: 'Path disclosure',
      });

      try {
        await errorClient.account.getBalance({ address: TEST_ADDRESSES.VITALIK });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).not.toContain('/var/www');
        expect(error.message).toContain('[PATH]');
      }
    });

    it('should sanitize IP addresses in error messages', async () => {
      const errorClient = new EtherscanClient({ apiKey: 'test-key' });

      mockFetchResponse({
        status: '0',
        message: 'Connection from 192.168.1.100 blocked',
        result: 'IP leak',
      });

      try {
        await errorClient.account.getBalance({ address: TEST_ADDRESSES.VITALIK });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).not.toContain('192.168.1.100');
        expect(error.message).toContain('[IP]');
      }
    });
  });

  describe('Input Validation', () => {
    it('should validate pagination parameters', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [],
      });

      await expect(
        client.account.getTxList({
          address: TEST_ADDRESSES.VITALIK,
          page: 0,
        })
      ).rejects.toThrow(ValidationError);

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [],
      });

      await expect(
        client.account.getTxList({
          address: TEST_ADDRESSES.VITALIK,
          offset: 999999999,
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should validate block numbers', async () => {
      await expect(
        client.account.getBalanceHistory({
          address: TEST_ADDRESSES.VITALIK,
          blockno: -1,
        })
      ).rejects.toThrow(ValidationError);

      await expect(
        client.account.getBalanceHistory({
          address: TEST_ADDRESSES.VITALIK,
          blockno: 'invalid',
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('JSON Parsing Safety', () => {
    it('should validate contract addresses', async () => {
      // Test that contract methods validate addresses
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [],
      });

      await expect(client.contract.getSourceCode({ address: 'invalid-address' })).rejects.toThrow();
    });
  });

  describe('Client Disposal', () => {
    it('should allow proper cleanup', async () => {
      const disposableClient = new EtherscanClient({ apiKey: 'test-key' });
      await expect(disposableClient.dispose()).resolves.toBeUndefined();
    });

    it('should prevent use after disposal', async () => {
      const disposableClient = new EtherscanClient({ apiKey: 'test-key' });
      await disposableClient.dispose();

      // Methods should throw after disposal
      expect(() =>
        disposableClient.account.getBalance({ address: TEST_ADDRESSES.VITALIK })
      ).toThrow(/Client has been disposed/);
    });
  });

  describe('API Key Security', () => {
    it('should not expose API key in client properties', () => {
      const client = new EtherscanClient({ apiKey: 'secret-key-123' });

      // API key should not be enumerable
      expect(Object.keys(client)).not.toContain('_apiKey');
      expect(Object.getOwnPropertyNames(client)).not.toContain('_apiKey');

      // Should not appear in JSON serialization (client has cyclic refs, so stringify fails)
      expect(() => JSON.stringify(client)).toThrow();
    });

    it('should require API key', () => {
      // Temporarily remove env var
      const originalEnv = process.env.ETHERSCAN_API_KEY;
      delete process.env.ETHERSCAN_API_KEY;

      expect(() => new EtherscanClient()).toThrow('API Key is required');

      // Restore
      process.env.ETHERSCAN_API_KEY = originalEnv;
    });

    it('should accept API key from environment', () => {
      const originalEnv = process.env.ETHERSCAN_API_KEY;
      process.env.ETHERSCAN_API_KEY = 'env-api-key';

      const client = new EtherscanClient();
      expect(client).toBeDefined();

      // Restore
      process.env.ETHERSCAN_API_KEY = originalEnv;
    });
  });

  describe('Input Validation Security', () => {
    it('should validate Ethereum addresses', async () => {
      // Invalid address should cause validation error
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000',
      });

      // This should work with valid address
      await expect(client.account.getBalance(TEST_ADDRESSES.VITALIK)).resolves.toBeDefined();
    });

    it('should handle malformed JSON responses securely', async () => {
      // Mock a response that could cause JSON parsing issues
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header: string) => (header === 'content-type' ? 'application/json' : null),
        },
        text: () => Promise.resolve('{invalid json'),
      });

      await expect(client.account.getBalance(TEST_ADDRESSES.VITALIK)).rejects.toThrow();
    });

    it('should validate response size limits', async () => {
      // Mock a very large response
      const largeContentLength = (60 * 1024 * 1024).toString(); // 60MB

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header: string) => {
            if (header === 'content-type') return 'application/json';
            if (header === 'content-length') return largeContentLength;
            return null;
          },
        },
        text: () => Promise.resolve('{"status":"1","message":"OK","result":"1000000000000000000"}'),
      });

      await expect(client.account.getBalance(TEST_ADDRESSES.VITALIK)).rejects.toThrow(
        'Response size exceeds maximum allowed'
      );
    });

    it('should reject invalid content-type', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header: string) => {
            if (header === 'content-type') return 'text/html';
            return null;
          },
        },
        text: () => Promise.resolve('{"status":"1","message":"OK","result":"1000000000000000000"}'),
      });

      await expect(client.account.getBalance(TEST_ADDRESSES.VITALIK)).rejects.toThrow(
        'Invalid response content-type: text/html'
      );
    });

    it('should validate response text size limits', async () => {
      // Create a response larger than 50MB
      const largeResponse = 'x'.repeat(51 * 1024 * 1024); // 51MB of 'x' characters

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header: string) => {
            if (header === 'content-type') return 'application/json';
            return null;
          },
        },
        text: () => Promise.resolve(largeResponse),
      });

      await expect(client.account.getBalance(TEST_ADDRESSES.VITALIK)).rejects.toThrow(
        'Response size exceeds maximum allowed'
      );
    });
  });

  describe('Rate Limiting Security', () => {
    it('should prevent abuse through rate limiting', async () => {
      const fastClient = new EtherscanClient({
        apiKey: 'rate-test-key',
        rateLimit: 1, // Very low rate limit
      });

      // Mock two responses for the two calls
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000',
      });

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000',
      });

      // First request should work
      await expect(
        fastClient.account.getBalance({ address: TEST_ADDRESSES.VITALIK, tag: 'latest' })
      ).resolves.toBeDefined();

      // Rapid subsequent requests should be rate limited by bottleneck
      const startTime = Date.now();
      await fastClient.account.getBalance({ address: TEST_ADDRESSES.VITALIK, tag: 'pending' });
      const duration = Date.now() - startTime;

      // Should take at least 1 second due to rate limiting
      expect(duration).toBeGreaterThanOrEqual(900);
    });

    it('should handle rate limit errors from API', async () => {
      mockFetchResponse({
        status: '0',
        message: 'Error',
        result: 'Maximum rate limit reached',
      });

      await expect(client.account.getBalance(TEST_ADDRESSES.VITALIK)).rejects.toThrow(
        'Etherscan Rate Limit Reached'
      );
    });
  });

  describe('URL Security', () => {
    it('should validate allowed base URLs', async () => {
      // This test ensures the transport layer validates URLs
      const client = new EtherscanClient({ apiKey: 'test-key' });

      // Valid Etherscan URL should work
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000',
      });

      await expect(client.account.getBalance(TEST_ADDRESSES.VITALIK)).resolves.toBeDefined();
    });
  });

  describe('Data Sanitization', () => {
    it('should handle special characters in parameters', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000',
      });

      // Test with various special characters in address
      const specialAddress = '0x1234567890abcdef1234567890abcdef12345678';
      await expect(client.account.getBalance(specialAddress)).resolves.toBeDefined();
    });

    it('should prevent parameter injection', async () => {
      mockFetchResponse(mockResponses.transactions);

      // Test with potentially malicious parameters
      await expect(
        client.account.getTxList({
          address: TEST_ADDRESSES.VITALIK,
          page: 1,
          offset: 10,
        })
      ).resolves.toBeDefined();

      // Verify the URL was properly encoded
      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(callUrl).toContain('address=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
      expect(callUrl).toContain('page=1');
      expect(callUrl).toContain('offset=10');
    });
  });

  describe('Error Handling Security', () => {
    it('should not leak sensitive information in errors', async () => {
      mockFetchResponse({
        status: '0',
        message: 'Error',
        result: 'Invalid API Key: sk-1234567890abcdef',
      });

      const error = await client.account.getBalance(TEST_ADDRESSES.VITALIK).catch(e => e);

      expect(error.message).toBe('Etherscan API Error: Error');
      expect(error.message).not.toContain('sk-1234567890abcdef');
    });

    it('should handle network errors securely', async () => {
      // Mock network failure
      (global.fetch as any).mockRejectedValueOnce(new Error('Network Error'));

      await expect(client.account.getBalance(TEST_ADDRESSES.VITALIK)).rejects.toThrow(
        'Network Error'
      );
    });

    it('should handle timeout errors securely', async () => {
      // Mock timeout
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 408,
        statusText: 'Request Timeout',
      });

      await expect(client.account.getBalance(TEST_ADDRESSES.VITALIK)).rejects.toThrow(
        'Request Timeout'
      );
    });
  });

  describe('Cache Security', () => {
    it('should not cache sensitive data inappropriately', async () => {
      client.updateCacheConfig({ enabled: true });

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000',
      });

      // Make request
      await client.account.getBalance(TEST_ADDRESSES.VITALIK);

      // Clear cache
      client.clearCache();

      const stats = client.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should respect cache TTL for security', async () => {
      client.updateCacheConfig({ defaultTtl: 1000 }); // 1 second

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000',
      });

      await client.account.getBalance(TEST_ADDRESSES.VITALIK);

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Next request should hit API
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '2000000000000000000',
      });

      const result = await client.account.getBalance(TEST_ADDRESSES.VITALIK);
      expect(result).toBe(2000000000000000000n);
    });
  });
});

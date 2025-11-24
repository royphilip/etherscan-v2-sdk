import { describe, it, expect, beforeEach } from 'vitest';
import { EtherscanClient } from '../src/client';
import { resetMocks, mockFetchResponse, mockResponses } from './setup';

describe('Usage Module', () => {
  let client: EtherscanClient;

  beforeEach(() => {
    resetMocks();
    client = new EtherscanClient({
      apiKey: 'test-key',
    });
  });

  describe('getChainList', () => {
    it('should get supported chain list', async () => {
      // Mock the chainlist endpoint response
      mockFetchResponse(mockResponses.chainList);

      const chains = await client.usage.getChainList();

      expect(chains).toEqual(mockResponses.chainList.result);
    });
  });

  describe('disposal', () => {
    it('should throw when calling methods on disposed usage module', async () => {
      await client.dispose();

      mockFetchResponse(mockResponses.chainList);

      // The proxy throws synchronously during checkDisposed call
      expect(() => {
        client.usage.getChainList();
      }).toThrow('Client has been disposed');
    });
  });
});

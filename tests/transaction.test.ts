import { describe, it, expect, beforeEach } from 'vitest';
import { EtherscanClient } from '../src/client';
import { resetMocks, mockFetchResponse, mockResponses } from './setup';

describe('Transaction Module', () => {
  let client: EtherscanClient;
  const testTxHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

  beforeEach(() => {
    resetMocks();
    client = new EtherscanClient({
      apiKey: 'test-key',
    });
  });

  describe('getStatus', () => {
    it('should get transaction execution status', async () => {
      mockFetchResponse(mockResponses.txStatus);

      const status = await client.transaction.getStatus(testTxHash);

      expect(status).toMatchObject({
        isError: '0',
        errDescription: '',
      });
    });

    it('should handle transaction with error', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: {
          isError: '1',
          errDescription: 'Out of gas',
        },
      });

      const status = await client.transaction.getStatus(testTxHash);

      expect(status).toMatchObject({
        isError: '1',
        errDescription: 'Out of gas',
      });
    });

    it('should throw on API error', async () => {
      mockFetchResponse(mockResponses.error);

      await expect(client.transaction.getStatus(testTxHash)).rejects.toThrow();
    });
  });

  describe('getReceiptStatus', () => {
    it('should get transaction receipt status', async () => {
      mockFetchResponse(mockResponses.txReceiptStatus);

      const status = await client.transaction.getReceiptStatus(testTxHash);

      expect(status).toMatchObject({
        status: '1',
      });
    });

    it('should handle failed transaction receipt', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: {
          status: '0',
        },
      });

      const status = await client.transaction.getReceiptStatus(testTxHash);

      expect(status).toMatchObject({
        status: '0',
      });
    });

    it('should throw on API error', async () => {
      mockFetchResponse(mockResponses.error);

      await expect(client.transaction.getReceiptStatus(testTxHash)).rejects.toThrow();
    });
  });
});

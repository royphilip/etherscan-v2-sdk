import { describe, it, expect, beforeEach } from 'vitest';
import { EtherscanClient } from '../src/client';
import { resetMocks, mockFetchResponse } from './setup';
import { TEST_ADDRESSES } from './setup';

describe('Logs Module', () => {
  let client: EtherscanClient;

  beforeEach(() => {
    resetMocks();
    client = new EtherscanClient({
      apiKey: 'test-key',
    });
  });

  describe('getlogs', () => {
    it('should get event logs by address', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            address: TEST_ADDRESSES.CONTRACT,
            topics: [
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
              '0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045',
              '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
            ],
            data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
            blockNumber: '0x12345678',
            timeStamp: '0x6578b8c0',
            gasPrice: '0x4a817c800',
            gasUsed: '0x5208',
            logIndex: '0x0',
            transactionHash: '0x1234567890abcdef1234567890abcdef12345678',
            transactionIndex: '0x0',
          },
        ],
      });

      const logs = await client.logs.getLogs({
        address: TEST_ADDRESSES.CONTRACT,
        fromBlock: 18500000,
        toBlock: 18600000,
      });

      expect(logs).toEqual([
        expect.objectContaining({
          address: TEST_ADDRESSES.CONTRACT,
          blockNumber: '0x12345678',
          transactionHash: '0x1234567890abcdef1234567890abcdef12345678',
        }),
      ]);
    });
  });

  describe('getlogsaddresstopics', () => {
    it('should get event logs by address and topics', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            address: TEST_ADDRESSES.CONTRACT,
            topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
            data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
            blockNumber: '0x12345678',
            timeStamp: '0x6578b8c0',
            gasPrice: '0x4a817c800',
            gasUsed: '0x5208',
            logIndex: '0x0',
            transactionHash: '0x1234567890abcdef1234567890abcdef12345678',
            transactionIndex: '0x0',
          },
        ],
      });

      const logs = await client.logs.getLogsByAddressAndTopics({
        address: TEST_ADDRESSES.CONTRACT,
        fromBlock: 18500000,
        toBlock: 18600000,
        topic0: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      });

      expect(logs).toEqual([
        expect.objectContaining({
          address: TEST_ADDRESSES.CONTRACT,
          topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
        }),
      ]);
    });
  });

  describe('getlogstopics', () => {
    it('should get event logs by topics', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            address: TEST_ADDRESSES.CONTRACT,
            topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
            data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
            blockNumber: '0x12345678',
            timeStamp: '0x6578b8c0',
            gasPrice: '0x4a817c800',
            gasUsed: '0x5208',
            logIndex: '0x0',
            transactionHash: '0x1234567890abcdef1234567890abcdef12345678',
            transactionIndex: '0x0',
          },
        ],
      });

      const logs = await client.logs.getLogsByTopics({
        fromBlock: 18500000,
        toBlock: 18600000,
        topic0: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      });

      expect(logs).toEqual([
        expect.objectContaining({
          address: TEST_ADDRESSES.CONTRACT,
          topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
        }),
      ]);
    });
  });
});

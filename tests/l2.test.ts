import { describe, it, expect, beforeEach } from 'vitest';
import { EtherscanClient } from '../src/client';
import { resetMocks, mockFetchResponse } from './setup';
import { TEST_ADDRESSES } from './setup';

describe('L2 Module', () => {
  let client: EtherscanClient;

  beforeEach(() => {
    resetMocks();
    client = new EtherscanClient({
      apiKey: 'test-key',
    });
  });

  describe('getTxnBridge', () => {
    it('should get plasma deposit transactions', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            hash: '0xf645deb2b6fbb8b76ccbcf4bde782e28d3520e8a30e9a568b9b8c526e2fd8434',
            blockNumber: '51844560',
            timeStamp: '1704181285',
            from: '0x0000000000000000000000000000000000000000',
            address: TEST_ADDRESSES.VITALIK,
            amount: '2341706540000000000',
            tokenName: 'Polygon Token',
            symbol: 'POL',
            contractAddress: '0x0000000000000000000000000000000000001010',
            divisor: '18',
          },
        ],
      });

      const txns = await client.l2.getTxnBridge({
        address: TEST_ADDRESSES.VITALIK,
        page: 1,
        offset: 10,
      });

      expect(txns).toEqual([
        expect.objectContaining({
          hash: '0xf645deb2b6fbb8b76ccbcf4bde782e28d3520e8a30e9a568b9b8c526e2fd8434',
          blockNumber: '51844560',
          timeStamp: '1704181285',
          from: '0x0000000000000000000000000000000000000000',
          address: TEST_ADDRESSES.VITALIK,
          amount: 2341706540000000000n,
          tokenName: 'Polygon Token',
          symbol: 'POL',
        }),
      ]);
    });
  });

  describe('getDepositTxs', () => {
    it('should get deposit transactions', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            blockNumber: '12345678',
            timeStamp: '1609459200',
            hash: '0x1234567890abcdef1234567890abcdef12345678',
            nonce: '1',
            blockHash: '0xabcd1234567890abcdef1234567890abcdef1234',
            transactionIndex: '0',
            from: TEST_ADDRESSES.VITALIK,
            to: TEST_ADDRESSES.CONTRACT,
            value: '1000000000000000000',
            gas: '21000',
            gasPrice: '20000000000',
            isError: '0',
            txreceipt_status: '1',
            input: '0x',
            contractAddress: '',
            cumulativeGasUsed: '21000',
            gasUsed: '21000',
            confirmations: '100',
            l1BlockNumber: '12345670',
            l1TxOrigin: TEST_ADDRESSES.VITALIK,
          },
        ],
      });

      const deposits = await client.l2.getDepositTxs({
        address: TEST_ADDRESSES.VITALIK,
        startblock: 12300000,
        endblock: 12400000,
      });

      expect(deposits).toEqual([
        expect.objectContaining({
          blockNumber: '12345678',
          from: TEST_ADDRESSES.VITALIK,
          value: 1000000000000000000n,
          l1BlockNumber: '12345670',
        }),
      ]);
    });
  });

  describe('getWithdrawalTxs', () => {
    it('should get withdrawal transactions', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            blockNumber: '12345678',
            timeStamp: '1609459200',
            hash: '0x1234567890abcdef1234567890abcdef12345678',
            nonce: '1',
            blockHash: '0xabcd1234567890abcdef1234567890abcdef1234',
            transactionIndex: '0',
            from: TEST_ADDRESSES.VITALIK,
            to: TEST_ADDRESSES.CONTRACT,
            value: '1000000000000000000',
            gas: '21000',
            gasPrice: '20000000000',
            isError: '0',
            txreceipt_status: '1',
            input: '0x',
            contractAddress: '',
            cumulativeGasUsed: '21000',
            gasUsed: '21000',
            confirmations: '100',
            l1BlockNumber: '12345670',
            l1TxOrigin: TEST_ADDRESSES.VITALIK,
          },
        ],
      });

      const withdrawals = await client.l2.getWithdrawalTxs({
        address: TEST_ADDRESSES.VITALIK,
        startblock: 12300000,
        endblock: 12400000,
      });

      expect(withdrawals).toEqual([
        expect.objectContaining({
          blockNumber: '12345678',
          from: TEST_ADDRESSES.VITALIK,
          value: 1000000000000000000n,
          l1BlockNumber: '12345670',
        }),
      ]);
    });
  });
});

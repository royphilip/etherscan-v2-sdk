import { describe, it, expect, beforeEach } from 'vitest';
import { EtherscanClient } from '../src/client';
import { EvmChainId } from '../src/core/types';
import { resetMocks, mockFetchResponse, mockResponses, TEST_ADDRESSES } from './setup';

describe('Account Module', () => {
  let client: EtherscanClient;

  beforeEach(() => {
    resetMocks();
    client = new EtherscanClient({
      apiKey: 'test-key',
    });
  });

  describe('getBalance', () => {
    it('should get balance for an address', async () => {
      mockFetchResponse(mockResponses.balance);

      const balance = await client.account.getBalance(TEST_ADDRESSES.VITALIK);

      expect(balance).toBe(1000000000000000000n);
    });

    it('should handle zero balance', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '0',
      });

      const balance = await client.account.getBalance(TEST_ADDRESSES.ZERO);

      expect(balance).toBe(0n);
    });

    it('should throw on API error', async () => {
      mockFetchResponse(mockResponses.error);

      await expect(client.account.getBalance(TEST_ADDRESSES.VITALIK)).rejects.toThrow();
    });

    it('should accept object parameters', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '2000000000000000000000',
      });

      const balance = await client.account.getBalance({ address: TEST_ADDRESSES.VITALIK, tag: 'latest' });
      expect(balance).toBe(2000000000000000000000n);
    });

    it('should accept positional parameters', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '3000000000000000000000',
      });

      const balance = await client.account.getBalance(TEST_ADDRESSES.VITALIK, 'pending');
      expect(balance).toBe(3000000000000000000000n);
    });

    it('should support multiple addresses comma-separated', async () => {
      mockFetchResponse(mockResponses.balancemulti);

      const balances = await client.account.getBalance({
        address: `${TEST_ADDRESSES.VITALIK},${TEST_ADDRESSES.CONTRACT}`,
        tag: 'latest'
      });

      expect(balances).toEqual({
        [TEST_ADDRESSES.VITALIK]: 1000000000000000000n,
        [TEST_ADDRESSES.CONTRACT]: 2000000000000000000n,
      });
    });

    it('should reject more than 20 addresses', async () => {
      const addresses = Array.from({ length: 21 }, (_, i) =>
        `0x${i.toString().padStart(40, '0')}`
      ).join(',');

      await expect(client.account.getBalance({ address: addresses })).rejects.toThrow(
        'Cannot query more than 20 addresses at once'
      );
    });
  });

  describe('getBalances', () => {
    it('should get balances for multiple addresses', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            account: TEST_ADDRESSES.VITALIK,
            balance: '1000000000000000000',
          },
          {
            account: TEST_ADDRESSES.CONTRACT,
            balance: '2000000000000000000',
          },
        ],
      });

      const balances = await client.account.getBalances([TEST_ADDRESSES.VITALIK, TEST_ADDRESSES.CONTRACT]);

      expect(balances).toEqual({
        [TEST_ADDRESSES.VITALIK]: 1000000000000000000n,
        [TEST_ADDRESSES.CONTRACT]: 2000000000000000000n,
      });
    });

    it('should accept object parameters', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            account: TEST_ADDRESSES.VITALIK,
            balance: '1000000000000000000',
          },
        ],
      });

      const balances = await client.account.getBalances({
        addresses: [TEST_ADDRESSES.VITALIK],
        tag: 'latest',
      });

      expect(balances).toEqual({
        [TEST_ADDRESSES.VITALIK]: 1000000000000000000n,
      });
    });

    it('should throw on empty addresses array', async () => {
      await expect(client.account.getBalances([])).rejects.toThrow('At least one address is required');
    });

    it('should throw on too many addresses', async () => {
      const addresses = Array.from({ length: 21 }, () => TEST_ADDRESSES.VITALIK);
      await expect(client.account.getBalances(addresses)).rejects.toThrow('Cannot query more than 20 addresses at once');
    });
  });

  describe('getTxList', () => {
    it('should get transaction list for an address', async () => {
      mockFetchResponse(mockResponses.transactions);

      const txList = await client.account.getTxList({ address: TEST_ADDRESSES.VITALIK });

      expect(Array.isArray(txList)).toBe(true);
      expect(txList).toHaveLength(1);
      expect(txList[0]).toMatchObject({
        hash: expect.stringMatching(/^0x/),
        from: TEST_ADDRESSES.VITALIK,
        to: TEST_ADDRESSES.CONTRACT,
        value: 1000000000000000000n,
        gas: '21000',
        gasPrice: 20000000000n,
      });
    });

    it('should handle empty transaction list', async () => {
      mockFetchResponse(mockResponses.noTransactions);

      const txList = await client.account.getTxList({ address: TEST_ADDRESSES.ZERO });

      expect(Array.isArray(txList)).toBe(true);
      expect(txList).toHaveLength(0);
    });

    it('should accept pagination options', async () => {
      mockFetchResponse(mockResponses.transactions);

      const txList = await client.account.getTxList({
        address: TEST_ADDRESSES.VITALIK,
        page: 1,
        offset: 10,
        sort: 'asc',
      });

      expect(Array.isArray(txList)).toBe(true);
    });

    it('should accept block range options', async () => {
      mockFetchResponse(mockResponses.transactions);

      const txList = await client.account.getTxList({
        address: TEST_ADDRESSES.VITALIK,
        startblock: 1000000,
        endblock: 2000000,
      });

      expect(Array.isArray(txList)).toBe(true);
    });

    it('should use default parameters when not specified', async () => {
      mockFetchResponse(mockResponses.transactions);

      const txList = await client.account.getTxList({ address: TEST_ADDRESSES.VITALIK });

      expect(Array.isArray(txList)).toBe(true);
    });
  });

  describe('getTxsBeaconWithdrawal', () => {
    it('should work on chains with beacon chain support', async () => {
      mockFetchResponse(mockResponses.beaconWithdrawals);

      const withdrawals = await client.account.getTxsBeaconWithdrawal({
        address: TEST_ADDRESSES.VITALIK,
      });

      expect(Array.isArray(withdrawals)).toBe(true);
    });

    it('should throw error on chains without beacon chain support', async () => {
      const l2Client = new EtherscanClient({
        apiKey: 'test-key',
        chain: EvmChainId.OPTIMISM, // L2 chain without beacon chain
      });

      await expect(
        l2Client.account.getTxsBeaconWithdrawal({
          address: TEST_ADDRESSES.VITALIK,
        })
      ).rejects.toThrow(
        'Method getTxsBeaconWithdrawal is not supported on chain 10 (missing hasBeaconChain capability)'
      );
    });

    describe('getBalanceHistory', () => {
      it('should get balance history for an address', async () => {
        mockFetchResponse({
          status: '1',
          message: 'OK',
          result: '1000000000000000000',
        });

        const balanceHistory = await client.account.getBalanceHistory({
          address: TEST_ADDRESSES.VITALIK,
          blockno: 12345678,
        });

        expect(balanceHistory).toEqual(1000000000000000000n);
      });
    });

    describe('getTokenTx', () => {
      it('should get ERC20 token transactions', async () => {
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
              from: TEST_ADDRESSES.VITALIK,
              contractAddress: '0xa0b86a33e6441e88c5f2712c3e9b74f5b8f1e8b9',
              to: TEST_ADDRESSES.CONTRACT,
              value: '1000000000000000000',
              tokenName: 'Test Token',
              tokenSymbol: 'TEST',
              tokenDecimal: '18',
              transactionIndex: '0',
              gas: '21000',
              gasPrice: '20000000000',
              gasUsed: '21000',
              cumulativeGasUsed: '21000',
              input: 'deprecated',
              confirmations: '100',
            },
          ],
        });

        const tokenTx = await client.account.getTokenTx({
          address: TEST_ADDRESSES.VITALIK,
        });

        expect(tokenTx).toEqual([
          expect.objectContaining({
            blockNumber: '12345678',
            from: TEST_ADDRESSES.VITALIK,
            to: TEST_ADDRESSES.CONTRACT,
            value: 1000000000000000000n,
            tokenName: 'Test Token',
            tokenSymbol: 'TEST',
          }),
        ]);
      });
    });

    describe('getTokenNftTx', () => {
      it('should get ERC721 token transactions', async () => {
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
              from: TEST_ADDRESSES.VITALIK,
              contractAddress: '0xa0b86a33e6441e88c5f2712c3e9b74f5b8f1e8b9',
              to: TEST_ADDRESSES.CONTRACT,
              tokenID: '123',
              tokenName: 'Test NFT',
              tokenSymbol: 'TNFT',
              tokenDecimal: '0',
              transactionIndex: '0',
              gas: '21000',
              gasPrice: '20000000000',
              gasUsed: '21000',
              cumulativeGasUsed: '21000',
              input: 'deprecated',
              confirmations: '100',
            },
          ],
        });

        const nftTx = await client.account.getTokenNftTx({
          address: TEST_ADDRESSES.VITALIK,
        });

        expect(nftTx).toEqual([
          expect.objectContaining({
            blockNumber: '12345678',
            from: TEST_ADDRESSES.VITALIK,
            to: TEST_ADDRESSES.CONTRACT,
            tokenID: '123',
            tokenName: 'Test NFT',
            tokenSymbol: 'TNFT',
          }),
        ]);
      });
    });

    describe('getErc20Transfers (alias for getTokenTx)', () => {
      it('should work as an alias for getTokenTx', async () => {
        mockFetchResponse({
          status: '1',
          message: 'OK',
          result: [
            {
              blockNumber: '12345678',
              timeStamp: '1609459200',
              hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              nonce: '1',
              blockHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
              transactionIndex: '1',
              from: TEST_ADDRESSES.VITALIK,
              to: TEST_ADDRESSES.CONTRACT,
              value: '1000000000000000000',
              gas: '21000',
              gasPrice: '20000000000',
              isError: '0',
              txreceipt_status: '1',
              input: '0x',
              contractAddress: TEST_ADDRESSES.CONTRACT,
              cumulativeGasUsed: '21000',
              gasUsed: '21000',
              confirmations: '100',
              tokenName: 'Test Token',
              tokenSymbol: 'TT',
              tokenDecimal: '18',
            },
          ],
        });

        const erc20Tx = await client.account.getErc20Transfers({
          address: TEST_ADDRESSES.VITALIK,
        });

        expect(erc20Tx).toEqual([
          expect.objectContaining({
            blockNumber: '12345678',
            from: TEST_ADDRESSES.VITALIK,
            to: TEST_ADDRESSES.CONTRACT,
            tokenName: 'Test Token',
            tokenSymbol: 'TT',
          }),
        ]);
      });
    });

    describe('getErc721Transfers (alias for getTokenNftTx)', () => {
      it('should work as an alias for getTokenNftTx', async () => {
        mockFetchResponse({
          status: '1',
          message: 'OK',
          result: [
            {
              blockNumber: '12345678',
              timeStamp: '1609459200',
              hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              nonce: '1',
              blockHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
              transactionIndex: '1',
              from: TEST_ADDRESSES.VITALIK,
              to: TEST_ADDRESSES.CONTRACT,
              tokenID: '123',
              tokenName: 'Test NFT',
              tokenSymbol: 'TNFT',
              tokenDecimal: '0',
              contractAddress: TEST_ADDRESSES.CONTRACT,
              cumulativeGasUsed: '21000',
              gasUsed: '21000',
              gasPrice: '20000000000',
              gas: '21000',
              input: '0x',
              confirmations: '100',
            },
          ],
        });

        const erc721Tx = await client.account.getErc721Transfers({
          address: TEST_ADDRESSES.VITALIK,
        });

        expect(erc721Tx).toEqual([
          expect.objectContaining({
            blockNumber: '12345678',
            from: TEST_ADDRESSES.VITALIK,
            to: TEST_ADDRESSES.CONTRACT,
            tokenID: '123',
            tokenName: 'Test NFT',
            tokenSymbol: 'TNFT',
          }),
        ]);
      });
    });

    describe('getToken1155Tx', () => {
      it('should get ERC1155 token transactions', async () => {
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
              from: TEST_ADDRESSES.VITALIK,
              contractAddress: '0xa0b86a33e6441e88c5f2712c3e9b74f5b8f1e8b9',
              to: TEST_ADDRESSES.CONTRACT,
              tokenID: '123',
              tokenValue: '1000000000000000000',
              tokenName: 'Test ERC1155',
              tokenSymbol: 'T1155',
              tokenDecimal: '18',
              transactionIndex: '0',
              gas: '21000',
              gasPrice: '20000000000',
              gasUsed: '21000',
              cumulativeGasUsed: '21000',
              input: 'deprecated',
              confirmations: '100',
            },
          ],
        });

        const token1155Tx = await client.account.getToken1155Tx({
          address: TEST_ADDRESSES.VITALIK,
        });

        expect(token1155Tx).toEqual([
          expect.objectContaining({
            blockNumber: '12345678',
            from: TEST_ADDRESSES.VITALIK,
            to: TEST_ADDRESSES.CONTRACT,
            tokenID: '123',
            tokenValue: 1000000000000000000n,
            tokenName: 'Test ERC1155',
            tokenSymbol: 'T1155',
          }),
        ]);
      });
    });

    describe('getTxListInternal', () => {
      it('should get internal transactions', async () => {
        mockFetchResponse({
          status: '1',
          message: 'OK',
          result: [
            {
              blockNumber: '12345678',
              timeStamp: '1609459200',
              hash: '0x1234567890abcdef1234567890abcdef12345678',
              from: TEST_ADDRESSES.VITALIK,
              to: TEST_ADDRESSES.CONTRACT,
              value: '1000000000000000000',
              contractAddress: '',
              input: '',
              type: 'call',
              gas: '2300',
              gasUsed: '0',
              traceId: '0',
              isError: '0',
              errCode: '',
            },
          ],
        });

        const internalTx = await client.account.getTxListInternal({
          address: TEST_ADDRESSES.VITALIK,
        });

        expect(internalTx).toEqual([
          expect.objectContaining({
            blockNumber: '12345678',
            from: TEST_ADDRESSES.VITALIK,
            to: TEST_ADDRESSES.CONTRACT,
            value: 1000000000000000000n,
            type: 'call',
            isError: '0',
          }),
        ]);
      });
    });

    describe('getTxListInternalBlockRange', () => {
      it('should get internal transactions by block range', async () => {
        mockFetchResponse({
          status: '1',
          message: 'OK',
          result: [
            {
              blockNumber: '12345678',
              timeStamp: '1609459200',
              hash: '0x1234567890abcdef1234567890abcdef12345678',
              from: TEST_ADDRESSES.VITALIK,
              to: TEST_ADDRESSES.CONTRACT,
              value: '1000000000000000000',
              contractAddress: '',
              input: '0x',
              type: 'call',
              gas: '21000',
              gasUsed: '21000',
              traceId: '0',
              isError: '0',
              errCode: '',
            },
          ],
        });

        const internalTx = await client.account.getTxListInternalBlockRange({
          startblock: 1000000,
          endblock: 2000000,
        });

        expect(internalTx).toEqual([
          expect.objectContaining({
            blockNumber: '12345678',
            from: TEST_ADDRESSES.VITALIK,
            to: TEST_ADDRESSES.CONTRACT,
            value: 1000000000000000000n,
          }),
        ]);
      });
    });

    describe('getTxListInternalTxHash', () => {
      it('should get internal transactions by transaction hash', async () => {
        mockFetchResponse({
          status: '1',
          message: 'OK',
          result: [
            {
              blockNumber: '12345678',
              timeStamp: '1609459200',
              hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              from: TEST_ADDRESSES.VITALIK,
              to: TEST_ADDRESSES.CONTRACT,
              value: '1000000000000000000',
              contractAddress: '',
              input: '0x',
              type: 'call',
              gas: '21000',
              gasUsed: '21000',
              traceId: '0',
              isError: '0',
              errCode: '',
            },
          ],
        });

        const internalTx = await client.account.getTxListInternalTxHash({
          txhash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        });

        expect(internalTx).toEqual([
          expect.objectContaining({
            blockNumber: '12345678',
            from: TEST_ADDRESSES.VITALIK,
            to: TEST_ADDRESSES.CONTRACT,
            value: 1000000000000000000n,
          }),
        ]);
      });
    });

    describe('getMinedBlocks', () => {
      it('should get mined blocks by address', async () => {
        mockFetchResponse({
          status: '1',
          message: 'OK',
          result: [
            {
              blockNumber: '12345678',
              timeStamp: '1609459200',
              blockReward: '2000000000000000000',
            },
          ],
        });

        const minedBlocks = await client.account.getMinedBlocks({
          address: TEST_ADDRESSES.VITALIK,
        });

        expect(minedBlocks).toEqual([
          {
            blockNumber: '12345678',
            timeStamp: '1609459200',
            blockReward: '2000000000000000000',
          },
        ]);
      });
    });

    describe('getFundedBy', () => {
      it('should get transactions funded by address', async () => {
        mockFetchResponse({
          status: '1',
          message: 'OK',
          result: {
            block: 12345678,
            timeStamp: '1609459200',
            fundingAddress: TEST_ADDRESSES.VITALIK,
            fundingTxn: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            value: '1000000000000000000',
          },
        });

        const fundedTx = await client.account.getFundedBy({
          address: TEST_ADDRESSES.VITALIK,
        });

        expect(fundedTx).toEqual({
          block: 12345678,
          timeStamp: '1609459200',
          fundingAddress: TEST_ADDRESSES.VITALIK,
          fundingTxn: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          value: 1000000000000000000n,
        });
      });
    });
  });
});

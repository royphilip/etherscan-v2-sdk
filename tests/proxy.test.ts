import { describe, it, expect, beforeEach } from 'vitest';
import { EtherscanClient } from '../src/client';
import { resetMocks, mockFetchResponse } from './setup';
import { TEST_ADDRESSES } from './setup';

describe('Proxy Module', () => {
  let client: EtherscanClient;

  beforeEach(() => {
    resetMocks();
    client = new EtherscanClient({
      apiKey: 'test-key',
    });
  });

  describe('getTransactionCount', () => {
    it('should get transaction count', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '0x2a',
      });

      const txCount = await client.proxy.getTransactionCount({
        address: TEST_ADDRESSES.VITALIK,
        tag: 'latest',
      });

      expect(txCount).toBe('0x2a');
    });
  });

  describe('getTransactionByHash', () => {
    it('should get transaction by hash', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: {
          blockHash: '0xabcd1234567890abcdef1234567890abcdef1234',
          blockNumber: '0x12345678',
          from: TEST_ADDRESSES.VITALIK,
          gas: '0x5208',
          gasPrice: '0x4a817c800',
          hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          input: '0x',
          nonce: '0x1',
          to: TEST_ADDRESSES.CONTRACT,
          transactionIndex: '0x0',
          value: '0xde0b6b3a7640000',
          v: '0x25',
          r: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          s: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        },
      });

      const tx = await client.proxy.getTransactionByHash({
        txhash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      });

      expect(tx).toEqual(
        expect.objectContaining({
          hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          from: TEST_ADDRESSES.VITALIK,
          to: TEST_ADDRESSES.CONTRACT,
          value: '0xde0b6b3a7640000',
        })
      );
    });
  });

  describe('getTransactionReceipt', () => {
    it('should get transaction receipt', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: {
          transactionHash: '0x1234567890abcdef1234567890abcdef12345678',
          transactionIndex: '0x0',
          blockHash: '0xabcd1234567890abcdef1234567890abcdef1234',
          blockNumber: '0x12345678',
          from: TEST_ADDRESSES.VITALIK,
          to: TEST_ADDRESSES.CONTRACT,
          cumulativeGasUsed: '0x5208',
          gasUsed: '0x5208',
          contractAddress: null,
          logs: [],
          logsBloom:
            '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
          status: '0x1',
        },
      });

      const receipt = await client.proxy.getTransactionReceipt({
        txhash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      });

      expect(receipt).toEqual(
        expect.objectContaining({
          transactionHash: '0x1234567890abcdef1234567890abcdef12345678',
          status: '0x1',
          from: TEST_ADDRESSES.VITALIK,
        })
      );
    });
  });

  describe('getBlockNumber', () => {
    it('should get latest block number', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '0x12345678',
      });

      const blockNumber = await client.proxy.getBlockNumber();

      expect(blockNumber).toBe('0x12345678');
    });
  });

  describe('getGasPrice', () => {
    it('should get gas price', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '0x4a817c800',
      });

      const gasPrice = await client.proxy.getGasPrice();

      expect(gasPrice).toBe('0x4a817c800');
    });
  });

  describe('getBlockByNumber', () => {
    it('should get block by number', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: {
          number: '0x12345678',
          hash: '0xabcd1234567890abcdef1234567890abcdef1234',
          parentHash: '0x1234567890abcdef1234567890abcdef12345678',
          nonce: '0x0000000000000000',
          sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
          logsBloom:
            '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
          transactionsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
          stateRoot: '0xd5855eb08b3387c0af375e9cdb6acfc05eb8f519e419b874b6ff2ffda7cf17166',
          receiptsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
          miner: TEST_ADDRESSES.VITALIK,
          difficulty: '0x0',
          totalDifficulty: '0x0',
          extraData: '0x',
          size: '0x3e8',
          gasLimit: '0x1c9c380',
          gasUsed: '0x0',
          timestamp: '0x6578b8c0',
          transactions: [],
          uncles: [],
        },
      });

      const block = await client.proxy.getBlockByNumber({
        tag: '0x12345678',
        boolean: false,
      });

      expect(block).toEqual(
        expect.objectContaining({
          number: '0x12345678',
          miner: TEST_ADDRESSES.VITALIK,
          transactions: [],
        })
      );
    });
  });

  describe('call', () => {
    it('should execute eth_call', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '0x000000000000000000000000000000000000000000000000000000000000002a',
      });

      const result = await client.proxy.call({
        to: TEST_ADDRESSES.CONTRACT,
        data: '0x18160ddd', // totalSupply()
        tag: 'latest',
      });

      expect(result).toBe('0x000000000000000000000000000000000000000000000000000000000000002a');
    });
  });

  describe('getStorageAt', () => {
    it('should get storage value at position', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '0x000000000000000000000000000000000000000000000000000000000000002a',
      });

      const result = await client.proxy.getStorageAt({
        address: TEST_ADDRESSES.CONTRACT,
        position: '0x0',
        tag: 'latest',
      });

      expect(result).toBe('0x000000000000000000000000000000000000000000000000000000000000002a');
    });
  });

  describe('getUncleByBlockNumberAndIndex', () => {
    it('should get uncle block by number and index', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: {
          number: '0x12345678',
          hash: '0xabcd1234567890abcdef1234567890abcdef1234',
          parentHash: '0x1234567890abcdef1234567890abcdef12345678',
          nonce: '0x0000000000000000',
          sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
          logsBloom:
            '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
          transactionsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
          stateRoot: '0xd5855eb08b3387c0af375e9cdb6acfc05eb8f519e419b874b6ff2ffda7cf17166',
          receiptsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
          miner: TEST_ADDRESSES.VITALIK,
          difficulty: '0x0',
          totalDifficulty: '0x0',
          extraData: '0x',
          size: '0x3e8',
          gasLimit: '0x1c9c380',
          gasUsed: '0x0',
          timestamp: '0x6578b8c0',
          transactions: [],
          uncles: [],
        },
      });

      const uncle = await client.proxy.getUncleByBlockNumberAndIndex({
        tag: '0x12345678',
        index: '0x0',
      });

      expect(uncle).toEqual(
        expect.objectContaining({
          number: '0x12345678',
          miner: TEST_ADDRESSES.VITALIK,
        })
      );
    });
  });

  describe('getBlockTransactionCountByNumber', () => {
    it('should get transaction count in block', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '42',
      });

      const count = await client.proxy.getBlockTransactionCountByNumber({
        tag: '0x12345678',
      });

      expect(count).toBe(42);
    });
  });

  describe('getCode', () => {
    it('should get contract code', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result:
          '0x608060405234801561001057600080fd5b50d3801561001d57600080fd5b50d2801561002a57600080fd5b50600436106100415760003560e01c806318160ddd14610046575b600080fd5b61004e61005b565b60408051918252519081900360200190f35b60005481565b9091019056fea2646970667358221220c3d7e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e364736f6c63430008000033',
      });

      const code = await client.proxy.getCode({
        address: TEST_ADDRESSES.CONTRACT,
        tag: 'latest',
      });

      expect(code).toMatch(/^0x/);
    });
  });

  describe('sendRawTransaction', () => {
    it('should send raw transaction', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      });

      const txHash = await client.proxy.sendRawTransaction({
        hex: '0xf86a80843b9aca00825208941b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2880de0b6b3a76400008025a0a01234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdefa01234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      });

      expect(txHash).toBe('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
    });
  });

  describe('getTransactionByBlockNumberAndIndex', () => {
    it('should get transaction by block number and index', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: {
          blockHash: '0xabcd1234567890abcdef1234567890abcdef1234',
          blockNumber: '0x12345678',
          from: TEST_ADDRESSES.VITALIK,
          gas: '0x5208',
          gasPrice: '0x4a817c800',
          hash: '0x1234567890abcdef1234567890abcdef12345678',
          input: '0x',
          nonce: '0x1',
          to: TEST_ADDRESSES.CONTRACT,
          transactionIndex: '0x0',
          value: '0xde0b6b3a7640000',
          v: '0x25',
          r: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          s: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        },
      });

      const tx = await client.proxy.getTransactionByBlockNumberAndIndex({
        tag: '0x12345678',
        index: '0x0',
      });

      expect(tx).toEqual(
        expect.objectContaining({
          hash: '0x1234567890abcdef1234567890abcdef12345678',
          from: TEST_ADDRESSES.VITALIK,
          to: TEST_ADDRESSES.CONTRACT,
        })
      );
    });
  });

  describe('estimateGas', () => {
    it('should estimate gas for transaction', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '0x5208',
      });

      const gasEstimate = await client.proxy.estimateGas({
        to: TEST_ADDRESSES.CONTRACT,
        data: '0x18160ddd', // totalSupply()
        value: '0x0',
        gasPrice: '0x4a817c800',
        gas: '0x1e8480',
      });

      expect(gasEstimate).toBe('0x5208');
    });
  });
});

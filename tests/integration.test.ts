import { describe, it, expect, beforeEach } from 'vitest';
import { EtherscanClient } from '../src/client';
import { resetMocks, mockFetchResponse } from './setup';
import { TEST_ADDRESSES } from './setup';

/**
 * Integration tests for end-to-end API workflows
 * These tests simulate real user scenarios and API interactions
 */
describe('Integration Tests - End-to-End Workflows', () => {
  let client: EtherscanClient;

  beforeEach(() => {
    resetMocks();
    client = new EtherscanClient({
      apiKey: 'test-key',
    });
  });

  describe('Account Analysis Workflow', () => {
    it('should perform complete account analysis', async () => {
      // Mock all the API responses for a complete account analysis
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000000', // 1000 ETH
      });

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            blockNumber: '18500000',
            timeStamp: '1700611200',
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
          },
        ],
      });

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            blockNumber: '18500000',
            timeStamp: '1700611200',
            hash: '0x1234567890abcdef1234567890abcdef12345678',
            nonce: '1',
            blockHash: '0xabcd1234567890abcdef1234567890abcdef1234',
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

      // Perform account analysis workflow
      const balance = await client.account.getBalance(TEST_ADDRESSES.VITALIK);
      const transactions = await client.account.getTxList({
        address: TEST_ADDRESSES.VITALIK,
        page: 1,
        offset: 10,
      });
      const internalTxs = await client.account.getTxListInternal({
        address: TEST_ADDRESSES.VITALIK,
      });

      // Verify the workflow results
      expect(balance).toBe(1000000000000000000000n);
      expect(transactions).toHaveLength(1);
      expect(internalTxs).toHaveLength(1);
      expect(transactions[0].from).toBe(TEST_ADDRESSES.VITALIK);
      expect(internalTxs[0].from).toBe(TEST_ADDRESSES.VITALIK);
    });
  });

  describe('Token Analysis Workflow', () => {
    it('should analyze token holdings and transactions', async () => {
      // Mock token-related API responses
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000000', // Token balance
      });

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            blockNumber: '18500000',
            timeStamp: '1700611200',
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

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            TokenHolderAddress: TEST_ADDRESSES.VITALIK,
            TokenHolderQuantity: '1000000000000000000000',
          },
        ],
      });

      // Perform token analysis workflow
      const tokenBalance = await client.tokens.getTokenBalance({
        contractaddress: TEST_ADDRESSES.CONTRACT,
        address: TEST_ADDRESSES.VITALIK,
      });

      const tokenTxs = await client.account.getTokenTx({
        address: TEST_ADDRESSES.VITALIK,
      });

      const holders = await client.tokens.getTokenHolderList({
        contractaddress: TEST_ADDRESSES.CONTRACT,
      });

      // Verify results
      expect(tokenBalance).toBe(1000000000000000000000n);
      expect(tokenTxs).toHaveLength(1);
      expect(holders).toHaveLength(1);
      expect(tokenTxs[0].tokenSymbol).toBe('TEST');
    });
  });

  describe('Contract Analysis Workflow', () => {
    it('should analyze smart contract details', async () => {
      // Mock contract-related API responses
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result:
          '[{"inputs":[],"name":"test","outputs":[],"stateMutability":"nonpayable","type":"function"}]',
      });

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            SourceCode: 'pragma solidity ^0.8.0; contract Test {}',
            ABI: '[]',
            ContractName: 'Test',
            CompilerVersion: 'v0.8.0+commit.c7dfd78e',
            OptimizationUsed: '1',
            Runs: '200',
            ConstructorArguments: '',
            EVMVersion: 'Default',
            Library: '',
            LicenseType: 'MIT',
            Proxy: '0',
            Implementation: '',
            SwarmSource: '',
          },
        ],
      });

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: 'Pass - Verified',
      });

      // Perform contract analysis workflow
      const abi = await client.contract.getAbi(TEST_ADDRESSES.CONTRACT);
      const sourceCode = await client.contract.getSourceCode(TEST_ADDRESSES.CONTRACT);
      const verificationStatus = await client.contract.checkVerifyStatus();

      // Verify results
      expect(abi).toHaveLength(1);
      expect(abi[0].name).toBe('test');
      expect(sourceCode).toHaveLength(1);
      expect(sourceCode[0].ContractName).toBe('Test');
      expect(verificationStatus).toBe('Pass - Verified');
    });
  });

  describe('Caching Integration', () => {
    it('should use cache for repeated requests', async () => {
      // Mock initial response
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000000',
      });

      // First request should hit API
      const balance1 = await client.account.getBalance(TEST_ADDRESSES.VITALIK);
      expect(balance1).toBe(1000000000000000000000n);

      // Second request should use cache (no additional mock needed)
      const balance2 = await client.account.getBalance(TEST_ADDRESSES.VITALIK);
      expect(balance2).toBe(1000000000000000000000n);

      // Verify only one API call was made
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle cache invalidation', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000000',
      });

      await client.account.getBalance(TEST_ADDRESSES.VITALIK);

      // Clear cache
      client.clearCache();

      // Next request should hit API again
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '2000000000000000000000',
      });

      const balance = await client.account.getBalance(TEST_ADDRESSES.VITALIK);
      expect(balance).toBe(2000000000000000000000n);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Request Deduplication Integration', () => {
    it('should deduplicate concurrent identical requests', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000000',
      });

      // Make multiple concurrent requests
      const requests = [
        client.account.getBalance(TEST_ADDRESSES.VITALIK),
        client.account.getBalance(TEST_ADDRESSES.VITALIK),
        client.account.getBalance(TEST_ADDRESSES.VITALIK),
      ];

      const results = await Promise.all(requests);

      // All should return the same result
      expect(results).toEqual([
        1000000000000000000000n,
        1000000000000000000000n,
        1000000000000000000000n,
      ]);

      // But only one API call should have been made
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle API errors gracefully', async () => {
      mockFetchResponse({
        status: '0',
        message: 'Error',
        result: 'Invalid API Key',
      });

      await expect(client.account.getBalance(TEST_ADDRESSES.VITALIK)).rejects.toThrow(
        'Etherscan API Error: Error'
      );
    });

    it('should handle rate limiting', async () => {
      mockFetchResponse({
        status: '0',
        message: 'Error',
        result: 'Max calls per sec rate limit reached (2/sec). Please switch to API V2',
      });

      await expect(client.account.getBalance(TEST_ADDRESSES.VITALIK)).rejects.toThrow(
        'Etherscan Rate Limit Reached'
      );
    });
  });

  describe('Interceptor Integration', () => {
    it('should apply request and response interceptors', async () => {
      // Add request interceptor to modify params
      client.addRequestInterceptor(params => ({
        ...params,
        intercepted: 'true',
      }));

      // Add response interceptor to modify result
      client.addResponseInterceptor(result => {
        if (typeof result === 'bigint') {
          return result * 2n; // Double the balance
        }
        return result;
      });

      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000000',
      });

      const balance = await client.account.getBalance(TEST_ADDRESSES.VITALIK);

      // Verify interceptors were applied
      expect(balance).toBe(2000000000000000000000n); // Original * 2

      // Check that request interceptor added the parameter
      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(callUrl).toContain('intercepted=true');
    });
  });
});

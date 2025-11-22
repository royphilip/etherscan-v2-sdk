import { describe, it, expect, beforeEach } from 'vitest';
import { EtherscanClient } from '../src/client';
import { resetMocks, mockFetchResponse, mockResponses, TEST_ADDRESSES } from './setup';

describe('Contract Module', () => {
  let client: EtherscanClient;

  beforeEach(() => {
    resetMocks();
    client = new EtherscanClient({
      apiKey: 'test-key',
    });
  });

  describe('getABI', () => {
    it('should get ABI for a contract address', async () => {
      mockFetchResponse(mockResponses.abi);

      const abi = await client.contract.getAbi(TEST_ADDRESSES.CONTRACT);

      expect(Array.isArray(abi)).toBe(true);
      expect(abi).toHaveLength(1);
      expect(abi[0]).toMatchObject({
        inputs: [],
        name: 'test',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      });
    });

    it('should parse JSON string ABI correctly', async () => {
      mockFetchResponse(mockResponses.abi);

      const abi = await client.contract.getAbi(TEST_ADDRESSES.CONTRACT);

      expect(typeof abi).toBe('object');
      expect(Array.isArray(abi)).toBe(true);
    });

    it('should handle empty ABI', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '[]',
      });

      const abi = await client.contract.getAbi(TEST_ADDRESSES.CONTRACT);

      expect(Array.isArray(abi)).toBe(true);
      expect(abi).toHaveLength(0);
    });

    it('should throw on API error', async () => {
      mockFetchResponse(mockResponses.error);

      await expect(client.contract.getAbi(TEST_ADDRESSES.CONTRACT)).rejects.toThrow();
    });
  });

  describe('getSourceCode', () => {
    it('should get source code for a contract address', async () => {
      mockFetchResponse(mockResponses.sourceCode);

      const sourceCode = await client.contract.getSourceCode(TEST_ADDRESSES.CONTRACT);

      expect(Array.isArray(sourceCode)).toBe(true);
      expect(sourceCode).toHaveLength(1);
      expect(sourceCode[0]).toMatchObject({
        SourceCode: expect.stringContaining('pragma solidity'),
        ABI: '[]',
        ContractName: 'Test',
        CompilerVersion: expect.stringMatching(/^v/),
        OptimizationUsed: '1',
        Runs: '200',
        ConstructorArguments: '',
        EVMVersion: 'Default',
        Library: '',
        LicenseType: 'MIT',
        Proxy: '0',
        Implementation: '',
        SwarmSource: '',
      });
    });

    it('should handle contract without source code', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [],
      });

      const sourceCode = await client.contract.getSourceCode(TEST_ADDRESSES.CONTRACT);

      expect(Array.isArray(sourceCode)).toBe(true);
      expect(sourceCode).toHaveLength(0);
    });

    it('should throw on API error', async () => {
      mockFetchResponse(mockResponses.error);

      await expect(client.contract.getSourceCode(TEST_ADDRESSES.CONTRACT)).rejects.toThrow();
    });
  });

  describe('verifyZkSyncSourceCode', () => {
    it('should verify zkSync source code', async () => {
      mockFetchResponse(mockResponses.verification);

      const result = await client.contract.verifyZkSyncSourceCode({
        contractaddress: TEST_ADDRESSES.CONTRACT,
        sourceCode: 'pragma solidity ^0.8.0; contract Test {}',
        contractname: 'Test',
        compilerversion: 'v0.8.19',
        zksolcVersion: 'v1.3.13',
        codeformat: 'solidity-single-file',
        compilermode: '3',
      });

      expect(typeof result).toBe('string');
      expect(result).toBe('a7lpxkm9kpcpicx7daftmjifrfhiuhf5vqqnawhkfhzfrcpnxj');
    });
  });

  describe('verifyStylus', () => {
    it('should verify Stylus source code', async () => {
      mockFetchResponse(mockResponses.verification);

      const result = await client.contract.verifyStylus({
        contractaddress: TEST_ADDRESSES.CONTRACT,
        sourceCode: 'use stylus_sdk::prelude::*;',
        contractname: 'Test',
        compilerversion: 'v0.1.0',
        codeformat: 'solidity-single-file',
      });

      expect(typeof result).toBe('string');
      expect(result).toBe('a7lpxkm9kpcpicx7daftmjifrfhiuhf5vqqnawhkfhzfrcpnxj');
    });
  });

  describe('checkProxyVerification', () => {
    it('should check proxy verification status', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: 'Proxy verification completed successfully',
      });

      const result = await client.contract.checkProxyVerification({
        guid: '12345678-1234-1234-1234-123456789012',
      });

      expect(typeof result).toBe('string');
      expect(result).toBe('Proxy verification completed successfully');
    });
  });

  describe('verifySourceCode', () => {
    it('should verify Solidity source code', async () => {
      mockFetchResponse(mockResponses.verification);

      const result = await client.contract.verifySourceCode({
        contractaddress: TEST_ADDRESSES.CONTRACT,
        sourceCode: 'pragma solidity ^0.8.0; contract Test {}',
        contractname: 'Test',
        compilerversion: 'v0.8.19+commit.7dd6d404',
        optimizationUsed: '1',
        runs: '200',
        constructorArguments: '',
        evmVersion: 'default',
        licenseType: 'MIT',
        codeformat: 'solidity-single-file',
      });

      expect(typeof result).toBe('string');
      expect(result).toBe('a7lpxkm9kpcpicx7daftmjifrfhiuhf5vqqnawhkfhzfrcpnxj');
    });
  });

  describe('getContractCreation', () => {
    it('should get contract creation info', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            contractAddress: TEST_ADDRESSES.CONTRACT,
            contractCreator: TEST_ADDRESSES.VITALIK,
            txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          },
        ],
      });

      const result = await client.contract.getContractCreation({
        contractaddresses: TEST_ADDRESSES.CONTRACT,
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toEqual({
        contractAddress: TEST_ADDRESSES.CONTRACT,
        contractCreator: TEST_ADDRESSES.VITALIK,
        txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      });
    });
  });

  describe('verifyProxyContract', () => {
    it('should verify proxy contract', async () => {
      mockFetchResponse(mockResponses.verification);

      const result = await client.contract.verifyProxyContract({
        address: TEST_ADDRESSES.CONTRACT,
        expectedimplementation: '0x1234567890abcdef1234567890abcdef12345678',
      });

      expect(typeof result).toBe('string');
      expect(result).toBe('a7lpxkm9kpcpicx7daftmjifrfhiuhf5vqqnawhkfhzfrcpnxj');
    });
  });

  describe('verifyVyper', () => {
    it('should verify Vyper source code', async () => {
      mockFetchResponse(mockResponses.verification);

      const result = await client.contract.verifyVyper({
        contractaddress: TEST_ADDRESSES.CONTRACT,
        sourceCode: '# @version ^0.3.7\n\ncontract Test:',
        contractname: 'Test',
        compilerversion: 'v0.3.7+commit.6020b8bb',
        optimizationUsed: '1',
        codeformat: 'solidity-single-file',
      });

      expect(typeof result).toBe('string');
      expect(result).toBe('a7lpxkm9kpcpicx7daftmjifrfhiuhf5vqqnawhkfhzfrcpnxj');
    });
  });

  describe('checkVerifyStatus', () => {
    it('should check verification status', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: 'Pass - Verified',
      });

      const result = await client.contract.checkVerifyStatus({
        guid: '12345678-1234-1234-1234-123456789012',
      });

      expect(typeof result).toBe('string');
      expect(result).toBe('Pass - Verified');
    });
  });
});

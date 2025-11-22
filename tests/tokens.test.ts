import { describe, it, expect, beforeEach } from 'vitest';
import { EtherscanClient } from '../src/client';
import { resetMocks, mockFetchResponse, mockResponses } from './setup';
import { TEST_ADDRESSES } from './setup';

describe('Tokens Module', () => {
  let client: EtherscanClient;

  beforeEach(() => {
    resetMocks();
    client = new EtherscanClient({
      apiKey: 'test-key',
    });
  });

  describe('getTokenHolderList', () => {
    it('should get token holder list', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            TokenHolderAddress: TEST_ADDRESSES.VITALIK,
            TokenHolderQuantity: '1000000000000000000000',
          },
          {
            TokenHolderAddress: TEST_ADDRESSES.CONTRACT,
            TokenHolderQuantity: '500000000000000000000',
          },
        ],
      });

      const holders = await client.tokens.getTokenHolderList({
        contractaddress: TEST_ADDRESSES.CONTRACT,
        page: 1,
        offset: 2,
      });

      expect(holders).toEqual([
        {
          TokenHolderAddress: TEST_ADDRESSES.VITALIK,
          TokenHolderQuantity: 1000000000000000000000n,
        },
        {
          TokenHolderAddress: TEST_ADDRESSES.CONTRACT,
          TokenHolderQuantity: 500000000000000000000n,
        },
      ]);
    });
  });

  describe('getTopHolders', () => {
    it('should get top token holders', async () => {
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

      const topHolders = await client.tokens.getTopHolders({
        contractaddress: TEST_ADDRESSES.CONTRACT,
        offset: 1,
      });

      expect(topHolders).toEqual([
        {
          TokenHolderAddress: TEST_ADDRESSES.VITALIK,
          TokenHolderQuantity: 1000000000000000000000n,
        },
      ]);
    });
  });

  describe('getTokenInfo', () => {
    it('should get token info', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            contractAddress: TEST_ADDRESSES.CONTRACT,
            tokenName: 'Test Token',
            symbol: 'TEST',
            divisor: '18',
            tokenType: 'ERC20',
            totalSupply: '1000000000000000000000000',
            blueCheckmark: 'true',
            description: 'A test token',
            website: 'https://test.com',
            email: 'test@test.com',
            blog: 'https://blog.test.com',
            reddit: 'https://reddit.com/r/test',
            slack: 'https://slack.test.com',
            facebook: 'https://facebook.com/test',
            twitter: 'testtwitter',
            bitcointalk: 'https://bitcointalk.org/test',
            github: 'https://github.com/test',
            telegram: 'testtelegram',
            linkedin: 'testlinkedin',
            discord: 'testdiscord',
            whitepaper: 'https://whitepaper.test.com',
            tokenPriceUSD: '1.00',
          },
        ],
      });

      const tokenInfo = await client.tokens.getTokenInfo({
        contractaddress: TEST_ADDRESSES.CONTRACT,
      });

      expect(tokenInfo).toEqual([
        expect.objectContaining({
          contractAddress: TEST_ADDRESSES.CONTRACT,
          tokenName: 'Test Token',
          symbol: 'TEST',
          totalSupply: 1000000000000000000000000n,
          tokenType: 'ERC20',
        }),
      ]);
    });
  });

  describe('getTokenHolderCount', () => {
    it('should get token holder count', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1500',
      });

      const holderCount = await client.tokens.getTokenHolderCount({
        contractaddress: TEST_ADDRESSES.CONTRACT,
      });

      expect(holderCount).toBe(1500);
    });
  });

  describe('getTokenSupply', () => {
    it('should get token supply', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000000000',
      });

      const supply = await client.tokens.getTokenSupply({
        contractaddress: TEST_ADDRESSES.CONTRACT,
      });

      expect(supply).toBe(1000000000000000000000000n);
    });
  });

  describe('getTokenBalance', () => {
    it('should get token balance', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000000',
      });

      const balance = await client.tokens.getTokenBalance({
        contractaddress: TEST_ADDRESSES.CONTRACT,
        address: TEST_ADDRESSES.VITALIK,
      });

      expect(balance).toBe(1000000000000000000000n);
    });
  });

  describe('getTokenSupplyHistory', () => {
    it('should get token supply history', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000000000',
      });

      const supplyHistory = await client.tokens.getTokenSupplyHistory({
        contractaddress: TEST_ADDRESSES.CONTRACT,
        blockno: 18500000,
      });

      expect(supplyHistory).toBe(1000000000000000000000000n);
    });
  });

  describe('getTokenBalanceHistory', () => {
    it('should get token balance history', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000000',
      });

      const balanceHistory = await client.tokens.getTokenBalanceHistory({
        contractaddress: TEST_ADDRESSES.CONTRACT,
        address: TEST_ADDRESSES.VITALIK,
        blockno: 18500000,
      });

      expect(balanceHistory).toBe(1000000000000000000000n);
    });
  });

  describe('getAddressTokenBalance', () => {
    it('should get address token balance', async () => {
      mockFetchResponse(mockResponses.addressTokenBalance);

      const balance = await client.tokens.getAddressTokenBalance({
        address: TEST_ADDRESSES.VITALIK,
      });

      expect(balance).toEqual([
        {
          TokenAddress: TEST_ADDRESSES.CONTRACT,
          TokenName: 'Test Token',
          TokenSymbol: 'TEST',
          TokenQuantity: 1000000000000000000000n,
          TokenDivisor: '18',
          TokenPriceUSD: '1.00',
        },
      ]);
    });
  });

  describe('getAddressTokenNftBalance', () => {
    it('should get address NFT balance', async () => {
      mockFetchResponse(mockResponses.addressNftBalance);

      const balance = await client.tokens.getAddressTokenNftBalance({
        address: TEST_ADDRESSES.VITALIK,
      });

      expect(balance).toEqual(mockResponses.addressNftBalance.result);
    });
  });

  describe('getAddressTokenNftInventory', () => {
    it('should get address NFT inventory', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            TokenAddress: TEST_ADDRESSES.CONTRACT,
            TokenId: '123',
          },
        ],
      });

      const inventory = await client.tokens.getAddressTokenNftInventory({
        address: TEST_ADDRESSES.VITALIK,
        contractaddress: TEST_ADDRESSES.CONTRACT,
      });

      expect(inventory).toEqual([
        {
          TokenAddress: TEST_ADDRESSES.CONTRACT,
          TokenId: '123',
        },
      ]);
    });
  });
});

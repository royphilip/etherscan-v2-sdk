import { describe, it, expect } from 'vitest';
import { EtherscanClient } from '../src/client';

describe('Live API Tests', () => {
  // Skip all tests unless ETHERSCAN_LIVE=1 is set
  if (!process.env.ETHERSCAN_LIVE) {
    describe.skip('Live tests disabled - set ETHERSCAN_LIVE=1 to run', () => {
      it('should run live tests when enabled', () => {
        // This test is never reached due to describe.skip
      });
    });
    return;
  }

  let client: EtherscanClient;

  beforeAll(() => {
    if (!process.env.ETHERSCAN_API_KEY) {
      throw new Error('ETHERSCAN_API_KEY environment variable required for live tests');
    }

    client = new EtherscanClient({
      apiKey: process.env.ETHERSCAN_API_KEY,
    });
  });

  describe('Live Account API', () => {
    it('should fetch real balance from Etherscan', async () => {
      const balance = await client.account.getBalance({
        address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik
      });

      expect(typeof balance).toBe('bigint');
      expect(balance).toBeGreaterThan(0n);
    }, 10000); // 10 second timeout for API calls
  });

  describe('Live Stats API', () => {
    it('should fetch real ETH supply from Etherscan', async () => {
      const supply = await client.stats.getEthSupply();

      expect(typeof supply).toBe('bigint');
      expect(supply).toBeGreaterThan(100000000000000000000000000n); // > 100M ETH
    }, 10000);
  });
});
import { describe, it, expect, beforeEach } from 'vitest';
import { EtherscanClient } from '../src/client';
import { resetMocks, mockFetchResponse, mockResponses } from './setup';

describe('Stats Module', () => {
  let client: EtherscanClient;

  beforeEach(() => {
    resetMocks();
    client = new EtherscanClient({
      apiKey: 'test-key',
    });
  });

  describe('getDailyTxnFee', () => {
    it('should get daily transaction fees', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            UTCDate: '2023-01-01',
            unixTimeStamp: '1672531200',
            transactionFee_Eth: '100.5',
          },
        ],
      });

      const txnFees = await client.stats.getDailyTxnFee({
        startdate: '2023-11-22',
        enddate: '2023-11-22',
      });

      expect(txnFees).toEqual([
        {
          UTCDate: '2023-01-01',
          unixTimeStamp: '1672531200',
          transactionFee_Eth: '100.5',
        },
      ]);
    });
  });

  describe('getEthSupply', () => {
    it('should get total ETH supply', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: '120000000000000000000000000',
      });

      const ethSupply = await client.stats.getEthSupply();

      expect(ethSupply).toBe(120000000000000000000000000n);
    });
  });

  describe('getEthDailyPrice', () => {
    it('should get daily ETH price', async () => {
      mockFetchResponse(mockResponses.dailyStats);

      const ethPrice = await client.stats.getEthDailyPrice({
        startdate: '2023-11-22',
        enddate: '2023-11-22',
      });

      expect(ethPrice).toEqual(mockResponses.dailyStats.result);
    });
  });

  describe('getEthPrice', () => {
    it('should get current ETH price', async () => {
      mockFetchResponse(mockResponses.ethPrice);

      const ethPrice = await client.stats.getEthPrice();

      expect(ethPrice).toEqual(mockResponses.ethPrice.result);
    });
  });

  describe('getDailyAvgNetDifficulty', () => {
    it('should get daily average network difficulty', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            UTCDate: '2023-01-01',
            unixTimeStamp: '1672531200',
            networkDifficulty: '1000000000000',
          },
        ],
      });

      const netDifficulty = await client.stats.getDailyAvgNetDifficulty({
        startdate: '2023-11-22',
        enddate: '2023-11-22',
      });

      expect(netDifficulty).toEqual([
        {
          UTCDate: '2023-01-01',
          unixTimeStamp: '1672531200',
          networkDifficulty: '1000000000000',
        },
      ]);
    });
  });

  describe('getDailyTx', () => {
    it('should get daily transaction count', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            UTCDate: '2023-01-01',
            unixTimeStamp: '1672531200',
            transactionCount: '100000',
          },
        ],
      });

      const txCount = await client.stats.getDailyTx({
        startdate: '2023-11-22',
        enddate: '2023-11-22',
      });

      expect(txCount).toEqual([
        {
          UTCDate: '2023-01-01',
          unixTimeStamp: '1672531200',
          transactionCount: 100000,
        },
      ]);
    });
  });

  describe('getDailyAvgHashrate', () => {
    it('should get daily average hashrate', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            UTCDate: '2023-01-01',
            unixTimeStamp: '1672531200',
            networkHashRate: '100000000000',
          },
        ],
      });

      const hashrate = await client.stats.getDailyAvgHashrate({
        startdate: '2023-11-22',
        enddate: '2023-11-22',
      });

      expect(hashrate).toEqual([
        {
          UTCDate: '2023-01-01',
          unixTimeStamp: '1672531200',
          networkHashRate: '100000000000',
        },
      ]);
    });
  });

  describe('getNodeCount', () => {
    it('should get node count', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: {
          UTCDate: '2023-01-01',
          TotalNodeCount: '8500',
        },
      });

      const nodeCount = await client.stats.getNodeCount();

      expect(nodeCount).toEqual({
        UTCDate: '2023-01-01',
        TotalNodeCount: '8500',
      });
    });
  });

  describe('getDailyNetUtilization', () => {
    it('should get daily network utilization', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            UTCDate: '2023-01-01',
            unixTimeStamp: '1672531200',
            networkUtilization: '85.5',
          },
        ],
      });

      const netUtilization = await client.stats.getDailyNetUtilization({
        startdate: '2023-11-22',
        enddate: '2023-11-22',
      });

       expect(netUtilization).toEqual([
         {
           UTCDate: '2023-01-01',
           unixTimeStamp: '1672531200',
           networkUtilization: '85.5',
         },
       ]);
    });
  });

  describe('getChainSize', () => {
    it('should get chain size', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            blockNumber: '1000000',
            chainTimeStamp: '2023-01-01',
            chainSize: '1000000000',
          },
        ],
      });

      const chainSize = await client.stats.getChainSize({
        startdate: '2023-11-22',
        enddate: '2023-11-22',
      });

      expect(chainSize).toEqual([
        {
          blockNumber: '1000000',
          chainTimeStamp: '2023-01-01',
          chainSize: '1000000000',
        },
      ]);
    });
  });

  describe('getEthSupply2', () => {
    it('should get ETH supply including staking', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: {
          EthSupply: '120000000000000000000000000',
          Eth2Staking: '5000000000000000000000000',
          BurntFees: '1000000000000000000000000',
          WithdrawnTotal: '2000000000000000000000000',
        },
      });

      const ethSupply = await client.stats.getEthSupply2();

      expect(ethSupply).toEqual({
        EthSupply: '120000000000000000000000000',
        Eth2Staking: '5000000000000000000000000',
        BurntFees: '1000000000000000000000000',
        WithdrawnTotal: '2000000000000000000000000',
      });
    });
  });

  describe('getDailyNewAddress', () => {
    it('should get daily new addresses', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            UTCDate: '2023-01-01',
            unixTimeStamp: '1672531200',
            newAddressCount: '1000',
          },
        ],
      });

      const newAddresses = await client.stats.getDailyNewAddress({
        startdate: '2023-11-22',
        enddate: '2023-11-22',
      });

      expect(newAddresses).toEqual([
        {
          UTCDate: '2023-01-01',
          unixTimeStamp: '1672531200',
          newAddressCount: 1000,
        },
      ]);
    });
  });
});

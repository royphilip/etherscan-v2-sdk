import { describe, it, expect, beforeEach } from 'vitest';
import { EtherscanClient } from '../src/client';
import { resetMocks, mockFetchResponse, mockResponses } from './setup';

describe('Gas Tracker Module', () => {
  let client: EtherscanClient;

  beforeEach(() => {
    resetMocks();
    client = new EtherscanClient({
      apiKey: 'test-key',
    });
  });

  describe('getGasEstimate', () => {
    it('should estimate confirmation time', async () => {
      mockFetchResponse(mockResponses.gasEstimate);

      const gasEstimate = await client.gasTracker.getGasEstimate({
        gasprice: '20000000000',
      });

      expect(gasEstimate).toBe(30);
    });
  });

  describe('getGasOracle', () => {
    it('should get gas oracle data', async () => {
      mockFetchResponse(mockResponses.gasOracle);

      const gasOracle = await client.gasTracker.getGasOracle();

      expect(gasOracle).toEqual(mockResponses.gasOracle.result);
    });
  });

  describe('getDailyAvgGasLimit', () => {
    it('should get daily average gas limit', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            UTCDate: '2023-01-01',
            unixTimeStamp: '1672531200',
            gasLimit: '30000000',
          },
        ],
      });

      const avgGasLimit = await client.gasTracker.getDailyAvgGasLimit({
        startdate: '2023-11-22',
        enddate: '2023-11-22',
      });

      expect(avgGasLimit).toEqual([
        {
          UTCDate: '2023-01-01',
          unixTimeStamp: '1672531200',
          gasLimit: '30000000',
        },
      ]);
    });
  });

  describe('getDailyAvgGasPrice', () => {
    it('should get daily average gas price', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            UTCDate: '2023-01-01',
            unixTimeStamp: '1672531200',
            maxGasPrice_Wei: '100000000000',
            minGasPrice_Wei: '10000000000',
            avgGasPrice_Wei: '50000000000',
          },
        ],
      });

      const avgGasPrice = await client.gasTracker.getDailyAvgGasPrice({
        startdate: '2023-11-22',
        enddate: '2023-11-22',
      });

      expect(avgGasPrice).toEqual([
        {
          UTCDate: '2023-01-01',
          unixTimeStamp: '1672531200',
          maxGasPrice_Wei: '100000000000',
          minGasPrice_Wei: '10000000000',
          avgGasPrice_Wei: '50000000000',
        },
      ]);
    });
  });

  describe('getDailyGasUsed', () => {
    it('should get daily gas used', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            UTCDate: '2023-01-01',
            unixTimeStamp: '1672531200',
            gasUsed: '1000000000',
          },
        ],
      });

      const gasUsed = await client.gasTracker.getDailyGasUsed({
        startdate: '2023-11-22',
        enddate: '2023-11-22',
      });

      expect(gasUsed).toEqual([
        {
          UTCDate: '2023-01-01',
          unixTimeStamp: '1672531200',
          gasUsed: '1000000000',
        },
      ]);
    });
  });
});

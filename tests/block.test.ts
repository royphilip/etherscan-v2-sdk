import { describe, it, expect, beforeEach } from 'vitest';
import { EtherscanClient } from '../src/client';
import { resetMocks, mockFetchResponse, mockResponses } from './setup';
import { TEST_ADDRESSES } from './setup';

describe('Block Module', () => {
  let client: EtherscanClient;

  beforeEach(() => {
    resetMocks();
    client = new EtherscanClient({
      apiKey: 'test-key',
    });
  });

  describe('getBlockReward', () => {
    it('should get block reward by block number', async () => {
      mockFetchResponse(mockResponses.blockReward);

      const blockReward = await client.block.getBlockReward({
        blockno: 12345678,
      });

      expect(blockReward).toEqual({
        blockNumber: '12345678',
        timeStamp: '1609459200',
        blockMiner: TEST_ADDRESSES.VITALIK,
        blockReward: 2000000000000000000n,
        uncles: [],
        uncleInclusionReward: 0n,
      });
    });
  });

  describe('getBlockNoByTime', () => {
    it('should get block number by timestamp', async () => {
      mockFetchResponse(mockResponses.blockNoByTime);

      const blockNo = await client.block.getBlockNoByTime({
        timestamp: 1609459200,
        closest: 'before',
      });

      expect(blockNo).toBe(12345678);
    });
  });

  describe('getBlockCountdown', () => {
    it('should get block countdown', async () => {
      mockFetchResponse(mockResponses.blockCountdown);

      const countdown = await client.block.getBlockCountdown({
        blockno: 12345678,
      });

      expect(countdown).toEqual({
        CurrentBlock: '23853694',
        CountdownBlock: '24015880',
        RemainingBlock: 162186,
        EstimateTimeInSec: '1962465.6',
      });
    });
  });

  describe('getDailyAvgBlockSize', () => {
    it('should get daily average block size', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            UTCDate: '2023-01-01',
            unixTimeStamp: '1672531200',
            blockSize_bytes: '25000',
          },
        ],
      });

      const avgBlockSize = await client.block.getDailyAvgBlockSize({
        startdate: '2023-11-22',
        enddate: '2023-11-22',
      });

      expect(avgBlockSize).toEqual([
        {
          UTCDate: '2023-01-01',
          unixTimeStamp: '1672531200',
          blockSize_bytes: 25000,
        },
      ]);
    });
  });

  describe('getDailyBlockCount', () => {
    it('should get daily block count', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            UTCDate: '2023-01-01',
            unixTimeStamp: '1672531200',
            blockCount: '6500',
            blockRewards_Eth: '20000.5',
          },
        ],
      });

      const blockCount = await client.block.getDailyBlockCount({
        startdate: '2023-11-22',
        enddate: '2023-11-22',
      });

      expect(blockCount).toEqual([
        {
          UTCDate: '2023-01-01',
          unixTimeStamp: '1672531200',
          blockCount: 6500,
          blockRewards_Eth: '20000.5',
        },
      ]);
    });
  });

  describe('getDailyBlockRewards', () => {
    it('should get daily block rewards', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            UTCDate: '2023-01-01',
            unixTimeStamp: '1672531200',
            blockRewards_Eth: '20000.5',
          },
        ],
      });

      const blockRewards = await client.block.getDailyBlockRewards({
        startdate: '2023-11-22',
        enddate: '2023-11-22',
      });

      expect(blockRewards).toEqual([
        {
          UTCDate: '2023-01-01',
          unixTimeStamp: '1672531200',
          blockRewards_Eth: '20000.5',
        },
      ]);
    });
  });

  describe('getDailyAvgBlockTime', () => {
    it('should get daily average block time', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            UTCDate: '2023-01-01',
            unixTimeStamp: '1672531200',
            blockTime_sec: '15.5',
          },
        ],
      });

      const avgBlockTime = await client.block.getDailyAvgBlockTime({
        startdate: '2023-11-22',
        enddate: '2023-11-22',
      });

       expect(avgBlockTime).toEqual([
         {
           UTCDate: '2023-01-01',
           unixTimeStamp: '1672531200',
           blockTime_sec: '15.5',
         },
       ]);
    });
  });

  describe('getDailyUncleBlockCount', () => {
    it('should get daily uncle block count and rewards', async () => {
      mockFetchResponse({
        status: '1',
        message: 'OK',
        result: [
          {
            UTCDate: '2023-01-01',
            unixTimeStamp: '1672531200',
            uncleBlockCount: '100',
            uncleBlockRewards_Eth: '250.5',
          },
        ],
      });

      const uncleBlocks = await client.block.getDailyUncleBlockCount({
        startdate: '2023-11-22',
        enddate: '2023-11-22',
      });

      expect(uncleBlocks).toEqual([
        {
          UTCDate: '2023-01-01',
          unixTimeStamp: '1672531200',
          uncleBlockCount: 100,
          uncleBlockRewards_Eth: '250.5',
        },
      ]);
    });
  });
});

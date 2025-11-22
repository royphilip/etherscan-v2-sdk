import { z } from 'zod';
import { BaseModule } from './base';
import { NumberStringSchema, BlockRewardSchema, BlockCountdownSchema, DailyBlockSizeSchema, DailyBlockTimeSchema, DailyBlockCountSchema, DailyBlockRewardsSchema, DailyUncleBlockCountSchema } from '../core/types';
import { Validators } from '../core/validators';

export class Block extends BaseModule {
  /**
   * Get Block and Uncle Rewards by Block Number
   * Retrieves block rewards along with associated Uncle block rewards.
   */
  async getBlockReward(params: {
    /** Parameter blockno */
    blockno: number | string;
  }) {
    return this.transport.get(
      {
        module: 'block',
        action: 'getblockreward',
        ...params,
      },
      BlockRewardSchema
    );
  }

  /**
   * Get Block Number by Timestamp
   * Retrieves the block number mined at a specific timestamp.
   */
  async getBlockNoByTime(params: {
    /** Parameter timestamp */
    timestamp?: number | string;
    /** Parameter closest */
    closest?: string;
  }) {
    return this.transport.get(
      {
        module: 'block',
        action: 'getblocknobytime',
        ...params,
      },
      NumberStringSchema
    );
  }

  /**
   * Get Estimated Block Countdown by Block Number
   * Retrieves the estimated time, in seconds, until a specified block is mined.
   */
  async getBlockCountdown(params: {
    /** Parameter blockno */
    blockno: number | string;
  }) {
    return this.transport.get(
      {
        module: 'block',
        action: 'getblockcountdown',
        ...params,
      },
      BlockCountdownSchema
    );
  }

  /**
    * Get Daily Average Block Time
    * Retrieves the daily average block time over a date range.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getDailyAvgBlockSize(params: {
    /** Parameter startdate */
    startdate: string;
    /** Parameter enddate */
    enddate: string;
    /** Parameter sort */
    sort?: string;
  }) {
    Validators.validateDateRange(params);

    return this.transport.get(
      {
        module: 'stats',
        action: 'dailyavgblocksize',
        ...params,
      },
      z.array(DailyBlockSizeSchema)
    );
  }

  /**
    * Get Daily Uncle Block Count and Rewards
    * Retrieves the daily uncle block count and rewards over a date range.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getDailyBlockCount(params: {
    /** Parameter startdate */
    startdate: string;
    /** Parameter enddate */
    enddate: string;
    /** Parameter sort */
    sort?: string;
  }) {
    Validators.validateDateRange(params);

    return this.transport.get(
      {
        module: 'stats',
        action: 'dailyblkcount',
        ...params,
      },
      z.array(DailyBlockCountSchema)
    );
  }

  /**
    * Get Daily Block Rewards
    * Retrieves the daily block rewards over a date range.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getDailyBlockRewards(params: {
    /** Parameter startdate */
    startdate: string;
    /** Parameter enddate */
    enddate: string;
    /** Parameter sort */
    sort?: string;
  }) {
    Validators.validateDateRange(params);

    return this.transport.get(
      {
        module: 'stats',
        action: 'dailyblockrewards',
        ...params,
      },
      z.array(DailyBlockRewardsSchema)
    );
  }

  /**
    * Get Daily Average Block Time
    * Retrieves the daily average time taken to successfully mine a block.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getDailyAvgBlockTime(params: {
    /** Parameter startdate */
    startdate: string;
    /** Parameter enddate */
    enddate: string;
    /** Parameter sort */
    sort?: string;
  }) {
    Validators.validateDateRange(params);

    return this.transport.get(
      {
        module: 'stats',
        action: 'dailyavgblocktime',
        ...params,
      },
      z.array(DailyBlockTimeSchema)
    );
  }

  /**
    * Get Daily Uncle Block Count and Rewards
    * Returns the daily count of Uncle blocks mined and their associated rewards.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getDailyUncleBlockCount(params: {
    /** Parameter startdate */
    startdate: string;
    /** Parameter enddate */
    enddate: string;
    /** Parameter sort */
    sort?: string;
  }) {
    Validators.validateDateRange(params);

    return this.transport.get(
      {
        module: 'stats',
        action: 'dailyuncleblkcount',
        ...params,
      },
      z.array(DailyUncleBlockCountSchema)
    );
  }
}

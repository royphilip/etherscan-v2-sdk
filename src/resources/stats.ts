import { z } from 'zod';
import { BaseModule } from './base';
import {
  BigIntSchema,
  StatsSchema,
  DailyTransactionCountSchema,
  DailyNetworkUtilizationSchema,
  DailyNewAddressSchema,
  DailyTransactionFeeSchema,
  DailyEthPriceSchema,
  DailyHashrateSchema,
  DailyNetworkDifficultySchema,
  NodeCountSchema,
  ChainSizeSchema,
  EthSupply2Schema,
} from '../core/types';
import { Validators } from '../core/validators';

export class Stats extends BaseModule {
  /**
    * Get Daily Network Transaction Fee
    * Retrieves the total transaction fees paid to miners each day.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getDailyTxnFee(params: {
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
        action: 'dailytxnfee',
        ...params,
      },
      z.array(DailyTransactionFeeSchema)
    );
  }

  /**
   * Get Total Supply of Ether
   * Retrieves the current circulating supply of Ether, excluding ETH2 staking rewards and EIP-1559 burned fees.
   */
  async getEthSupply() {
    return this.transport.get(
      {
        module: 'stats',
        action: 'ethsupply',
      },
      BigIntSchema
    );
  }

  /**
    * Get Ether Historical Price
    * Returns the historical price data for 1 ETH.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getEthDailyPrice(params: {
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
        action: 'ethdailyprice',
        ...params,
      },
      z.array(DailyEthPriceSchema)
    );
  }

  /**
   * Get Ether Last Price
   * Retrieves the latest price of the native/gas token.
   */
  async getEthPrice() {
    return this.transport.get(
      {
        module: 'stats',
        action: 'ethprice',
      },
      StatsSchema
    );
  }

  /**
    * Get Daily Average Network Difficulty
    * Returns the historical mining difficulty data of the network.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getDailyAvgNetDifficulty(params: {
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
        action: 'dailyavgnetdifficulty',
        ...params,
      },
      z.array(DailyNetworkDifficultySchema)
    );
  }

  /**
    * Get Daily Transaction Count
    * Retrieves the daily number of transactions executed in the blockchain.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getDailyTx(params: {
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
        action: 'dailytx',
        ...params,
      },
      z.array(DailyTransactionCountSchema)
    );
  }

  /**
    * Get Daily Average Network Hash Rate
    * Retrieves the historical hash rate, reflecting the processing power of the network over time.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getDailyAvgHashrate(params: {
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
        action: 'dailyavghashrate',
        ...params,
      },
      z.array(DailyHashrateSchema)
    );
  }

  /**
   * Get Total Nodes Count
   * Retrieves the total count of discoverable Ethereum nodes.
   */
  async getNodeCount() {
    return this.transport.get(
      {
        module: 'stats',
        action: 'nodecount',
      },
      NodeCountSchema
    );
  }

  /**
    * Get Daily Network Utilization
    * Retrieves the daily average percentage of gas used relative to the gas limit.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getDailyNetUtilization(params: {
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
        action: 'dailynetutilization',
        ...params,
      },
      z.array(DailyNetworkUtilizationSchema)
    );
  }

  /**
   * Get Ethereum Nodes Size
   * Retrieves the total size of the Ethereum blockchain, in bytes, within a specified date range.
   */
  async getChainSize(params: {
    /** Parameter startdate */
    startdate: string;
    /** Parameter enddate */
    enddate: string;
    /** Parameter clienttype */
    clienttype?: string;
    /** Parameter syncmode */
    syncmode?: string;
    /** Parameter sort */
    sort?: string;
  }) {
    Validators.validateDateRange(params);

    return this.transport.get(
      {
        module: 'stats',
        action: 'chainsize',
        ...params,
      },
      z.array(ChainSizeSchema)
    );
  }

  /**
   * Get Total Supply of Ether 2
   * Retrieves the current Ether supply, including circulation, ETH2 staking rewards, EIP-1559 burned fees, and total ETH withdrawn from the beacon chain.
   */
  async getEthSupply2() {
    return this.transport.get(
      {
        module: 'stats',
        action: 'ethsupply2',
      },
      EthSupply2Schema
    );
  }

  /**
    * Get Daily New Address Count
    * Retrieves the daily count of newly created addresses.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getDailyNewAddress(params: {
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
        action: 'dailynewaddress',
        ...params,
      },
      z.array(DailyNewAddressSchema)
    );
  }
}

import { z } from 'zod';
import { BaseModule } from './base';
import { NumberStringSchema, GasOracleSchema, DailyGasLimitSchema, DailyGasUsedSchema, DailyGasPriceSchema } from '../core/types';
import { Validators } from '../core/validators';

export class GasTracker extends BaseModule {
  /**
   * Get Estimation of Confirmation Time
   * Estimate confirmation time based on a provided gas price.
   */
  async getGasEstimate(params: {
    /** Parameter gasprice */
    gasprice?: string;
  }) {
    return this.transport.get(
      {
        module: 'gastracker',
        action: 'gasestimate',
        ...params,
      },
      NumberStringSchema
    );
  }

  /**
   * Get Gas Oracle
   * Get current gas price recommendations.
   */
  async getGasOracle() {
    return this.transport.get(
      {
        module: 'gastracker',
        action: 'gasoracle',
      },
      GasOracleSchema
    );
  }

  /**
    * Get Daily Average Gas Limit
    * Retrieve historical daily average gas limit.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getDailyAvgGasLimit(params: {
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
        action: 'dailyavggaslimit',
        ...params,
      },
      z.array(DailyGasLimitSchema)
    );
  }

  /**
    * Get Daily Average Gas Price
    * Retrieve daily average gas price statistics.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getDailyAvgGasPrice(params: {
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
        action: 'dailyavggasprice',
        ...params,
      },
      z.array(DailyGasPriceSchema)
    );
  }

  /**
    * Get Ethereum Daily Total Gas Used
    * Retrieve the total gas used each day.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getDailyGasUsed(params: {
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
        action: 'dailygasused',
        ...params,
      },
      z.array(DailyGasUsedSchema)
    );
  }
}

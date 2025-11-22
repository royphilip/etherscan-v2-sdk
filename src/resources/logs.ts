import { z } from 'zod';
import { BaseModule } from './base';
import { LogSchema } from '../core/types';

export class Logs extends BaseModule {
  /**
   * Get Event Logs by Address
   * Retrieves event logs from a specific address, with optional block range filtering.
   */
  async getLogs(params: {
    /** Parameter address */
    address: string;
    /** Parameter fromBlock */
    fromBlock?: number | string;
    /** Parameter toBlock */
    toBlock?: number | string;
    /** Parameter page */
    page?: number | string;
    /** Parameter offset */
    offset?: number | string;
  }) {
    return this.transport.get(
      {
        module: 'logs',
        action: 'getLogs',
        ...params,
      },
      z.array(LogSchema)
    );
  }

  /**
   * Get Event Logs by Address and Topics
   * Retrieves event logs from a specified address, filtered by topics and block range.
   */
  async getLogsByAddressAndTopics(params: {
    /** Parameter fromBlock */
    fromBlock?: number | string;
    /** Parameter toBlock */
    toBlock?: number | string;
    /** Parameter address */
    address: string;
    /** Parameter topic0 */
    topic0?: string;
    /** Parameter topic0_1_opr */
    topic0_1_opr?: string;
    /** Parameter topic1 */
    topic1?: string;
    /** Parameter page */
    page?: number | string;
    /** Parameter offset */
    offset?: number | string;
  }) {
    return this.transport.get(
      {
        module: 'logs',
        action: 'getLogs',
        address: params.address,
        fromBlock: params.fromBlock,
        toBlock: params.toBlock,
        topic0: params.topic0,
        topic0_1_opr: params.topic0_1_opr,
        topic1: params.topic1,
        page: params.page,
        offset: params.offset,
      },
      z.array(LogSchema)
    );
  }

  /**
   * Get Event Logs by Topics
   * Retrieves event logs within a specified block range, filtered by topics.
   */
  async getLogsByTopics(params: {
    /** Parameter fromBlock */
    fromBlock?: number | string;
    /** Parameter toBlock */
    toBlock?: number | string;
    /** Parameter topic0 */
    topic0?: string;
    /** Parameter topic0_1_opr */
    topic0_1_opr?: string;
    /** Parameter topic1 */
    topic1?: string;
    /** Parameter topic1_2_opr */
    topic1_2_opr?: string;
    /** Parameter topic2 */
    topic2?: string;
    /** Parameter topic2_3_opr */
    topic2_3_opr?: string;
    /** Parameter topic3 */
    topic3?: string;
    /** Parameter topic0_2_opr */
    topic0_2_opr?: string;
    /** Parameter topic0_3_opr */
    topic0_3_opr?: string;
    /** Parameter topic1_3_opr */
    topic1_3_opr?: string;
    /** Parameter page */
    page?: number | string;
    /** Parameter offset */
    offset?: number | string;
  }) {
    return this.transport.get(
      {
        module: 'logs',
        action: 'getLogs',
        fromBlock: params.fromBlock,
        toBlock: params.toBlock,
        topic0: params.topic0,
        topic0_1_opr: params.topic0_1_opr,
        topic1: params.topic1,
        topic1_2_opr: params.topic1_2_opr,
        topic2: params.topic2,
        topic2_3_opr: params.topic2_3_opr,
        topic3: params.topic3,
        topic0_2_opr: params.topic0_2_opr,
        topic0_3_opr: params.topic0_3_opr,
        topic1_3_opr: params.topic1_3_opr,
        page: params.page,
        offset: params.offset,
      },
      z.array(LogSchema)
    );
  }
}
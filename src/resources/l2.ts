import { z } from 'zod';
import { BaseModule } from './base';
import { BridgeTransactionSchema, L2TransactionSchema } from '../core/types';

export class L2 extends BaseModule {
  /**
   * Get Plasma Deposits by Address
   * Retrieves a list of Plasma deposit transactions received by a specified address.
   */
  async getTxnBridge(params?: {
    /** The address to query, like `0xfefefefefefefefefefefefefefefefefefefefe`. */
    address?: string;
    /** The starting block number for the query. */
    startblock?: number | string;
    /** The ending block number for the query. */
    endblock?: number | string;
    /** Page number for pagination. */
    page?: number | string;
    /** Number of records per page. */
    offset?: number | string;
    /** Sort order: 'asc' or 'desc'. */
    sort?: 'asc' | 'desc';
  }) {
    return this.transport.get(
      {
        module: 'account',
        action: 'txnbridge',
        ...params,
      },
      z.array(BridgeTransactionSchema)
    );
  }

  /**
   * Get Deposit Transactions by Address
   * Retrieves all deposit transactions made by a specified address.
   */
  async getDepositTxs(params?: {
    /** The address to query, like `0xfefefefefefefefefefefefefefefefefefefefe`. */
    address?: string;
    /** The starting block number for the query. */
    startblock?: number | string;
    /** The ending block number for the query. */
    endblock?: number | string;
    /** Page number for pagination. */
    page?: number | string;
    /** Number of records per page. */
    offset?: number | string;
    /** Sort order: 'asc' or 'desc'. */
    sort?: 'asc' | 'desc';
  }) {
    return this.transport.get(
      {
        module: 'account',
        action: 'getdeposittxs',
        ...params,
      },
      z.array(L2TransactionSchema)
    );
  }

  /**
   * Get Withdrawal Transactions by Address
   * Retrieves all withdrawal transactions made by a specified address.
   */
  async getWithdrawalTxs(params?: {
    /** The address to query, like `0xfefefefefefefefefefefefefefefefefefefefe`. */
    address?: string;
    /** The starting block number for the query. */
    startblock?: number | string;
    /** The ending block number for the query. */
    endblock?: number | string;
    /** Page number for pagination. */
    page?: number | string;
    /** Number of records per page. */
    offset?: number | string;
    /** Sort order: 'asc' or 'desc'. */
    sort?: 'asc' | 'desc';
  }) {
    return this.transport.get(
      {
        module: 'account',
        action: 'getwithdrawaltxs',
        ...params,
      },
      z.array(L2TransactionSchema)
    );
  }
}

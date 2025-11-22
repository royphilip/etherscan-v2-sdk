import { z } from 'zod';
import { BaseModule } from './base';
import { TransactionStatusSchema, HashSchema } from '../core/types';

export class Transaction extends BaseModule {
  /**
   * Check Contract Execution Status
   * Retrieves the current status and execution result of a specific transaction.
   */
  async getStatus(txhash: string): Promise<z.infer<typeof TransactionStatusSchema>>;
  async getStatus(params: {
    /** The transaction hash to query. */
    txhash: string;
  }): Promise<z.infer<typeof TransactionStatusSchema>>;
  async getStatus(txhashOrParams: string | {
    txhash: string;
  }): Promise<z.infer<typeof TransactionStatusSchema>> {
    const params = typeof txhashOrParams === 'string' ? { txhash: txhashOrParams } : txhashOrParams;

    // Validate transaction hash format
    HashSchema.parse(params.txhash);

    return this.transport.get(
      {
        module: 'transaction',
        action: 'getstatus',
        ...params,
      },
      TransactionStatusSchema
    );
  }

  /**
   * Check Transaction Receipt Status
   * Retrieves the execution status of a specific transaction using its transaction hash.
   */
  async getReceiptStatus(txhash: string): Promise<{ status: string }>;
  async getReceiptStatus(params: {
    /** The transaction hash to query. */
    txhash: string;
  }): Promise<{ status: string }>;
  async getReceiptStatus(txhashOrParams: string | {
    txhash: string;
  }): Promise<{ status: string }> {
    const params = typeof txhashOrParams === 'string' ? { txhash: txhashOrParams } : txhashOrParams;

    // Validate transaction hash format
    HashSchema.parse(params.txhash);

    return this.transport.get(
      {
        module: 'transaction',
        action: 'gettxreceiptstatus',
        ...params,
      },
      z.object({ status: z.string() })
    );
  }
}

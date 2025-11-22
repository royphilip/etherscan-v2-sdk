import { BaseModule } from './base';
import { Validators } from '../core/validators';
import {
  NumberStringSchema,
  EthTransactionSchema,
  EthTransactionReceiptSchema,
  EthBlockSchema,
  HexString,
} from '../core/types';

export class Proxy extends BaseModule {
  /**
   * eth_getTransactionCount
   * Get the number of transactions sent from an address.
   */
  async getTransactionCount(params: {
    /** Parameter address */
    address?: string;
    /** Parameter tag */
    tag?: string;
  }) {
    Validators.address(params.address, 'address');

    return this.transport.get(
      {
        module: 'proxy',
        action: 'eth_getTransactionCount',
        ...params,
      },
      HexString
    );
  }

  /**
   * eth_getTransactionByHash
   * Get transaction details by hash.
   */
  async getTransactionByHash(params: {
    /** Parameter txhash */
    txhash?: string;
  }) {
    Validators.hash(params.txhash, 'txhash');

    return this.transport.get(
      {
        module: 'proxy',
        action: 'eth_getTransactionByHash',
        ...params,
      },
      EthTransactionSchema
    );
  }

  /**
   * eth_call
   * Execute a call without creating a transaction.
   */
  async call(params: {
    /** Parameter to */
    to?: string;
    /** Parameter data */
    data?: string;
    /** Parameter tag */
    tag?: string;
  }) {
    Validators.address(params.to, 'to');

    return this.transport.get(
      {
        module: 'proxy',
        action: 'eth_call',
        ...params,
      },
      HexString
    );
  }

  /**
   * eth_blockNumber
   * Fetch the latest block number.
   */
  async getBlockNumber() {
    return this.transport.get(
      {
        module: 'proxy',
        action: 'eth_blockNumber',
      },
      HexString
    );
  }

  /**
   * eth_getTransactionReceipt
   * Get the receipt of a transaction by hash.
   */
  async getTransactionReceipt(params: {
    /** Parameter txhash */
    txhash?: string;
  }) {
    Validators.hash(params.txhash, 'txhash');

    return this.transport.get(
      {
        module: 'proxy',
        action: 'eth_getTransactionReceipt',
        ...params,
      },
      EthTransactionReceiptSchema
    );
  }

  /**
   * eth_getStorageAt
   * Get the value at a storage position.
   */
  async getStorageAt(params: {
    /** Parameter address */
    address?: string;
    /** Parameter position */
    position?: string;
    /** Parameter tag */
    tag?: string;
  }) {
    Validators.address(params.address, 'address');

    return this.transport.get(
      {
        module: 'proxy',
        action: 'eth_getStorageAt',
        ...params,
      },
      HexString
    );
  }

  /**
   * eth_getUncleByBlockNumberAndIndex
   * Get uncle block details by block number and index.
   */
  async getUncleByBlockNumberAndIndex(params: {
    /** Parameter tag */
    tag?: string;
    /** Parameter index */
    index?: string;
  }) {
    return this.transport.get(
      {
        module: 'proxy',
        action: 'eth_getUncleByBlockNumberAndIndex',
        ...params,
      },
      EthBlockSchema
    );
  }

  /**
   * eth_getBlockTransactionCountByNumber
   * Get the number of transactions in a block.
   */
  async getBlockTransactionCountByNumber(params: {
    /** Parameter tag */
    tag?: string;
  }) {
    return this.transport.get(
      {
        module: 'proxy',
        action: 'eth_getBlockTransactionCountByNumber',
        ...params,
      },
      NumberStringSchema
    );
  }

  /**
   * eth_getBlockByNumber
   * Get block information by number.
   */
  async getBlockByNumber(params: {
    /** Parameter tag */
    tag?: string;
    /** Parameter boolean */
    boolean?: string;
  }) {
    return this.transport.get(
      {
        module: 'proxy',
        action: 'eth_getBlockByNumber',
        ...params,
      },
      EthBlockSchema
    );
  }

  /**
   * eth_getCode
   * Get the code stored at an address.
   */
  async getCode(params: {
    /** Parameter address */
    address?: string;
    /** Parameter tag */
    tag?: string;
  }) {
    Validators.address(params.address, 'address');

    return this.transport.get(
      {
        module: 'proxy',
        action: 'eth_getCode',
        ...params,
      },
      HexString
    );
  }

  /**
   * eth_sendRawTransaction
   * Broadcast a signed transaction to the network.
   */
  async sendRawTransaction(params: {
    /** Parameter hex */
    hex?: string;
  }) {
    return this.transport.get(
      {
        module: 'proxy',
        action: 'eth_sendRawTransaction',
        ...params,
      },
      HexString
    );
  }

  /**
   * eth_getTransactionByBlockNumberAndIndex
   * Get transaction details by block number and index.
   */
  async getTransactionByBlockNumberAndIndex(params: {
    /** Parameter tag */
    tag?: string;
    /** Parameter index */
    index?: string;
  }) {
    return this.transport.get(
      {
        module: 'proxy',
        action: 'eth_getTransactionByBlockNumberAndIndex',
        ...params,
      },
      EthTransactionSchema
    );
  }

  /**
   * eth_estimateGas
   * Estimate the gas required for a transaction.
   */
  async estimateGas(params: {
    /** Parameter data */
    data?: string;
    /** Parameter to */
    to?: string;
    /** Parameter value */
    value?: string;
    /** Parameter gasPrice */
    gasPrice?: string;
    /** Parameter gas */
    gas?: string;
  }) {
    Validators.address(params.to, 'to');

    return this.transport.get(
      {
        module: 'proxy',
        action: 'eth_estimateGas',
        ...params,
      },
      HexString
    );
  }

  /**
   * eth_gasPrice
   * Get the current gas price.
   */
  async getGasPrice() {
    return this.transport.get(
      {
        module: 'proxy',
        action: 'eth_gasPrice',
      },
      HexString
    );
  }
}

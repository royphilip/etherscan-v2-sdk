import { z } from 'zod';
import { BaseModule } from './base';
import {
  BigIntSchema,
  TransactionSchema,
  TokenTransactionSchema,
  NFTTransactionSchema,
  ERC1155TransactionSchema,
  InternalTransactionSchema,
  BlockSchema,
  BeaconWithdrawalSchema,
  FundedBySchema,
  requireCapability,
} from '../core/types';
import { Validators } from '../core/validators';

export class Account extends BaseModule {
  /**
    * Get Balance
    * Get the balance of an address, or balances of multiple addresses.
    */
  async getBalance(address: string, tag?: string): Promise<bigint | Record<string, bigint>>;
  async getBalance(params: {
    /** The address(es) to query, like `0xfefefefefefefefefefefefefefefefefefefefe`. Up to 20 addresses can be queried, separated by commas. */
    address: string;
    /** Use `latest` for the last block number of the chain. Also accepts a specific block number in hex format, like `0x10d4f` up to the last 128 blocks. For historical balances, use the [Historical Balance](/api-reference/endpoint/balancehistory) endpoint. */
    tag?: string;
  }): Promise<bigint | Record<string, bigint>>;
  async getBalance(addressOrParams: string | {
    address: string;
    tag?: string;
  }, tag?: string): Promise<bigint | Record<string, bigint>> {
    let params: { address?: string; tag?: string };

    if (typeof addressOrParams === 'string') {
      params = { address: addressOrParams, tag };
    } else {
      params = addressOrParams;
    }

    const addresses = params.address!.split(',').map(addr => addr.trim()).filter(addr => addr.length > 0);

    if (addresses.length === 1) {
      // Single address - use balance endpoint
      Validators.addressSchema(addresses[0], 'address');

      return this.transport.get(
        {
          module: 'account',
          action: 'balance',
          address: addresses[0],
          tag: params.tag,
        },
        BigIntSchema
      );
    } else if (addresses.length > 1) {
      // Multiple addresses - use balancemulti endpoint
      if (addresses.length > 20) {
        throw new Error('Cannot query more than 20 addresses at once');
      }

      // Validate each address
      addresses.forEach((address, index) => {
        Validators.addressSchema(address, `address[${index}]`);
      });

      const response = await this.transport.get(
        {
          module: 'account',
          action: 'balancemulti',
          address: addresses.join(','),
          tag: params.tag || 'latest',
        },
        z.array(z.object({
          account: z.string(),
          balance: BigIntSchema,
        }))
      );

      // Convert array to record
      const result: Record<string, bigint> = {};
      response.forEach(item => {
        result[item.account] = item.balance;
      });

      return result;
    } else {
      throw new Error('At least one address is required');
    }
  }

  /**
   * Get Balances (Multiple Addresses)
   * Get the balances of up to 20 addresses in a single request.
   */
  async getBalances(addresses: string[], tag?: string): Promise<Record<string, bigint>>;
  async getBalances(params: {
    /** Array of addresses to query (up to 20). */
    addresses: string[];
    /** Use `latest` for the last block number of the chain. Also accepts a specific block number in hex format, like `0x10d4f` up to the last 128 blocks. */
    tag?: string;
  }): Promise<Record<string, bigint>>;
  async getBalances(addressesOrParams: string[] | {
    addresses: string[];
    tag?: string;
  }, tag?: string): Promise<Record<string, bigint>> {
    let params: { addresses: string[]; tag?: string };

    if (Array.isArray(addressesOrParams)) {
      params = { addresses: addressesOrParams, tag };
    } else {
      params = addressesOrParams;
    }

    if (params.addresses.length === 0) {
      throw new Error('At least one address is required');
    }
    if (params.addresses.length > 20) {
      throw new Error('Cannot query more than 20 addresses at once');
    }

    // Validate each address
    params.addresses.forEach((address, index) => {
      Validators.addressSchema(address, `addresses[${index}]`);
    });

    const addressString = params.addresses.join(',');

    const response = await this.transport.get(
      {
        module: 'account',
        action: 'balancemulti',
        address: addressString,
        tag: params.tag || 'latest',
      },
      z.array(z.object({
        account: z.string(),
        balance: BigIntSchema,
      }))
    );

    // Convert array to record
    const result: Record<string, bigint> = {};
    response.forEach(item => {
      result[item.account] = item.balance;
    });

    return result;
  }

  /**
    * Get Historical Native Balance for an Address
    * Retrieves the balance of a specified address at a given block height.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getBalanceHistory(params: {
    /** The address to query, like `0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97`. */
    address: string;
    /** The block number to query. */
    blockno: number | string;
  }) {
    Validators.addressSchema(params.address, 'address');
    Validators.blockNumber(params.blockno);

    return this.transport.get(
      {
        module: 'account',
        action: 'balancehistory',
        ...params,
      },
      BigIntSchema
    );
  }

  /**
   * Get Normal Transactions By Address
   * Retrieves the transaction history of a specified address, with optional pagination.
   */
  async getTxList(params: {
    /** The address to query, like `0xfefefefefefefefefefefefefefefefefefefefe`. Up to 20 addresses can be queried, separated by commas. */
    address: string;
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
    Validators.validatePaginatedAddressQuery(params);

    return this.transport.get(
      {
        module: 'account',
        action: 'txlist',
        ...params,
      },
      z.array(TransactionSchema)
    );
  }

  /**
   * Get ERC20 Token Transfers by Address
   * Retrieves the list of ERC-20 token transfers made by a specified address, with optional filtering by token contract.
   */
  async getTokenTx(params: {
    /** The address to query, like `0xfefefefefefefefefefefefefefefefefefefefe`. */
    address: string;
    /** The token contract address to filter by. */
    contractaddress?: string;
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
    Validators.validateTokenTransferParams(params);

    return this.transport.get(
      {
        module: 'account',
        action: 'tokentx',
        ...params,
      },
      z.array(TokenTransactionSchema)
    );
  }

  /**
   * Get ERC721 Token Transfers by Address
   * Retrieves the list of ERC-721 token transfers made by a specified address, with optional filtering by token contract.
   */
  async getTokenNftTx(params: {
    /** The address to query, like `0xfefefefefefefefefefefefefefefefefefefefe`. */
    address: string;
    /** The token contract address to filter by. */
    contractaddress?: string;
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
    Validators.validateTokenTransferParams(params);

    return this.transport.get(
      {
        module: 'account',
        action: 'tokennfttx',
        ...params,
      },
      z.array(NFTTransactionSchema)
    );
  }

  /**
   * Get ERC20 Token Transfers by Address (Alias for getTokenTx)
   * Retrieves the list of ERC-20 token transfers made by a specified address, with optional filtering by token contract.
   */
  async getErc20Transfers(params: {
    /** The address to query, like `0xfefefefefefefefefefefefefefefefefefefefe`. */
    address: string;
    /** The token contract address to filter by. */
    contractaddress?: string;
    /** The starting block number for the query. */
    startblock?: number | string;
    /** The ending block number for the query. */
    endblock?: number | string;
    /** Page number for pagination. */
    page?: number | string;
    /** Number of records per page. */
    offset?: number | string;
    /** Sort order: 'asc' | 'desc'. */
    sort?: 'asc' | 'desc';
  }) {
    return this.getTokenTx(params);
  }

  /**
   * Get ERC721 Token Transfers by Address (Alias for getTokenNftTx)
   * Retrieves the list of ERC-721 token transfers made by a specified address, with optional filtering by token contract.
   */
  async getErc721Transfers(params: {
    /** The address to query, like `0xfefefefefefefefefefefefefefefefefefefefe`. */
    address: string;
    /** The token contract address to filter by. */
    contractaddress?: string;
    /** The starting block number for the query. */
    startblock?: number | string;
    /** The ending block number for the query. */
    endblock?: number | string;
    /** Page number for pagination. */
    page?: number | string;
    /** Number of records per page. */
    offset?: number | string;
    /** Sort order: 'asc' | 'desc'. */
    sort?: 'asc' | 'desc';
  }) {
    return this.getTokenNftTx(params);
  }

  /**
   * Get ERC1155 Token Transfers by Address
   * Retrieves a list of ERC-1155 tokens transferred by a specific address, with optional filtering by token contract.
   */
  async getToken1155Tx(params: {
    /** The address to query, like `0xfefefefefefefefefefefefefefefefefefe`. */
    address: string;
    /** The token contract address to filter by. */
    contractaddress?: string;
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
    Validators.validateTokenTransferParams(params);

    return this.transport.get(
      {
        module: 'account',
        action: 'token1155tx',
        ...params,
      },
      z.array(ERC1155TransactionSchema)
    );
  }

  /**
   * Get Internal Transactions by Address
   * Retrieves the internal transaction history of a specified address, with optional pagination.
   */
  async getTxListInternal(params: {
    /** The address to query, like `0xfefefefefefefefefefefefefefefefefefefefe`. */
    address: string;
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
    Validators.validatePaginatedAddressQuery(params);

    return this.transport.get(
      {
        module: 'account',
        action: 'txlistinternal',
        ...params,
      },
      z.array(InternalTransactionSchema)
    );
  }

  /**
   * Get Internal Transactions by Block Range
   * Returns internal transactions within a specified block range, with optional pagination.
   */
  async getTxListInternalBlockRange(params?: {
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
    Validators.validateBlockRangeQuery(params);

    return this.transport.get(
      {
        module: 'account',
        action: 'txlistinternal',
        ...params,
      },
      z.array(InternalTransactionSchema)
    );
  }

  /**
   * Get Internal Transactions by Transaction Hash
   * Retrieves the list of internal transactions executed within a specific transaction.
   */
  async getTxListInternalTxHash(params: {
    /** The transaction hash to query. */
    txhash: string;
  }) {
    Validators.hash(params?.txhash, 'txhash');

    return this.transport.get(
      {
        module: 'account',
        action: 'txlistinternal',
        ...params,
      },
      z.array(InternalTransactionSchema)
    );
  }

  /**
   * Get Blocks Validated by Address
   * Retrieves the list of blocks validated by a specified address.
   */
  async getMinedBlocks(params: {
    /** The address to query, like `0xfefefefefefefefefefefefefefefefefefefefe`. */
    address: string;
    /** The block type: 'blocks' for canonical blocks, 'uncles' for uncle blocks. */
    blocktype?: 'blocks' | 'uncles';
    /** Page number for pagination. */
    page?: number | string;
    /** Number of records per page. */
    offset?: number | string;
  }) {
    Validators.addressSchema(params?.address, 'address');
    Validators.pagination(params?.page, params?.offset);

    return this.transport.get(
      {
        module: 'account',
        action: 'getminedblocks',
        ...params,
      },
      z.array(BlockSchema)
    );
  }

  /**
   * Get Beacon Chain Withdrawals by Address
   * Retrieves beacon chain withdrawal transactions made to a specified address.
   */
  async getTxsBeaconWithdrawal(params: {
    /** The address to query, like `0xfefefefefefefefefefefefefefefefefefefefe`. */
    address: string;
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
    requireCapability(this.transport.chainId, 'hasBeaconChain', 'getTxsBeaconWithdrawal');
    Validators.validatePaginatedAddressQuery(params);

    return this.transport.get(
      {
        module: 'account',
        action: 'txsBeaconWithdrawal',
        ...params,
      },
      z.array(BeaconWithdrawalSchema)
    );
  }

  /**
   * Get Address Funded By
   * Retrieves the address and transaction that first funded a specific address, useful for tracing fund origins.
   */
  async getFundedBy(params: {
    /** The address to query, like `0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97`. */
    address: string;
  }) {
    Validators.addressSchema(params?.address, 'address');

    return this.transport.get(
      {
        module: 'account',
        action: 'fundedby',
        ...params,
      },
      FundedBySchema
    );
  }
}

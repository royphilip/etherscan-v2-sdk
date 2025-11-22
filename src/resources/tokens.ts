import { z } from 'zod';
import { BaseModule } from './base';
import {
  BigIntSchema,
  NumberStringSchema,
  ERC20TokenHoldingSchema,
  ERC721HoldingSchema,
  ERC721InventoryItemSchema,
  TokenHolderSchema,
  TokenInfoSchema,
} from '../core/types';

export class Tokens extends BaseModule {
  /**
    * Get Token Holder List by Contract Address
    * Retrieves the current list of ERC-20 token holders and their token balances.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getTokenHolderList(params: {
    /** Parameter contractaddress */
    contractaddress: string;
    /** Parameter page */
    page?: number | string;
    /** Parameter offset */
    offset?: number | string;
  }) {
    return this.transport.get(
      {
        module: 'token',
        action: 'tokenholderlist',
        ...params,
      },
      z.array(TokenHolderSchema)
    );
  }

  /**
    * Get Top Token Holders
    * Returns the list of top holders for a specified ERC-20 token.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getTopHolders(params: {
    /** Parameter contractaddress */
    contractaddress: string;
    /** Parameter offset */
    offset?: number | string;
  }) {
    return this.transport.get(
      {
        module: 'token',
        action: 'topholders',
        ...params,
      },
      z.array(TokenHolderSchema)
    );
  }

  /**
    * Get Token Info by ContractAddress
    * Retrieves project details and social media links for an ERC-20/ERC-721/ERC-1155 token.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getTokenInfo(params: {
    /** Parameter contractaddress */
    contractaddress: string;
  }) {
    return this.transport.get(
      {
        module: 'token',
        action: 'tokeninfo',
        ...params,
      },
      z.array(TokenInfoSchema)
    );
  }

  /**
    * Get Token Holder Count by Contract Address
    * Retrieves the current number of ERC-20 token holders.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getTokenHolderCount(params: {
    /** Parameter contractaddress */
    contractaddress: string;
  }) {
    return this.transport.get(
      {
        module: 'token',
        action: 'tokenholdercount',
        ...params,
      },
      NumberStringSchema
    );
  }

  /**
   * Get ERC20-Token TotalSupply by ContractAddress
   * Returns the amount of an ERC-20 token in circulation.
   */
  async getTokenSupply(params: {
    /** Parameter contractaddress */
    contractaddress: string;
  }) {
    return this.transport.get(
      {
        module: 'stats',
        action: 'tokensupply',
        ...params,
      },
      BigIntSchema
    );
  }

  /**
   * Get ERC20-Token Account Balance for TokenContractAddress
   * Returns the current balance of an ERC-20 token of an address.
   */
  async getTokenBalance(params: {
    /** Parameter contractaddress */
    contractaddress: string;
    /** Parameter address */
    address: string;
    /** Parameter tag */
    tag?: string;
  }) {
    return this.transport.get(
      {
        module: 'account',
        action: 'tokenbalance',
        ...params,
      },
      BigIntSchema
    );
  }

  /**
    * Get Historical ERC20-Token TotalSupply by ContractAddress & BlockNo
    * Retrieves the historical total supply of an ERC-20 token at a specific block.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getTokenSupplyHistory(params: {
    /** Parameter contractaddress */
    contractaddress: string;
    /** Parameter blockno */
    blockno: number | string;
  }) {
    return this.transport.get(
      {
        module: 'stats',
        action: 'tokensupplyhistory',
        ...params,
      },
      BigIntSchema
    );
  }

  /**
    * Get Historical ERC20-Token Account Balance by BlockNo
    * Retrieves the historical balance of an ERC-20 token for a specific address at a given block.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getTokenBalanceHistory(params: {
    /** Parameter contractaddress */
    contractaddress: string;
    /** Parameter address */
    address: string;
    /** Parameter blockno */
    blockno: number | string;
  }) {
    return this.transport.get(
      {
        module: 'account',
        action: 'tokenbalancehistory',
        ...params,
      },
      BigIntSchema
    );
  }

  /**
    * Get Address ERC721 Token Holding
    * Retrieves the ERC-721 token balances of an address across all contracts.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getAddressTokenBalance(params: {
    /** Parameter address */
    address: string;
    /** Parameter page */
    page?: number | string;
    /** Parameter offset */
    offset?: number | string;
  }) {
    return this.transport.get(
      {
        module: 'account',
        action: 'addresstokenbalance',
        ...params,
      },
      z.array(ERC20TokenHoldingSchema)
    );
  }

  /**
    * Get Address ERC721 Token Holding
    * Returns the list of ERC-721 tokens held by an address.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getAddressTokenNftBalance(params: {
    /** Parameter address */
    address: string;
    /** Parameter page */
    page?: number | string;
    /** Parameter offset */
    offset?: number | string;
  }) {
    return this.transport.get(
      {
        module: 'account',
        action: 'addresstokennftbalance',
        ...params,
      },
      z.array(ERC721HoldingSchema)
    );
  }

  /**
    * Get Address ERC721 Token Inventory by Contract
    * Retrieves the ERC-721 token inventory of an address for a specific contract.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getAddressTokenNftInventory(params: {
    /** Parameter address */
    address: string;
    /** Parameter contractaddress */
    contractaddress: string;
    /** Parameter page */
    page?: number | string;
    /** Parameter offset */
    offset?: number | string;
  }) {
    return this.transport.get(
      {
        module: 'account',
        action: 'addresstokennftinventory',
        ...params,
      },
      z.array(ERC721InventoryItemSchema)
    );
  }
}

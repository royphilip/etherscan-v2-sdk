/**
 * Common parameter type definitions for API methods
 */

/**
 * Pagination parameters
 */
export interface PaginationParams {
  /** Page number for pagination */
  page?: number | string;
  /** Number of records per page */
  offset?: number | string;
}

/**
 * Block range parameters
 */
export interface BlockRangeParams {
  /** The starting block number for the query */
  startblock?: number | string;
  /** The ending block number for the query */
  endblock?: number | string;
}

/**
 * Sort parameters
 */
export interface SortParams {
  /** Sort order: 'asc' or 'desc' */
  sort?: 'asc' | 'desc';
}

/**
 * Date range parameters (YYYY-MM-DD format)
 */
export interface DateRangeParams {
  /** Start date in YYYY-MM-DD format */
  startdate: string;
  /** End date in YYYY-MM-DD format */
  enddate: string;
}

/**
 * Address query parameters
 */
export interface AddressParams {
  /** The address to query */
  address?: string;
}

/**
 * Paginated query with address
 */
export interface PaginatedAddressQuery
  extends AddressParams,
    BlockRangeParams,
    PaginationParams,
    SortParams {}

/**
 * Token transfer query parameters (ERC20/ERC721/ERC1155)
 */
export interface TokenTransferParams extends PaginatedAddressQuery {
  /** The token contract address to filter by */
  contractaddress?: string;
}

/**
 * Date range query with optional sort
 */
export interface DateRangeQuery extends DateRangeParams, SortParams {}

/**
 * Transaction hash parameter
 */
export interface TransactionHashParams {
  /** The transaction hash to query */
  txhash?: string;
}

/**
 * Block number parameter
 */
export interface BlockNumberParams {
  /** The block number to query */
  blockno?: number | string;
}

/**
 * Tag parameter (for balance queries)
 */
export interface TagParams {
  /** Use 'latest' for the last block number of the chain. Also accepts a specific block number in hex format */
  tag?: string;
}

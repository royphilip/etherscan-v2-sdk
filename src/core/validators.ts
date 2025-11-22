import { AddressSchema, HashSchema } from './types';
import { ValidationError } from './errors';

export class Validators {
  private static readonly MAX_STRING_LENGTH = 10000;
  private static readonly MAX_ADDRESSES = 20;
  private static readonly MAX_JSON_SIZE = 10 * 1024 * 1024; // 10MB

  static addressSchema(value: string | undefined, fieldName: string = 'address'): void {
    if (!value) return;

    // Check length before validation
    if (value.length > this.MAX_STRING_LENGTH) {
      throw new ValidationError(`${fieldName} exceeds maximum length of ${this.MAX_STRING_LENGTH}`);
    }

    try {
      AddressSchema.parse(value);
    } catch {
      throw new ValidationError(`Invalid ${fieldName}: ${value}`);
    }
  }

  // Legacy method for backward compatibility
  static address(value: string | undefined, fieldName: string = 'address'): void {
    this.addressSchema(value, fieldName);
  }

  static addressList(value: string | undefined, fieldName: string = 'addresses'): void {
    if (!value) return;

    if (value.length > this.MAX_STRING_LENGTH) {
      throw new ValidationError(`${fieldName} exceeds maximum length`);
    }

    const addresses = value.split(',').map(a => a.trim());

    if (addresses.length > this.MAX_ADDRESSES) {
      throw new ValidationError(`Too many addresses in ${fieldName} (max: ${this.MAX_ADDRESSES})`);
    }

    addresses.forEach(addr => this.address(addr, fieldName));
  }

  static hash(value: string | undefined, fieldName: string = 'hash'): void {
    if (!value) return;

    if (value.length > this.MAX_STRING_LENGTH) {
      throw new ValidationError(`${fieldName} exceeds maximum length of ${this.MAX_STRING_LENGTH}`);
    }

    try {
      HashSchema.parse(value);
    } catch {
      throw new ValidationError(`Invalid ${fieldName}: ${value}`);
    }
  }

  static blockNumber(value: number | string | undefined): void {
    if (value === undefined) return;

    const num = typeof value === 'string' ? parseInt(value, 10) : value;

    if (isNaN(num) || num < 0 || !Number.isFinite(num)) {
      throw new ValidationError(`Invalid block number: ${value}`);
    }
  }

  static pagination(page?: number | string, offset?: number | string): void {
    if (page !== undefined) {
      const p = typeof page === 'string' ? parseInt(page, 10) : page;
      if (isNaN(p) || p < 1) {
        throw new ValidationError(`Invalid page number: ${page}`);
      }
    }

    if (offset !== undefined) {
      const o = typeof offset === 'string' ? parseInt(offset, 10) : offset;
      if (isNaN(o) || o < 1 || o > 10000) {
        throw new ValidationError(`Invalid offset: ${offset} (must be 1-10000)`);
      }
    }
  }

  static dateString(value: string | undefined, fieldName: string): void {
    if (!value) return;

    // Validate YYYY-MM-DD format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new ValidationError(
        `Invalid date format for ${fieldName}: ${value} (expected YYYY-MM-DD)`
      );
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new ValidationError(`Invalid date for ${fieldName}: ${value}`);
    }
  }

  static safeJsonParse(val: unknown): unknown {
    if (typeof val !== 'string') {
      return val;
    }

    // Check size before parsing
    if (val.length > this.MAX_JSON_SIZE) {
      throw new ValidationError(
        `JSON payload too large: ${val.length} bytes (max: ${this.MAX_JSON_SIZE})`
      );
    }

    try {
      return JSON.parse(val);
    } catch (error) {
      throw new ValidationError(
        `Invalid JSON: ${error instanceof Error ? error.message : 'Parse error'}`
      );
    }
  }

  /**
   * Composite validation helper for token transfer parameters
   */
  static validateTokenTransferParams(params?: {
    address?: string;
    contractaddress?: string;
    startblock?: number | string;
    endblock?: number | string;
    page?: number | string;
    offset?: number | string;
  }): void {
    this.address(params?.address, 'address');
    if (params?.contractaddress) {
      this.address(params.contractaddress, 'contractaddress');
    }
    this.blockNumber(params?.startblock);
    this.blockNumber(params?.endblock);
    this.pagination(params?.page, params?.offset);
  }

  /**
   * Composite validation helper for date range parameters
   */
  static validateDateRange(params?: { startdate?: string; enddate?: string }): void {
    this.dateString(params?.startdate, 'startdate');
    this.dateString(params?.enddate, 'enddate');
  }

  /**
   * Composite validation helper for paginated address queries
   */
  static validatePaginatedAddressQuery(params?: {
    address?: string;
    startblock?: number | string;
    endblock?: number | string;
    page?: number | string;
    offset?: number | string;
  }): void {
    this.address(params?.address, 'address');
    this.blockNumber(params?.startblock);
    this.blockNumber(params?.endblock);
    this.pagination(params?.page, params?.offset);
  }

  /**
   * Composite validation helper for block range with pagination
   */
  static validateBlockRangeQuery(params?: {
    startblock?: number | string;
    endblock?: number | string;
    page?: number | string;
    offset?: number | string;
  }): void {
    this.blockNumber(params?.startblock);
    this.blockNumber(params?.endblock);
    this.pagination(params?.page, params?.offset);
  }
}

import { describe, it, expect } from 'vitest';
import { Validators } from '../src/core/validators';
import { ValidationError } from '../src/core/errors';

describe('Validators', () => {
  describe('addressSchema', () => {
    it('should accept valid Ethereum address', () => {
      expect(() =>
        Validators.addressSchema('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
      ).not.toThrow();
    });

    it('should accept undefined', () => {
      expect(() => Validators.addressSchema(undefined)).not.toThrow();
    });

    it('should reject invalid address', () => {
      expect(() => Validators.addressSchema('invalid')).toThrow(ValidationError);
    });

    it('should reject address exceeding max length', () => {
      const longAddress = '0x' + 'a'.repeat(10001);
      expect(() => Validators.addressSchema(longAddress)).toThrow(ValidationError);
    });
  });

  describe('addressList', () => {
    it('should accept undefined', () => {
      expect(() => Validators.addressList(undefined)).not.toThrow();
    });

    it('should accept valid single address', () => {
      expect(() =>
        Validators.addressList('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
      ).not.toThrow();
    });

    it('should accept valid multiple addresses', () => {
      const addresses =
        '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,0xA0b86a33E6441e88C5F2712C3E9b74F5b8F1E8b9';
      expect(() => Validators.addressList(addresses)).not.toThrow();
    });

    it('should reject string exceeding max length', () => {
      const longString = '0x' + 'a'.repeat(10001);
      expect(() => Validators.addressList(longString)).toThrow(ValidationError);
    });

    it('should reject too many addresses', () => {
      const addresses = Array(21).fill('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045').join(',');
      expect(() => Validators.addressList(addresses)).toThrow(ValidationError);
    });

    it('should reject invalid address in list', () => {
      const addresses = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,invalid';
      expect(() => Validators.addressList(addresses)).toThrow(ValidationError);
    });

    it('should handle addresses with spaces', () => {
      const addresses =
        ' 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 , 0xA0b86a33E6441e88C5F2712C3E9b74F5b8F1E8b9 ';
      expect(() => Validators.addressList(addresses)).not.toThrow();
    });
  });

  describe('hash', () => {
    it('should accept valid transaction hash', () => {
      expect(() =>
        Validators.hash('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
      ).not.toThrow();
    });

    it('should accept undefined', () => {
      expect(() => Validators.hash(undefined)).not.toThrow();
    });

    it('should reject invalid hash', () => {
      expect(() => Validators.hash('invalid')).toThrow(ValidationError);
    });

    it('should reject hash exceeding max length', () => {
      const longHash = '0x' + 'a'.repeat(10001);
      expect(() => Validators.hash(longHash)).toThrow(ValidationError);
    });
  });

  describe('blockNumber', () => {
    it('should accept valid block number', () => {
      expect(() => Validators.blockNumber(12345)).not.toThrow();
      expect(() => Validators.blockNumber('12345')).not.toThrow();
      expect(() => Validators.blockNumber(0)).not.toThrow();
    });

    it('should accept undefined', () => {
      expect(() => Validators.blockNumber(undefined)).not.toThrow();
    });

    it('should reject negative numbers', () => {
      expect(() => Validators.blockNumber(-1)).toThrow(ValidationError);
    });

    it('should reject invalid strings', () => {
      expect(() => Validators.blockNumber('invalid')).toThrow(ValidationError);
    });

    it('should reject NaN', () => {
      expect(() => Validators.blockNumber(NaN)).toThrow(ValidationError);
    });

    it('should reject infinity', () => {
      expect(() => Validators.blockNumber(Infinity)).toThrow(ValidationError);
    });
  });

  describe('pagination', () => {
    it('should accept valid pagination parameters', () => {
      expect(() => Validators.pagination(1, 10)).not.toThrow();
      expect(() => Validators.pagination('1', '10')).not.toThrow();
    });

    it('should accept undefined parameters', () => {
      expect(() => Validators.pagination(undefined, undefined)).not.toThrow();
    });

    it('should reject invalid page number', () => {
      expect(() => Validators.pagination(0)).toThrow(ValidationError);
      expect(() => Validators.pagination(-1)).toThrow(ValidationError);
      expect(() => Validators.pagination('invalid')).toThrow(ValidationError);
    });

    it('should reject invalid offset', () => {
      expect(() => Validators.pagination(1, 0)).toThrow(ValidationError);
      expect(() => Validators.pagination(1, 10001)).toThrow(ValidationError);
      expect(() => Validators.pagination(1, 'invalid')).toThrow(ValidationError);
    });
  });

  describe('dateString', () => {
    it('should accept valid date string', () => {
      expect(() => Validators.dateString('2023-01-01', 'test')).not.toThrow();
    });

    it('should accept undefined', () => {
      expect(() => Validators.dateString(undefined, 'test')).not.toThrow();
    });

    it('should reject invalid format', () => {
      expect(() => Validators.dateString('01-01-2023', 'test')).toThrow(ValidationError);
      expect(() => Validators.dateString('2023/01/01', 'test')).toThrow(ValidationError);
    });

    it('should reject invalid date', () => {
      expect(() => Validators.dateString('2023-13-01', 'test')).toThrow(ValidationError);
      expect(() => Validators.dateString('2023-01-32', 'test')).toThrow(ValidationError);
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON string', () => {
      const result = Validators.safeJsonParse('{"test": "value"}');
      expect(result).toEqual({ test: 'value' });
    });

    it('should return non-string values as-is', () => {
      const obj = { test: 'value' };
      expect(Validators.safeJsonParse(obj)).toBe(obj);
    });

    it('should reject oversized JSON', () => {
      const largeJson = 'x'.repeat(10 * 1024 * 1024 + 1);
      expect(() => Validators.safeJsonParse(largeJson)).toThrow(ValidationError);
    });

    it('should reject invalid JSON', () => {
      expect(() => Validators.safeJsonParse('{invalid')).toThrow(ValidationError);
    });
  });

  describe('composite validators', () => {
    describe('validateTokenTransferParams', () => {
      it('should accept valid parameters', () => {
        const params = {
          address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
          contractaddress: '0xA0b86a33E6441e88C5F2712C3E9b74F5b8F1E8b9',
          startblock: 1000000,
          endblock: 2000000,
          page: 1,
          offset: 10,
        };
        expect(() => Validators.validateTokenTransferParams(params)).not.toThrow();
      });

      it('should reject invalid address', () => {
        const params = { address: 'invalid' };
        expect(() => Validators.validateTokenTransferParams(params)).toThrow(ValidationError);
      });
    });

    describe('validateDateRange', () => {
      it('should accept valid date range', () => {
        const params = {
          startdate: '2023-01-01',
          enddate: '2023-12-31',
        };
        expect(() => Validators.validateDateRange(params)).not.toThrow();
      });

      it('should reject invalid date', () => {
        const params = { startdate: 'invalid' };
        expect(() => Validators.validateDateRange(params)).toThrow(ValidationError);
      });
    });

    describe('validatePaginatedAddressQuery', () => {
      it('should accept valid parameters', () => {
        const params = {
          address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
          startblock: 1000000,
          endblock: 2000000,
          page: 1,
          offset: 10,
        };
        expect(() => Validators.validatePaginatedAddressQuery(params)).not.toThrow();
      });

      it('should reject invalid address', () => {
        const params = { address: 'invalid' };
        expect(() => Validators.validatePaginatedAddressQuery(params)).toThrow(ValidationError);
      });
    });

    describe('validateBlockRangeQuery', () => {
      it('should accept valid parameters', () => {
        const params = {
          startblock: 1000000,
          endblock: 2000000,
          page: 1,
          offset: 10,
        };
        expect(() => Validators.validateBlockRangeQuery(params)).not.toThrow();
      });

      it('should reject invalid block number', () => {
        const params = { startblock: -1 };
        expect(() => Validators.validateBlockRangeQuery(params)).toThrow(ValidationError);
      });
    });
  });
});

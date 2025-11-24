import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { StatusSchema, BridgeTransactionSchema } from '../src/core/types';

describe('Core Types Schemas', () => {
  describe('StatusSchema', () => {
    it('should parse standard status envelopes', () => {
      const schema = StatusSchema(z.number());
      const parsed = schema.parse({
        status: '1',
        message: 'OK',
        result: 42,
      });

      expect(parsed).toEqual({
        status: '1',
        message: 'OK',
        result: 42,
      });
    });

    it('should reject invalid envelopes', () => {
      const schema = StatusSchema(z.string());

      expect(() =>
        schema.parse({
          status: '1',
          message: 'OK',
          result: 123, // should be string
        })
      ).toThrow();
    });
  });

  describe('BridgeTransactionSchema', () => {
    const baseTxn = {
      hash: '0xabc',
      blockNumber: '1',
      timeStamp: '1700000000',
      from: '0x0000000000000000000000000000000000000000',
    };

    it('should convert valid amount strings to bigint', () => {
      const parsed = BridgeTransactionSchema.parse({
        ...baseTxn,
        amount: '123',
      });

      expect(parsed.amount).toBe(123n);
    });

    it('should return undefined for invalid amount strings', () => {
      const parsed = BridgeTransactionSchema.parse({
        ...baseTxn,
        amount: 'not-a-number',
      });

      expect(parsed.amount).toBeUndefined();
    });
  });
});

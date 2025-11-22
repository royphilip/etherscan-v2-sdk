import { describe, it, expect, beforeEach } from 'vitest';
import { EtherscanClient } from '../src/client';
import { resetMocks, mockFetchResponse, mockResponses } from './setup';
import { TEST_ADDRESSES } from './setup';

describe('Nametags Module', () => {
  let client: EtherscanClient;

  beforeEach(() => {
    resetMocks();
    client = new EtherscanClient({
      apiKey: 'test-key',
    });
  });

  describe('getLabelMasterList', () => {
    it('should get label master list', async () => {
      mockFetchResponse(mockResponses.labelMasterList);

      const labels = await client.nametags.getLabelMasterList({
        format: 'json',
      });

      expect(labels).toEqual(mockResponses.labelMasterList.result);
    });
  });

  describe('getExportAddressTags', () => {
    it('should export address tags', async () => {
      mockFetchResponse(mockResponses.exportAddressTags, 200, 'text/csv');

      const tags = await client.nametags.getExportAddressTags({
        label: 'person',
        format: 'csv',
      });

      expect(tags).toBe(mockResponses.exportAddressTags.result);
    });
  });

  describe('getAddressTag', () => {
    it('should get address tag', async () => {
      mockFetchResponse(mockResponses.addressTag);

      const tag = await client.nametags.getAddressTag({
        address: TEST_ADDRESSES.VITALIK,
      });

      expect(tag).toEqual(mockResponses.addressTag.result);
    });
  });
});

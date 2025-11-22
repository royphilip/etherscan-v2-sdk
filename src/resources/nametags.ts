import { z } from 'zod';
import { BaseModule } from './base';
import { LabelMasterListSchema, AddressTagSchema } from '../core/types';

export class Nametags extends BaseModule {
  /**
    * Get Label Master List
    * cURL
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getLabelMasterList(params: {
    /** Parameter format */
    format?: string;
  }) {
    return this.transport.get(
      {
        module: 'nametag',
        action: 'getlabelmasterlist',
        ...params,
      },
      z.array(LabelMasterListSchema)
    );
  }

  /**
    * Export Address Tags
    * cURL
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getExportAddressTags(params: {
    /** Parameter label */
    label?: string;
    /** Parameter format */
    format?: string;
  }) {
    return this.transport.get(
      {
        module: 'nametag',
        action: 'exportaddresstags',
        ...params,
      },
      z.string(), // CSV response as raw string
      {
        responseType: 'text',
        allowedContentTypes: ['text/csv', 'text/plain'],
      }
    );
  }

  /**
    * Get Nametag (Metadata) for an Address
    * Get name tags and metadata for the specified address.
    * @requires PRO API key - This endpoint requires a paid Etherscan API plan
    */
  async getAddressTag(params: {
    /** Parameter address */
    address: string;
  }) {
    return this.transport.get(
      {
        module: 'nametag',
        action: 'getaddresstag',
        ...params,
      },
      z.array(AddressTagSchema)
    );
  }
}

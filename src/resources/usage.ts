import { BaseModule } from './base';
import { ChainlistEnvelopeSchema } from '../core/types';

export class Usage extends BaseModule {
  /**
   * Chainlist
   * Returns the list of all supported Etherscan mainnet and testnet chains.
   * Note: This endpoint uses a different URL structure (/v2/chainlist)
   */
  async getChainList() {
    // Chainlist endpoint uses direct JSON response, not standard Etherscan envelope
    const envelope = await this.transport.getWithUrl(
      'https://api.etherscan.io/v2/chainlist',
      {}, // No parameters needed
      ChainlistEnvelopeSchema
    );
    return envelope.result;
  }
}

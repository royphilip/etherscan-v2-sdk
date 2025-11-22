import { Transport } from './core/transport';
import { ChainId, EvmChainId, validateChainId } from './core/types';
import { EtherscanError } from './core/errors';
// Import Generated Modules

import { Account } from './resources/account';
import { Proxy } from './resources/proxy';
import { Nametags } from './resources/nametags';
import { Contract } from './resources/contract';
import { Block } from './resources/block';
import { Stats } from './resources/stats';
import { Logs } from './resources/logs';
import { Tokens } from './resources/tokens';
import { GasTracker } from './resources/gas_tracker';
import { Transaction } from './resources/transaction';
import { L2 } from './resources/l2';
import { Usage } from './resources/usage';
import { createDisposalCheckedInstance } from './resources/base';

export interface ClientOptions {
  apiKey?: string;
  chain?: ChainId;
  rateLimit?: number;
  timeout?: number; // Request timeout in milliseconds (default: 30000)
  maxRetries?: number; // Maximum number of retries (default: 3)
  retryDelay?: number; // Base delay between retries in milliseconds (default: 1000)
  allowedBaseUrls?: string[]; // Allowed base URLs for API requests (default: ['https://api.etherscan.io'])
  reservoir?: number; // Daily request reservoir limit (default: 100000 for free tier)
  reservoirRefreshInterval?: number; // Reservoir refresh interval in milliseconds (default: 24 hours)
}

export class EtherscanClient {
  // Exposed Namespaces
  public readonly account: Account;
  public readonly block: Block;
  public readonly contract: Contract;
  public readonly gasTracker: GasTracker;
  public readonly proxy: Proxy;
  public readonly l2: L2;
  public readonly logs: Logs;
  public readonly nametags: Nametags;
  public readonly stats: Stats;
  public readonly tokens: Tokens;
  public readonly transaction: Transaction;
  public readonly usage: Usage;

  private transport: Transport;
  private disposed = false;

  constructor(options: ClientOptions = {}) {
    const apiKey = options.apiKey || process.env.ETHERSCAN_API_KEY;
    if (!apiKey) throw new Error('API Key is required');

    const chainId = options.chain ?? EvmChainId.MAINNET;
    validateChainId(chainId); // Add validation
    this.transport = new Transport(
      chainId,
      apiKey,
      options.rateLimit,
      options.timeout,
      options.maxRetries,
      options.retryDelay,
      options.allowedBaseUrls,
      options.reservoir,
      options.reservoirRefreshInterval
    );

    // Initialize
    this.account = createDisposalCheckedInstance(new Account(this.transport, this));
    this.contract = createDisposalCheckedInstance(new Contract(this.transport, this));
    this.l2 = createDisposalCheckedInstance(new L2(this.transport, this));
    this.transaction = createDisposalCheckedInstance(new Transaction(this.transport, this));
    this.block = createDisposalCheckedInstance(new Block(this.transport, this));
    this.logs = createDisposalCheckedInstance(new Logs(this.transport, this));
    this.gasTracker = createDisposalCheckedInstance(new GasTracker(this.transport, this));
    this.stats = createDisposalCheckedInstance(new Stats(this.transport, this));
    this.proxy = createDisposalCheckedInstance(new Proxy(this.transport, this));
    this.nametags = createDisposalCheckedInstance(new Nametags(this.transport, this));
    this.tokens = createDisposalCheckedInstance(new Tokens(this.transport, this));
    this.usage = createDisposalCheckedInstance(new Usage(this.transport, this));
  }

  async dispose(): Promise<void> {
    if (this.disposed) return;
    this.disposed = true;

    // Cleanup transport/limiter
    await this.transport.dispose();
  }

  public checkDisposed(): void {
    if (this.disposed) {
      throw new EtherscanError('Client has been disposed', 500, 'CLIENT_DISPOSED');
    }
  }

  /**
   * Cache Management Methods
   */
  getCacheStats() {
    this.checkDisposed();
    return this.transport.getCacheStats();
  }

  clearCache(): void {
    this.checkDisposed();
    this.transport.clearCache();
  }

  updateCacheConfig(config: { maxSize?: number; defaultTtl?: number; enabled?: boolean }): void {
    this.checkDisposed();
    this.transport.updateCacheConfig(config);
  }

  /**
   * Interceptor Management Methods
   */
  addRequestInterceptor(
    interceptor: (
      params: Record<string, string | number | boolean | undefined>
    ) => Record<string, string | number | boolean | undefined>
  ): void {
    this.checkDisposed();
    this.transport.addRequestInterceptor(interceptor);
  }

  addResponseInterceptor<T>(interceptor: (response: T) => T): void {
    this.checkDisposed();
    this.transport.addResponseInterceptor(interceptor);
  }

  clearInterceptors(): void {
    this.checkDisposed();
    this.transport.clearInterceptors();
  }
}

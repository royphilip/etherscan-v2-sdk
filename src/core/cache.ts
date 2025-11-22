/**
 * LRU Cache with TTL support for Etherscan API responses
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTtl: number;
  enabled: boolean;
}

export class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder = new Set<string>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      defaultTtl: 5 * 60 * 1000, // 5 minutes
      enabled: true,
      ...config,
    };
  }

  get(key: string): T | null {
    if (!this.config.enabled) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }

    // Update access order
    this.accessOrder.delete(key);
    this.accessOrder.add(key);

    return entry.data;
  }

  set(key: string, value: T, ttl?: number): void {
    if (!this.config.enabled) return;

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl ?? this.config.defaultTtl,
    };

    // If key exists, update it
    if (this.cache.has(key)) {
      this.cache.set(key, entry);
      this.accessOrder.delete(key);
      this.accessOrder.add(key);
      return;
    }

    // Evict if at capacity
    if (this.cache.size >= this.config.maxSize) {
      const lruKey = this.accessOrder.values().next().value;
      if (lruKey) {
        this.cache.delete(lruKey);
        this.accessOrder.delete(lruKey);
      }
    }

    this.cache.set(key, entry);
    this.accessOrder.add(key);
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.accessOrder.delete(key);
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.delete(key);
      }
    }
  }

  // Get cache stats
  stats(): { size: number; maxSize: number; enabled: boolean } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      enabled: this.config.enabled,
    };
  }

  // Update configuration
  updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };

    // If disabled, clear cache
    if (!this.config.enabled) {
      this.clear();
    }

    // If maxSize reduced, evict excess entries
    while (this.cache.size > this.config.maxSize) {
      const lruKey = this.accessOrder.values().next().value;
      if (lruKey) {
        this.delete(lruKey);
      }
    }
  }
}

/**
 * Request deduplication system
 */
export class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();

  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    const existing = this.pendingRequests.get(key);
    if (existing) return existing;

    const promise = requestFn().finally(() => {
      // Clean up immediately upon completion
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  clear(): void {
    this.pendingRequests.clear();
  }

  size(): number {
    return this.pendingRequests.size;
  }

  destroy(): void {
    this.clear();
  }
}

/**
 * Interceptor system for request/response hooks
 */
export interface RequestInterceptor {
  (
    params: Record<string, string | number | boolean | undefined>
  ): Record<string, string | number | boolean | undefined>;
}

export interface ResponseInterceptor<T = any> {
  (response: T): T;
}

export class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  applyRequestInterceptors(
    params: Record<string, string | number | boolean | undefined>
  ): Record<string, string | number | boolean | undefined> {
    return this.requestInterceptors.reduce((acc, interceptor) => interceptor(acc), params);
  }

  applyResponseInterceptors<T>(response: T): T {
    return this.responseInterceptors.reduce((acc, interceptor) => interceptor(acc), response);
  }

  clear(): void {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }
}

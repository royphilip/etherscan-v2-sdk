import Bottleneck from 'bottleneck';
import { z } from 'zod';
import { createHash } from 'crypto';
import { APIError, EtherscanError, RateLimitError, ValidationError, PlanUpgradeRequired } from './errors';
import { ChainId } from './types';
import { LRUCache, RequestDeduplicator, InterceptorManager } from './cache';

const V2_ENDPOINT = 'https://api.etherscan.io/v2/api';

class GlobalRateLimiterRegistry {
  private static limiters = new Map<string, { limiter: Bottleneck; refCount: number }>();

  static getLimiter(apiKey: string, reqPerSec: number, reservoir: number = 100000, reservoirRefreshInterval: number = 24 * 60 * 60 * 1000): Bottleneck {
    // Hash API key for privacy
    const keyHash = this.hashKey(apiKey);

    let entry = this.limiters.get(keyHash);
    if (!entry) {
      const limiter = new Bottleneck({
        minTime: Math.ceil(1000 / reqPerSec),
        maxConcurrent: 2,
        // Configurable reservoir for daily limits
        reservoir: reservoir,
        reservoirRefreshAmount: reservoir,
        reservoirRefreshInterval: reservoirRefreshInterval,
      });

      entry = { limiter, refCount: 0 };
      this.limiters.set(keyHash, entry);
    }

    entry.refCount++;
    return entry.limiter;
  }

  private static hashKey(key: string): string {
    // Use cryptographic hash to prevent collisions and ensure security
    return createHash('sha256').update(key).digest('hex');
  }

  // Cleanup method - only stops limiter when refCount reaches 0
  static cleanup(apiKey: string): void {
    const keyHash = this.hashKey(apiKey);
    const entry = this.limiters.get(keyHash);

    if (entry) {
      entry.refCount--;
      if (entry.refCount <= 0) {
        // Stop the limiter when no more references
        entry.limiter.stop({ dropWaitingJobs: false });
        this.limiters.delete(keyHash);
      }
    }
  }
}

export class Transport {
  private limiter: Bottleneck;
  private readonly _apiKey!: string; // Hidden from inspection
  private readonly ALLOWED_BASE_URLS: readonly string[];
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  // Reliability features
  private cache: LRUCache<any>;
  private deduplicator: RequestDeduplicator;
  private interceptors: InterceptorManager;

  constructor(
    public readonly chainId: ChainId,
    apiKey: string,
    reqPerSec: number = 3,
    timeout: number = 30000,
    maxRetries: number = 3,
    retryDelay: number = 1000,
    allowedBaseUrls: string[] = ['https://api.etherscan.io'],
    reservoir: number = 100000,
    reservoirRefreshInterval: number = 24 * 60 * 60 * 1000
  ) {
    // Fix Audit #1: Prevent API Key from appearing in console.log(client)
    Object.defineProperty(this, '_apiKey', {
      value: apiKey,
      enumerable: false, // Hidden from Object.keys() and for...in
      configurable: false,
      writable: false,
    });

    this.ALLOWED_BASE_URLS = allowedBaseUrls;

    this.timeout = timeout;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;

    // Use shared rate limiter to prevent bypass
    this.limiter = GlobalRateLimiterRegistry.getLimiter(apiKey, reqPerSec, reservoir, reservoirRefreshInterval);

    // Initialize reliability features
    this.cache = new LRUCache();
    this.deduplicator = new RequestDeduplicator();
    this.interceptors = new InterceptorManager();
  }

  /**
   * Generic Fetcher with Zod Validation
   */
  async get<T extends z.ZodTypeAny>(
    params: Record<string, string | number | boolean | undefined>,
    schema: T,
    options?: {
      allowedContentTypes?: string[];
      responseType?: 'json' | 'text';
    }
  ): Promise<z.infer<T>> {
    return this.getWithUrl(V2_ENDPOINT, params, schema, options);
  }

  private async fetchWithRetry(url: string, retries: number = this.maxRetries): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (retries > 0 && this.isRetryable(error)) {
        await this.delay(this.retryDelay * (this.maxRetries - retries + 1)); // Exponential backoff
        return this.fetchWithRetry(url, retries - 1);
      }
      throw error;
    }
  }

  private isRetryable(error: unknown): boolean {
    if (error instanceof Error) {
      return (
        error.name === 'AbortError' ||
        error.message.includes('ECONNRESET') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('ENOTFOUND') ||
        error.message.includes('ECONNREFUSED')
      );
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fetcher with custom base URL (for endpoints that don't use standard /v2/api)
   */
  async getWithUrl<T extends z.ZodTypeAny>(
    baseUrl: string,
    params: Record<string, string | number | boolean | undefined>,
    schema: T,
    options?: {
      allowedContentTypes?: string[];
      responseType?: 'json' | 'text';
    }
  ): Promise<z.infer<T>> {
    // Validate URL is from allowed list using proper origin comparison
    const isAllowed = this.ALLOWED_BASE_URLS.some(allowed => {
      try {
        const allowedUrl = new URL(allowed);
        const requestUrl = new URL(baseUrl);
        return requestUrl.origin === allowedUrl.origin;
      } catch {
        return false; // Invalid URL format
      }
    });

    if (!isAllowed) {
      throw new EtherscanError(
        'Invalid API endpoint - URL not in allowlist',
        400,
        'INVALID_ENDPOINT'
      );
    }

    // Additional checks
    const url = new URL(baseUrl);

    // Enforce HTTPS
    if (url.protocol !== 'https:') {
      throw new EtherscanError(
        'Insecure protocol detected - only HTTPS allowed',
        400,
        'INSECURE_PROTOCOL'
      );
    }

    // Apply request interceptors
    const interceptedParams = this.interceptors.applyRequestInterceptors(params);

    // Create cache key from URL and params
    const cacheKey = this.createCacheKey(baseUrl, interceptedParams);

    // Check cache first
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult !== null) {
      return this.interceptors.applyResponseInterceptors(cachedResult);
    }

    // Use deduplication for concurrent requests
    return this.deduplicator.deduplicate(cacheKey, () =>
      this.limiter.schedule(async () => {
        const url = new URL(baseUrl);

        // Only add chainid and apikey for standard V2 endpoints
        if (baseUrl === V2_ENDPOINT) {
          url.searchParams.append('chainid', this.chainId.toString());
          url.searchParams.append('apikey', this._apiKey);
        }

        // Request Specific Params (use intercepted params)
        for (const [key, value] of Object.entries(interceptedParams)) {
          if (value !== undefined) {
            url.searchParams.append(key, String(value));
          }
        }

        let response: Response;
        try {
          response = await this.fetchWithRetry(url.toString());
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') {
            throw new EtherscanError('Request Timeout', 408, 'TIMEOUT_ERROR');
          }
          throw new EtherscanError('Network Error', 0, 'NETWORK_ERROR');
        }

        if (!response.ok) {
          throw new EtherscanError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status
          );
        }

        // Validate content type
        const contentType = response.headers.get('content-type');
        const allowedTypes = ['application/json', ...(options?.allowedContentTypes || [])];
        const isAllowedType = allowedTypes.some(type => contentType?.includes(type));

        if (!isAllowedType) {
          throw new EtherscanError(
            `Invalid response content-type: ${contentType}. Allowed: ${allowedTypes.join(', ')}`,
            500,
            'INVALID_CONTENT_TYPE'
          );
        }

        // Check response size before parsing
        const contentLength = response.headers.get('content-length');
        const MAX_RESPONSE_SIZE = 50 * 1024 * 1024; // 50MB

        if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
          throw new EtherscanError(
            'Response size exceeds maximum allowed',
            413,
            'RESPONSE_TOO_LARGE'
          );
        }

        const text = await response.text();

        if (text.length > MAX_RESPONSE_SIZE) {
          throw new EtherscanError(
            'Response size exceeds maximum allowed',
            413,
            'RESPONSE_TOO_LARGE'
          );
        }

        // Handle non-JSON responses (e.g., CSV exports)
        if (!contentType?.includes('application/json')) {
          // For CSV/text responses, return raw content directly (no JSON wrapper)
          const result = schema.safeParse(text);
          if (!result.success) {
            const issues = result.error.issues
              .map(i => `${i.path.join('.')}: ${i.message}`)
              .join('; ');
            throw new ValidationError(`Failed to parse response: ${issues}`);
          }
          const validatedData = result.data;
          // Cache the result
          this.cache.set(cacheKey, validatedData);
          // Apply response interceptors
          return this.interceptors.applyResponseInterceptors(validatedData);
        }

        const data = JSON.parse(text);

        // Handle different response formats based on endpoint
        let result: z.SafeParseReturnType<any, any>;
        if (baseUrl === V2_ENDPOINT) {
          // Standard V2 endpoint with {status, message, result} envelope
          // 1. Handle Etherscan Status Codes
          // Status "0" usually means error, BUT "No transactions found" is a valid empty state
          if (data.status === '0') {
            if (data.message === 'No transactions found') {
              // Test if the schema accepts an empty array
              if (schema.safeParse([]).success) {
                return [] as any;
              }
              return null; // Let schema handle nullable
            }

            if (/rate limit/i.test(data.result || '')) {
              throw new RateLimitError();
            }

            // Check for plan upgrade required errors
            const message = data.message || '';
            const result = data.result || '';
            if (
              /upgrade.*plan/i.test(message) ||
              /upgrade.*plan/i.test(result) ||
              /free.*not supported/i.test(result)
            ) {
              throw new PlanUpgradeRequired(message, result);
            }

            throw new APIError(data.message, data.result);
          }

          // 2. Runtime Validation
          result = schema.safeParse(data.result);
        } else {
          // Direct JSON response (e.g., chainlist endpoint)
          result = schema.safeParse(data);
        }

        if (!result.success) {
          const issues = result.error.issues
            .map(i => `${i.path.join('.')}: ${i.message}`)
            .join('; ');
          throw new ValidationError(`Failed to parse Etherscan response: ${issues}`);
        }

        const validatedData = result.data;

        // Cache the result
        this.cache.set(cacheKey, validatedData);

        // Apply response interceptors
        return this.interceptors.applyResponseInterceptors(validatedData);
      })
    );
  }

  checkDisposed(): void {
    // This will be overridden by the client to check disposal status
  }

  /**
   * Create a deterministic cache key from URL and params
   */
  private createCacheKey(
    baseUrl: string,
    params: Record<string, string | number | boolean | undefined>
  ): string {
    const url = new URL(baseUrl);

    // Add chainid and apikey for standard V2 endpoints
    if (baseUrl === V2_ENDPOINT) {
      url.searchParams.append('chainid', this.chainId.toString());
      url.searchParams.append('apikey', this._apiKey);
    }

    // Add request params (sorted for consistent cache keys)
    const sortedKeys = Object.keys(params).sort();
    for (const key of sortedKeys) {
      const value = params[key];
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    }

    return url.toString();
  }

  /**
   * Cache management methods
   */
  getCacheStats() {
    return this.cache.stats();
  }

  clearCache(): void {
    this.cache.clear();
  }

  updateCacheConfig(config: { maxSize?: number; defaultTtl?: number; enabled?: boolean }): void {
    this.cache.updateConfig(config);
  }

  /**
   * Interceptor management
   */
  addRequestInterceptor(
    interceptor: (
      params: Record<string, string | number | boolean | undefined>
    ) => Record<string, string | number | boolean | undefined>
  ): void {
    this.interceptors.addRequestInterceptor(interceptor);
  }

  addResponseInterceptor<T>(interceptor: (response: T) => T): void {
    this.interceptors.addResponseInterceptor(interceptor);
  }

  clearInterceptors(): void {
    this.interceptors.clear();
  }

  async dispose(): Promise<void> {
    GlobalRateLimiterRegistry.cleanup(this._apiKey);

    // Clean up reliability features
    this.deduplicator.destroy();
    this.cache.clear();
  }
}

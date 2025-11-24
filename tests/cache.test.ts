import { describe, it, expect, beforeEach } from 'vitest';
import { LRUCache } from '../src/core/cache';

describe('LRUCache', () => {
  let cache: LRUCache<string>;

  beforeEach(() => {
    cache = new LRUCache<string>({
      maxSize: 3,
      defaultTtl: 1000, // 1 second
      enabled: true,
    });
  });

  describe('initialization', () => {
    it('should create cache with default config', () => {
      const defaultCache = new LRUCache<string>();
      expect(defaultCache).toBeDefined();
    });

    it('should respect custom config', () => {
      const customCache = new LRUCache<string>({
        maxSize: 10,
        defaultTtl: 2000,
        enabled: false,
      });
      customCache.set('key', 'value');
      // Cache disabled, so get should return null
      expect(customCache.get('key')).toBeNull();
    });
  });

  describe('get and set', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for missing keys', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should update existing keys', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      expect(cache.get('key1')).toBe('value2');
    });
  });

  describe('TTL expiration', () => {
    it('should expire entries after TTL', async () => {
      cache.set('key1', 'value1', 50); // 50ms TTL

      // Should be available immediately
      expect(cache.get('key1')).toBe('value1');

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should be expired
      expect(cache.get('key1')).toBeNull();
    });

    it('should use default TTL if not specified', async () => {
      cache = new LRUCache<string>({
        maxSize: 10,
        defaultTtl: 50,
        enabled: true,
      });

      cache.set('key1', 'value1'); // Uses default 50ms TTL

      expect(cache.get('key1')).toBe('value1');

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(cache.get('key1')).toBeNull();
    });
  });

  describe('size method', () => {
    it('should return cache size', () => {
      expect(cache.size()).toBe(0);

      cache.set('key1', 'value1');
      expect(cache.size()).toBe(1);

      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);

      cache.delete('key1');
      expect(cache.size()).toBe(1);
    });
  });

  describe('cleanup method', () => {
    it('should remove expired entries', async () => {
      cache.set('key1', 'value1', 50); // Expires in 50ms
      cache.set('key2', 'value2', 5000); // Expires in 5s

      expect(cache.size()).toBe(2);

      // Wait for key1 to expire
      await new Promise(resolve => setTimeout(resolve, 100));

      // Manually trigger cleanup
      cache.cleanup();

      // key1 should be removed, key2 should remain
      expect(cache.size()).toBe(1);
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key1')).toBeNull();
    });

    it('should handle cleanup with no expired entries', () => {
      cache.set('key1', 'value1'); // Uses 1000ms default TTL
      cache.set('key2', 'value2');

      cache.cleanup();

      // Nothing should be removed
      expect(cache.size()).toBe(2);
      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
    });

    it('should handle cleanup on empty cache', () => {
      cache.cleanup();
      expect(cache.size()).toBe(0);
    });
  });

  describe('delete method', () => {
    it('should delete existing keys', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeNull();
    });

    it('should return false for nonexistent keys', () => {
      expect(cache.delete('nonexistent')).toBe(false);
    });
  });

  describe('clear method', () => {
    it('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      expect(cache.size()).toBe(3);

      cache.clear();

      expect(cache.size()).toBe(0);
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.get('key3')).toBeNull();
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used item when max size reached', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3'); // Cache is full (maxSize=3)

      // Add new item - should evict key1 (least recently used)
      cache.set('key4', 'value4');

      expect(cache.size()).toBe(3);
      expect(cache.get('key1')).toBeNull(); // Evicted
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
    });

    it('should update access order on get', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      // Access key1 to make it recently used
      cache.get('key1');

      // Add new item - should evict key2 (now least recently used)
      cache.set('key4', 'value4');

      expect(cache.get('key1')).toBe('value1'); // Still there
      expect(cache.get('key2')).toBeNull(); // Evicted
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
    });
  });

  describe('stats method', () => {
    it('should return cache statistics', () => {
      cache.set('key1', 'value1');

      const stats = cache.stats();

      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('enabled');
      expect(stats.size).toBe(1);
      expect(stats.maxSize).toBe(3);
      expect(stats.enabled).toBe(true);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });

    it('should track hits and misses', () => {
      cache.set('hit', 'value');
      expect(cache.get('hit')).toBe('value'); // hit
      expect(cache.get('miss')).toBeNull(); // miss (missing key)
      cache.delete('hit');
      expect(cache.get('hit')).toBeNull(); // miss (deleted key)

      const stats = cache.stats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(2);
    });
  });

  describe('disabled cache', () => {
    it('should not store values when disabled', () => {
      const disabledCache = new LRUCache<string>({
        enabled: false,
      });

      disabledCache.set('key1', 'value1');
      expect(disabledCache.get('key1')).toBeNull();
    });

    it('should not clear on disabled cache', () => {
      const disabledCache = new LRUCache<string>({
        enabled: false,
      });

      disabledCache.clear();
      expect(disabledCache.size()).toBe(0);
    });
  });
});

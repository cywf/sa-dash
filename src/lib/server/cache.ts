/**
 * Server-side cache helper with TTL support
 * Simple in-memory cache for server routes
 */

interface CacheEntry<T> {
	data: T;
	timestamp: number;
	ttl: number;
}

class ServerCache {
	private cache: Map<string, CacheEntry<unknown>>;

	constructor() {
		this.cache = new Map();
	}

	/**
	 * Get cached data if not expired
	 */
	get<T>(key: string): T | null {
		const entry = this.cache.get(key) as CacheEntry<T> | undefined;
		if (!entry) return null;

		const now = Date.now();
		if (now - entry.timestamp > entry.ttl) {
			this.cache.delete(key);
			return null;
		}

		return entry.data;
	}

	/**
	 * Set cache entry with TTL in milliseconds
	 */
	set<T>(key: string, data: T, ttl: number): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl
		});
	}

	/**
	 * Invalidate cache entry
	 */
	invalidate(key: string): void {
		this.cache.delete(key);
	}

	/**
	 * Clear all cache entries
	 */
	clear(): void {
		this.cache.clear();
	}

	/**
	 * Get cache statistics
	 */
	stats(): { size: number; keys: string[] } {
		return {
			size: this.cache.size,
			keys: Array.from(this.cache.keys())
		};
	}

	/**
	 * Cleanup expired entries
	 */
	cleanup(): void {
		const now = Date.now();
		for (const [key, entry] of this.cache.entries()) {
			if (now - entry.timestamp > entry.ttl) {
				this.cache.delete(key);
			}
		}
	}
}

// Export singleton instance
export const serverCache = new ServerCache();

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
	setInterval(() => serverCache.cleanup(), 5 * 60 * 1000);
}

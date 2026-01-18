/**
 * Server-side HTTP fetch wrapper with timeout and error handling
 */

export interface FetchOptions {
	timeout?: number;
	headers?: Record<string, string>;
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
	body?: string | FormData | URLSearchParams;
}

export interface FetchResult<T> {
	data?: T;
	error?: string;
	status: number;
}

/**
 * Fetch with timeout and normalized error handling
 */
export async function fetchWithTimeout<T = unknown>(
	url: string,
	options: FetchOptions = {}
): Promise<FetchResult<T>> {
	const { timeout = 10000, headers = {}, method = 'GET', body } = options;

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(url, {
			method,
			headers: {
				'Content-Type': 'application/json',
				...headers
			},
			body,
			signal: controller.signal
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			return {
				error: `HTTP ${response.status}: ${response.statusText}`,
				status: response.status
			};
		}

		const contentType = response.headers.get('content-type');
		let data: T;

		if (contentType?.includes('application/json')) {
			data = await response.json();
		} else {
			data = (await response.text()) as T;
		}

		return {
			data,
			status: response.status
		};
	} catch (error) {
		clearTimeout(timeoutId);

		if ((error as Error).name === 'AbortError') {
			return {
				error: `Request timeout after ${timeout}ms`,
				status: 408
			};
		}

		return {
			error: (error as Error).message || 'Network error',
			status: 500
		};
	}
}

/**
 * Build URL with query parameters
 */
export function buildUrl(base: string, params?: Record<string, string | number | boolean>): string {
	if (!params || Object.keys(params).length === 0) {
		return base;
	}

	const url = new URL(base);
	Object.entries(params).forEach(([key, value]) => {
		url.searchParams.append(key, String(value));
	});
	return url.toString();
}

/**
 * Validate required query parameters
 */
export function validateParams(
	params: URLSearchParams,
	required: string[]
): { valid: boolean; missing?: string[] } {
	const missing = required.filter((key) => !params.has(key));
	return missing.length > 0 ? { valid: false, missing } : { valid: true };
}

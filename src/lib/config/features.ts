/**
 * Feature flags configuration
 * Read from environment variables (PUBLIC_ prefix for client-exposed flags)
 */

import { env } from '$env/dynamic/public';

/**
 * Master flag for all Intel Sources features
 */
export const FEATURE_INTEL_SOURCES = env.PUBLIC_FEATURE_INTEL_SOURCES === 'true';

/**
 * Individual panel feature flags
 */
export const FEATURE_ADSB = env.PUBLIC_FEATURE_ADSB === 'true';
export const FEATURE_SATELLITES = env.PUBLIC_FEATURE_SATELLITES === 'true';
export const FEATURE_SPECTRUM = env.PUBLIC_FEATURE_SPECTRUM === 'true';
export const FEATURE_SHODAN = env.PUBLIC_FEATURE_SHODAN === 'true';
export const FEATURE_WIGLE = env.PUBLIC_FEATURE_WIGLE === 'true';
export const FEATURE_SEISMIC = env.PUBLIC_FEATURE_SEISMIC === 'true';
export const FEATURE_RF_PROP = env.PUBLIC_FEATURE_RF_PROP === 'true';
export const FEATURE_AURORA = env.PUBLIC_FEATURE_AURORA === 'true';

/**
 * Check if any Intel Sources panel is enabled
 */
export function hasIntelSourcesEnabled(): boolean {
	return (
		FEATURE_INTEL_SOURCES &&
		(FEATURE_ADSB ||
			FEATURE_SATELLITES ||
			FEATURE_SPECTRUM ||
			FEATURE_SHODAN ||
			FEATURE_WIGLE ||
			FEATURE_SEISMIC ||
			FEATURE_RF_PROP ||
			FEATURE_AURORA)
	);
}

/**
 * Get list of enabled Intel Sources features
 */
export function getEnabledIntelSources(): string[] {
	if (!FEATURE_INTEL_SOURCES) return [];

	const enabled: string[] = [];
	if (FEATURE_ADSB) enabled.push('adsb');
	if (FEATURE_SATELLITES) enabled.push('satellites');
	if (FEATURE_SPECTRUM) enabled.push('spectrum');
	if (FEATURE_SHODAN) enabled.push('shodan');
	if (FEATURE_WIGLE) enabled.push('wigle');
	if (FEATURE_SEISMIC) enabled.push('seismic');
	if (FEATURE_RF_PROP) enabled.push('rf-prop');
	if (FEATURE_AURORA) enabled.push('aurora');
	return enabled;
}

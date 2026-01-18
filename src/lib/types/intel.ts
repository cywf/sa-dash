/**
 * Type definitions for Intel Sources feature set
 */

/**
 * ADS-B Aircraft State
 */
export interface AircraftState {
	icao24: string; // Unique ICAO 24-bit address
	callsign?: string;
	origin_country: string;
	time_position?: number;
	last_contact: number;
	longitude?: number;
	latitude?: number;
	baro_altitude?: number; // meters
	on_ground: boolean;
	velocity?: number; // m/s
	true_track?: number; // degrees
	vertical_rate?: number; // m/s
	geo_altitude?: number; // meters
	squawk?: string;
	spi?: boolean;
	position_source?: number;
}

/**
 * Satellite TLE (Two-Line Element) data
 */
export interface SatelliteTLE {
	name: string;
	line1: string;
	line2: string;
	catalogNumber?: string;
}

/**
 * Propagated satellite state
 */
export interface SatelliteState {
	name: string;
	latitude: number;
	longitude: number;
	altitude: number; // km
	velocity: number; // km/s
	timestamp: number;
	catalogNumber?: string;
}

/**
 * Satellite group/category
 */
export type SatelliteGroup =
	| 'starlink'
	| 'gps'
	| 'glonass'
	| 'galileo'
	| 'iridium'
	| 'weather'
	| 'military'
	| 'science'
	| 'amateur'
	| 'other';

/**
 * Spectrum analyzer FFT frame
 */
export interface SpectrumFrame {
	frequencies: number[]; // Hz
	magnitudes: number[]; // dB
	timestamp: number;
	sampleRate: number;
	fftSize: number;
	source: 'microphone' | 'websocket';
}

/**
 * Spectrum analyzer mode
 */
export type SpectrumMode = 'microphone' | 'websocket';

/**
 * Shodan host result
 */
export interface ShodanHost {
	ip: string;
	hostnames: string[];
	ports: number[];
	vulns?: string[];
	os?: string;
	org?: string;
	isp?: string;
	country_name?: string;
	city?: string;
	latitude?: number;
	longitude?: number;
	last_update?: string;
	data?: ShodanService[];
}

/**
 * Shodan service banner
 */
export interface ShodanService {
	port: number;
	transport: 'tcp' | 'udp';
	product?: string;
	version?: string;
	banner?: string;
	timestamp: string;
}

/**
 * Shodan search result
 */
export interface ShodanSearchResult {
	total: number;
	matches: ShodanHost[];
}

/**
 * WiGLE WiFi network result
 */
export interface WigleResult {
	ssid: string;
	netid: string; // BSSID/MAC
	channel: number;
	encryption: string;
	latitude: number;
	longitude: number;
	lastupdt: string;
	country?: string;
	region?: string;
	city?: string;
	signal?: number; // dBm
	name?: string;
}

/**
 * WiGLE search filters
 */
export interface WigleSearchFilters {
	ssid?: string;
	bssid?: string;
	latrange1?: number; // min latitude
	latrange2?: number; // max latitude
	longrange1?: number; // min longitude
	longrange2?: number; // max longitude
	lastupdt?: string; // date YYYYMMDD
	limit?: number;
}

/**
 * USGS Earthquake Feature (GeoJSON)
 */
export interface EarthquakeFeature {
	type: 'Feature';
	id: string;
	properties: {
		mag: number;
		place: string;
		time: number; // Unix timestamp ms
		updated: number;
		tz?: number;
		url: string;
		detail: string;
		felt?: number;
		cdi?: number;
		mmi?: number;
		alert?: 'green' | 'yellow' | 'orange' | 'red';
		status: string;
		tsunami: number;
		sig: number;
		net: string;
		code: string;
		ids: string;
		sources: string;
		types: string;
		nst?: number;
		dmin?: number;
		rms?: number;
		gap?: number;
		magType: string;
		type: string;
		title: string;
	};
	geometry: {
		type: 'Point';
		coordinates: [number, number, number]; // [lon, lat, depth]
	};
}

/**
 * USGS Earthquake response
 */
export interface EarthquakeResponse {
	type: 'FeatureCollection';
	metadata: {
		generated: number;
		url: string;
		title: string;
		status: number;
		api: string;
		count: number;
	};
	features: EarthquakeFeature[];
}

/**
 * Space Weather Index types
 */
export type SpaceWeatherIndexType =
	| 'sunspot-number'
	| 'solar-flux'
	| 'a-index'
	| 'k-index'
	| 'planetary-k-index'
	| 'x-ray';

/**
 * Space Weather Index data point
 */
export interface SpaceWeatherIndex {
	type: SpaceWeatherIndexType;
	value: number;
	timestamp: number;
	scale?: string;
	description?: string;
}

/**
 * HF Radio Propagation Conditions
 */
export interface HFConditions {
	timestamp: number;
	day: 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor';
	night: 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor';
	solarFlux: number; // SFI (Solar Flux Index)
	aIndex: number; // Geomagnetic activity
	kIndex: number; // Geomagnetic storm indicator
	sunspots: number;
	summary: string;
}

/**
 * Aurora activity status
 */
export interface AuroraStatus {
	timestamp: number;
	kpIndex: number; // 0-9 scale
	kpTrend: 'rising' | 'stable' | 'falling';
	visibility: {
		latitude: number; // degrees north
		probability: 'none' | 'low' | 'moderate' | 'high' | 'very-high';
	};
	forecast: Array<{
		time: number;
		kp: number;
	}>;
	alert?: string;
}

/**
 * Aurora visibility level
 */
export type AuroraVisibility = 'none' | 'low' | 'moderate' | 'high' | 'very-high';

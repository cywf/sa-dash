<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { wigleSearch } from '$lib/data/wigle';
	import type { WigleResponse } from '$lib/data/wigle';
	import type { WigleSearchFilters } from '$lib/types/intel';

	let data = $state<WigleResponse | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let ssid = $state('');
	let latMin = $state('');
	let latMax = $state('');
	let lonMin = $state('');
	let lonMax = $state('');

	const count = $derived(data?.results.length || 0);
	const total = $derived(data?.total || 0);

	async function search() {
		const filters: WigleSearchFilters = {};
		if (ssid.trim()) filters.ssid = ssid.trim();
		if (latMin) filters.latrange1 = parseFloat(latMin);
		if (latMax) filters.latrange2 = parseFloat(latMax);
		if (lonMin) filters.longrange1 = parseFloat(lonMin);
		if (lonMax) filters.longrange2 = parseFloat(lonMax);

		if (Object.keys(filters).length === 0) return;

		loading = true;
		error = null;
		try {
			const response = await wigleSearch(filters);
			if (response.error) {
				error = response.error;
			} else {
				data = response;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to search WiGLE';
		} finally {
			loading = false;
		}
	}
</script>

<Panel
	id="wigle"
	title="WiGLE WiFi"
	count={total > 0 ? `${count}/${total}` : null}
	{loading}
	{error}
>
	{#snippet header()}
		<div class="search-container">
			<input type="text" bind:value={ssid} placeholder="SSID" class="search-input" />
			<input type="text" bind:value={latMin} placeholder="Lat min" class="coord-input" />
			<input type="text" bind:value={latMax} placeholder="Lat max" class="coord-input" />
			<input type="text" bind:value={lonMin} placeholder="Lon min" class="coord-input" />
			<input type="text" bind:value={lonMax} placeholder="Lon max" class="coord-input" />
			<button class="search-btn" onclick={search} disabled={loading}> Search </button>
		</div>
	{/snippet}

	{#if !data && !loading && !error}
		<div class="empty-state">Enter SSID or coordinates to search for WiFi networks</div>
	{:else if data?.results.length === 0 && !loading && !error}
		<div class="empty-state">No networks found</div>
	{:else if data?.results}
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>SSID</th>
						<th>BSSID</th>
						<th>Encryption</th>
						<th>Location</th>
					</tr>
				</thead>
				<tbody>
					{#each data.results as network (network.netid)}
						<tr>
							<td class="ssid">{network.ssid || '(hidden)'}</td>
							<td class="bssid">{network.netid}</td>
							<td class="encryption">{network.encryption}</td>
							<td class="location">
								{network.latitude.toFixed(4)}, {network.longitude.toFixed(4)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</Panel>

<style>
	.search-container {
		display: flex;
		gap: 0.25rem;
		flex-wrap: wrap;
		flex: 1;
	}

	.search-input {
		flex: 1;
		min-width: 100px;
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--text-primary);
		padding: 0.25rem 0.5rem;
		font-size: 0.6rem;
		border-radius: 3px;
	}

	.coord-input {
		width: 60px;
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--text-primary);
		padding: 0.25rem 0.5rem;
		font-size: 0.6rem;
		border-radius: 3px;
	}

	.search-input:focus,
	.coord-input:focus {
		outline: none;
		border-color: var(--accent);
	}

	.search-btn {
		background: var(--accent);
		border: 1px solid var(--accent);
		color: var(--background);
		padding: 0.25rem 0.75rem;
		font-size: 0.6rem;
		border-radius: 3px;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.search-btn:hover:not(:disabled) {
		opacity: 0.8;
	}

	.search-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.table-container {
		overflow-x: auto;
	}

	table {
		width: 100%;
		font-size: 0.65rem;
		border-collapse: collapse;
	}

	thead {
		border-bottom: 1px solid var(--border);
	}

	th {
		text-align: left;
		padding: 0.4rem 0.5rem;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		font-size: 0.55rem;
		letter-spacing: 0.03em;
	}

	td {
		padding: 0.4rem 0.5rem;
		border-bottom: 1px solid var(--border);
		color: var(--text-primary);
	}

	tbody tr:last-child td {
		border-bottom: none;
	}

	tbody tr:hover {
		background: rgba(255, 255, 255, 0.02);
	}

	.ssid {
		font-weight: 500;
	}

	.bssid {
		font-family: monospace;
		font-size: 0.6rem;
		color: var(--text-secondary);
	}

	.encryption {
		font-size: 0.6rem;
		color: var(--text-secondary);
	}

	.location {
		font-family: monospace;
		font-size: 0.6rem;
		color: var(--text-secondary);
	}

	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>

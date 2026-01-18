<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { getAdsbStates } from '$lib/data/adsb';
	import type { AdsbResponse } from '$lib/data/adsb';

	let data = $state<AdsbResponse | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);

	const count = $derived(data?.states.length || 0);

	async function refresh() {
		loading = true;
		error = null;
		try {
			const response = await getAdsbStates();
			if (response.error) {
				error = response.error;
			} else {
				data = response;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch ADS-B data';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		refresh();
	});
</script>

<Panel id="adsb" title="ADS-B Aircraft" {count} {loading} {error}>
	{#snippet actions()}
		<button class="refresh-btn" onclick={refresh} disabled={loading} aria-label="Refresh">
			↻
		</button>
	{/snippet}

	{#if data?.states.length === 0 && !loading && !error}
		<div class="empty-state">No aircraft detected</div>
	{:else if data?.states}
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>Callsign</th>
						<th>Country</th>
						<th>Altitude</th>
						<th>Speed</th>
					</tr>
				</thead>
				<tbody>
					{#each data.states as aircraft (aircraft.icao24)}
						<tr>
							<td class="callsign">{aircraft.callsign?.trim() || aircraft.icao24}</td>
							<td>{aircraft.origin_country}</td>
							<td class="numeric">
								{aircraft.baro_altitude
									? `${Math.round(aircraft.baro_altitude)}m`
									: aircraft.on_ground
										? 'Ground'
										: '—'}
							</td>
							<td class="numeric">
								{aircraft.velocity ? `${Math.round(aircraft.velocity * 3.6)} km/h` : '—'}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</Panel>

<style>
	.refresh-btn {
		background: none;
		border: 1px solid var(--border);
		color: var(--text-secondary);
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		font-size: 0.8rem;
		border-radius: 3px;
		transition: all 0.2s;
	}

	.refresh-btn:hover:not(:disabled) {
		color: var(--accent);
		border-color: var(--accent);
	}

	.refresh-btn:disabled {
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

	.callsign {
		font-family: monospace;
		font-weight: 500;
	}

	.numeric {
		font-variant-numeric: tabular-nums;
		text-align: right;
	}

	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>

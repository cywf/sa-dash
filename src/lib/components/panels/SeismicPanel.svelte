<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { getEarthquakes } from '$lib/data/seismic';
	import type { SeismicResponse } from '$lib/data/seismic';

	let data = $state<SeismicResponse | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let range = $state<'hour' | 'day' | 'week' | 'month'>('day');
	let magnitude = $state<'significant' | 'all' | '4.5' | '2.5' | '1.0'>('all');

	const count = $derived(data?.earthquakes?.features.length || 0);

	async function refresh() {
		loading = true;
		error = null;
		try {
			const response = await getEarthquakes(range, magnitude);
			if (response.error) {
				error = response.error;
			} else {
				data = response;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch earthquake data';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		refresh();
	});
</script>

<Panel id="seismic" title="Seismic Activity" {count} {loading} {error}>
	{#snippet header()}
		<div class="filters">
			<select bind:value={range} onchange={refresh} class="filter-select">
				<option value="hour">Past Hour</option>
				<option value="day">Past Day</option>
				<option value="week">Past Week</option>
				<option value="month">Past Month</option>
			</select>
			<select bind:value={magnitude} onchange={refresh} class="filter-select">
				<option value="all">All Magnitudes</option>
				<option value="1.0">M1.0+</option>
				<option value="2.5">M2.5+</option>
				<option value="4.5">M4.5+</option>
				<option value="significant">Significant</option>
			</select>
		</div>
	{/snippet}

	{#snippet actions()}
		<button class="refresh-btn" onclick={refresh} disabled={loading} aria-label="Refresh">
			↻
		</button>
	{/snippet}

	{#if data?.earthquakes?.features.length === 0 && !loading && !error}
		<div class="empty-state">No earthquakes in selected range</div>
	{:else if data?.earthquakes?.features}
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>Magnitude</th>
						<th>Location</th>
						<th>Time</th>
					</tr>
				</thead>
				<tbody>
					{#each data.earthquakes.features as quake (quake.id)}
						<tr class:significant={quake.properties.alert}>
							<td class="magnitude">
								<span class="mag-value" class:high={quake.properties.mag >= 5}>
									{quake.properties.mag.toFixed(1)}
								</span>
								{#if quake.properties.alert}
									<span class="alert-badge {quake.properties.alert}">
										{quake.properties.alert}
									</span>
								{/if}
							</td>
							<td class="place">{quake.properties.place}</td>
							<td class="time">{new Date(quake.properties.time).toLocaleString()}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</Panel>

<style>
	.filters {
		display: flex;
		gap: 0.25rem;
	}

	.filter-select {
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--text-primary);
		padding: 0.25rem 0.5rem;
		font-size: 0.6rem;
		border-radius: 3px;
		cursor: pointer;
	}

	.filter-select:hover {
		border-color: var(--accent);
	}

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
		max-height: 400px;
		overflow-y: auto;
	}

	table {
		width: 100%;
		font-size: 0.65rem;
		border-collapse: collapse;
	}

	thead {
		border-bottom: 1px solid var(--border);
		position: sticky;
		top: 0;
		background: var(--surface);
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

	tr.significant {
		background: rgba(255, 165, 0, 0.05);
	}

	.magnitude {
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.mag-value {
		font-variant-numeric: tabular-nums;
	}

	.mag-value.high {
		color: #ff4444;
	}

	.alert-badge {
		font-size: 0.5rem;
		padding: 0.1rem 0.3rem;
		border-radius: 2px;
		text-transform: uppercase;
		font-weight: 600;
	}

	.alert-badge.green {
		background: rgba(0, 255, 0, 0.2);
		color: #00ff00;
	}

	.alert-badge.yellow {
		background: rgba(255, 255, 0, 0.2);
		color: #ffff00;
	}

	.alert-badge.orange {
		background: rgba(255, 165, 0, 0.2);
		color: #ffa500;
	}

	.alert-badge.red {
		background: rgba(255, 0, 0, 0.2);
		color: #ff4444;
	}

	.place {
		font-size: 0.65rem;
	}

	.time {
		font-size: 0.6rem;
		color: var(--text-secondary);
		white-space: nowrap;
	}

	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>

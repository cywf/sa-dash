<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { getSatellites } from '$lib/data/satellites';
	import type { SatelliteResponse } from '$lib/data/satellites';
	import type { SatelliteGroup } from '$lib/types/intel';

	let data = $state<SatelliteResponse | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let selectedGroup = $state<SatelliteGroup>('starlink');

	const count = $derived(data?.satellites.length || 0);

	const groups: SatelliteGroup[] = [
		'starlink',
		'gps',
		'glonass',
		'galileo',
		'iridium',
		'weather',
		'military',
		'science',
		'amateur',
		'other'
	];

	async function refresh() {
		loading = true;
		error = null;
		try {
			const response = await getSatellites(selectedGroup);
			if (response.error) {
				error = response.error;
			} else {
				data = response;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch satellite data';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		refresh();
	});
</script>

<Panel id="satellites" title="Satellites" {count} {loading} {error}>
	{#snippet header()}
		<select bind:value={selectedGroup} onchange={refresh} class="group-selector">
			{#each groups as group}
				<option value={group}>{group.toUpperCase()}</option>
			{/each}
		</select>
	{/snippet}

	{#snippet actions()}
		<button class="refresh-btn" onclick={refresh} disabled={loading} aria-label="Refresh">
			↻
		</button>
	{/snippet}

	{#if data?.satellites.length === 0 && !loading && !error}
		<div class="empty-state">No satellites found</div>
	{:else if data?.satellites}
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Catalog #</th>
					</tr>
				</thead>
				<tbody>
					{#each data.satellites as sat (sat.catalogNumber || sat.name)}
						<tr>
							<td class="name">{sat.name}</td>
							<td class="catalog">{sat.catalogNumber || '—'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</Panel>

<style>
	.group-selector {
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--text-primary);
		padding: 0.25rem 0.5rem;
		font-size: 0.6rem;
		border-radius: 3px;
		cursor: pointer;
	}

	.group-selector:hover {
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

	.name {
		font-weight: 500;
	}

	.catalog {
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

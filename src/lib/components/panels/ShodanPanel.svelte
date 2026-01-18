<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { shodanSearch } from '$lib/data/shodan';
	import type { ShodanSearchResponse } from '$lib/data/shodan';

	let data = $state<ShodanSearchResponse | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let query = $state('');

	const count = $derived(data?.result?.matches.length || 0);
	const total = $derived(data?.result?.total || 0);

	async function search() {
		if (!query.trim()) return;

		loading = true;
		error = null;
		try {
			const response = await shodanSearch(query.trim());
			if (response.error) {
				error = response.error;
			} else {
				data = response;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to search Shodan';
		} finally {
			loading = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			search();
		}
	}
</script>

<Panel id="shodan" title="Shodan" count={total > 0 ? `${count}/${total}` : null} {loading} {error}>
	{#snippet header()}
		<div class="search-container">
			<input
				type="text"
				bind:value={query}
				onkeydown={handleKeydown}
				placeholder="Search query..."
				class="search-input"
			/>
			<button class="search-btn" onclick={search} disabled={loading || !query.trim()}>
				Search
			</button>
		</div>
	{/snippet}

	{#if !data && !loading && !error}
		<div class="empty-state">Enter a search query to find devices</div>
	{:else if data?.result?.matches.length === 0 && !loading && !error}
		<div class="empty-state">No results found</div>
	{:else if data?.result?.matches}
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>IP</th>
						<th>Ports</th>
						<th>Country</th>
						<th>Org</th>
					</tr>
				</thead>
				<tbody>
					{#each data.result.matches as host (host.ip)}
						<tr>
							<td class="ip">{host.ip}</td>
							<td class="ports">{host.ports.slice(0, 5).join(', ')}</td>
							<td>{host.country_name || '—'}</td>
							<td class="org">{host.org || host.isp || '—'}</td>
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
		flex: 1;
		max-width: 300px;
	}

	.search-input {
		flex: 1;
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--text-primary);
		padding: 0.25rem 0.5rem;
		font-size: 0.6rem;
		border-radius: 3px;
	}

	.search-input:focus {
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

	.ip {
		font-family: monospace;
		font-weight: 500;
	}

	.ports {
		font-family: monospace;
		font-size: 0.6rem;
		color: var(--text-secondary);
	}

	.org {
		font-size: 0.6rem;
		color: var(--text-secondary);
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>

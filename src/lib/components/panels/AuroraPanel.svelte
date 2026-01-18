<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { getAuroraStatus } from '$lib/data/aurora';
	import type { AuroraResponse } from '$lib/data/aurora';

	let data = $state<AuroraResponse | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function refresh() {
		loading = true;
		error = null;
		try {
			const response = await getAuroraStatus();
			if (response.error) {
				error = response.error;
			} else {
				data = response;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch aurora data';
		} finally {
			loading = false;
		}
	}

	function getTrendIcon(trend: string): string {
		switch (trend) {
			case 'rising':
				return '↗';
			case 'falling':
				return '↘';
			case 'stable':
				return '→';
			default:
				return '—';
		}
	}

	function getProbabilityClass(probability: string): string {
		switch (probability) {
			case 'very-high':
				return 'very-high';
			case 'high':
				return 'high';
			case 'moderate':
				return 'moderate';
			case 'low':
				return 'low';
			default:
				return 'none';
		}
	}

	$effect(() => {
		refresh();
	});
</script>

<Panel id="aurora" title="Aurora Activity" {loading} {error}>
	{#snippet actions()}
		<button class="refresh-btn" onclick={refresh} disabled={loading} aria-label="Refresh">
			↻
		</button>
	{/snippet}

	{#if !data?.status && !loading && !error}
		<div class="empty-state">No aurora data available</div>
	{:else if data?.status}
		<div class="aurora-grid">
			<div class="kp-card">
				<div class="kp-label">Kp Index</div>
				<div class="kp-value">{data.status.kpIndex.toFixed(1)}</div>
				<div class="kp-trend">
					{getTrendIcon(data.status.kpTrend)}
					{data.status.kpTrend}
				</div>
			</div>

			<div class="visibility-card">
				<div class="vis-label">Visibility</div>
				<div class="vis-latitude">{data.status.visibility.latitude}°N</div>
				<div class="vis-probability {getProbabilityClass(data.status.visibility.probability)}">
					{data.status.visibility.probability.replace('-', ' ').toUpperCase()}
				</div>
			</div>
		</div>

		{#if data.status.alert}
			<div class="alert-box">
				<span class="alert-icon">⚠</span>
				{data.status.alert}
			</div>
		{/if}

		{#if data.status.forecast.length > 0}
			<div class="forecast-container">
				<div class="forecast-title">Forecast</div>
				<div class="forecast-table">
					<table>
						<thead>
							<tr>
								<th>Time</th>
								<th>Kp</th>
							</tr>
						</thead>
						<tbody>
							{#each data.status.forecast as entry (entry.time)}
								<tr>
									<td class="time">{new Date(entry.time).toLocaleString()}</td>
									<td class="kp">{entry.kp.toFixed(1)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
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

	.aurora-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.kp-card,
	.visibility-card {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 0.75rem;
		text-align: center;
	}

	.kp-label,
	.vis-label {
		font-size: 0.55rem;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.kp-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--accent);
		font-variant-numeric: tabular-nums;
	}

	.kp-trend {
		font-size: 0.6rem;
		color: var(--text-secondary);
		text-transform: uppercase;
		margin-top: 0.25rem;
	}

	.vis-latitude {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 0.25rem;
	}

	.vis-probability {
		font-size: 0.6rem;
		font-weight: 600;
		text-transform: uppercase;
		padding: 0.2rem 0.5rem;
		border-radius: 3px;
		display: inline-block;
	}

	.vis-probability.very-high {
		background: rgba(255, 0, 0, 0.2);
		color: #ff4444;
	}

	.vis-probability.high {
		background: rgba(255, 165, 0, 0.2);
		color: #ffa500;
	}

	.vis-probability.moderate {
		background: rgba(255, 255, 0, 0.2);
		color: #ffff00;
	}

	.vis-probability.low {
		background: rgba(100, 255, 100, 0.2);
		color: #88ff88;
	}

	.vis-probability.none {
		background: rgba(255, 255, 255, 0.1);
		color: var(--text-secondary);
	}

	.alert-box {
		padding: 0.5rem;
		background: rgba(255, 165, 0, 0.15);
		border: 1px solid rgba(255, 165, 0, 0.3);
		border-radius: 4px;
		font-size: 0.65rem;
		color: #ffa500;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.alert-icon {
		font-size: 1rem;
	}

	.forecast-container {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border);
		border-radius: 4px;
		overflow: hidden;
	}

	.forecast-title {
		padding: 0.5rem;
		font-size: 0.6rem;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--text-secondary);
		border-bottom: 1px solid var(--border);
	}

	.forecast-table {
		max-height: 200px;
		overflow-y: auto;
	}

	table {
		width: 100%;
		font-size: 0.65rem;
		border-collapse: collapse;
	}

	th {
		text-align: left;
		padding: 0.4rem 0.5rem;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		font-size: 0.55rem;
		background: var(--surface);
		position: sticky;
		top: 0;
	}

	td {
		padding: 0.4rem 0.5rem;
		border-bottom: 1px solid var(--border);
		color: var(--text-primary);
	}

	tbody tr:last-child td {
		border-bottom: none;
	}

	.time {
		font-size: 0.6rem;
		color: var(--text-secondary);
		white-space: nowrap;
	}

	.kp {
		font-variant-numeric: tabular-nums;
		font-weight: 500;
		text-align: right;
	}

	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>

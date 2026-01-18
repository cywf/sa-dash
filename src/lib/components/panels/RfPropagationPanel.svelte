<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { getSpaceWeather } from '$lib/data/spaceweather';
	import type { SpaceWeatherResponse } from '$lib/data/spaceweather';

	let data = $state<SpaceWeatherResponse | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function refresh() {
		loading = true;
		error = null;
		try {
			const response = await getSpaceWeather();
			if (response.error) {
				error = response.error;
			} else {
				data = response;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch space weather data';
		} finally {
			loading = false;
		}
	}

	function getConditionClass(condition: string): string {
		switch (condition) {
			case 'excellent':
				return 'excellent';
			case 'good':
				return 'good';
			case 'fair':
				return 'fair';
			case 'poor':
				return 'poor';
			case 'very-poor':
				return 'very-poor';
			default:
				return '';
		}
	}

	$effect(() => {
		refresh();
	});
</script>

<Panel id="rf-propagation" title="HF Propagation" {loading} {error}>
	{#snippet actions()}
		<button class="refresh-btn" onclick={refresh} disabled={loading} aria-label="Refresh">
			↻
		</button>
	{/snippet}

	{#if !data?.conditions && !loading && !error}
		<div class="empty-state">No propagation data available</div>
	{:else if data?.conditions}
		<div class="conditions-grid">
			<div class="condition-card">
				<div class="condition-label">Day</div>
				<div class="condition-value {getConditionClass(data.conditions.day)}">
					{data.conditions.day.replace('-', ' ').toUpperCase()}
				</div>
			</div>

			<div class="condition-card">
				<div class="condition-label">Night</div>
				<div class="condition-value {getConditionClass(data.conditions.night)}">
					{data.conditions.night.replace('-', ' ').toUpperCase()}
				</div>
			</div>

			<div class="index-card">
				<div class="index-label">Solar Flux</div>
				<div class="index-value">{data.conditions.solarFlux}</div>
			</div>

			<div class="index-card">
				<div class="index-label">A-Index</div>
				<div class="index-value">{data.conditions.aIndex}</div>
			</div>

			<div class="index-card">
				<div class="index-label">K-Index</div>
				<div class="index-value">{data.conditions.kIndex}</div>
			</div>

			<div class="index-card">
				<div class="index-label">Sunspots</div>
				<div class="index-value">{data.conditions.sunspots}</div>
			</div>
		</div>

		{#if data.conditions.summary}
			<div class="summary">
				{data.conditions.summary}
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

	.conditions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.condition-card,
	.index-card {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 0.5rem;
		text-align: center;
	}

	.condition-label,
	.index-label {
		font-size: 0.55rem;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.condition-value {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.condition-value.excellent {
		color: #00ff00;
	}

	.condition-value.good {
		color: #88ff88;
	}

	.condition-value.fair {
		color: #ffff00;
	}

	.condition-value.poor {
		color: #ffa500;
	}

	.condition-value.very-poor {
		color: #ff4444;
	}

	.index-value {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-primary);
		font-variant-numeric: tabular-nums;
	}

	.summary {
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border);
		border-radius: 4px;
		font-size: 0.65rem;
		line-height: 1.4;
		color: var(--text-secondary);
	}

	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>

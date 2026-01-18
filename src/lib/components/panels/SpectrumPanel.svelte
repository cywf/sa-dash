<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { getMicrophoneSpectrum } from '$lib/data/spectrum';
	import type { SpectrumFrame, SpectrumMode } from '$lib/types/intel';

	let frame = $state<SpectrumFrame | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let mode = $state<SpectrumMode>('microphone');
	let canvas = $state<HTMLCanvasElement>();

	async function refresh() {
		if (mode !== 'microphone') return;

		loading = true;
		error = null;
		try {
			const response = await getMicrophoneSpectrum();
			if (response.error) {
				error = response.error;
			} else {
				frame = response.frame;
				drawSpectrum();
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to get spectrum data';
		} finally {
			loading = false;
		}
	}

	function drawSpectrum() {
		if (!frame || !canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const width = canvas.width;
		const height = canvas.height;

		ctx.fillStyle = '#0a0e14';
		ctx.fillRect(0, 0, width, height);

		const barWidth = width / frame.frequencies.length;
		const maxMagnitude = Math.max(...frame.magnitudes);
		const minMagnitude = Math.min(...frame.magnitudes);
		const range = maxMagnitude - minMagnitude;

		frame.magnitudes.forEach((magnitude, i) => {
			const normalized = range > 0 ? (magnitude - minMagnitude) / range : 0;
			const barHeight = normalized * height;

			const hue = 180 + normalized * 60;
			ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
			ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
		});
	}

	$effect(() => {
		if (mode === 'microphone') {
			refresh();
		}
	});
</script>

<Panel id="spectrum" title="Spectrum Analyzer" {loading} {error}>
	{#snippet header()}
		<div class="mode-selector">
			<button
				class="mode-btn"
				class:active={mode === 'microphone'}
				onclick={() => (mode = 'microphone')}
			>
				Microphone
			</button>
			<button
				class="mode-btn"
				class:active={mode === 'websocket'}
				onclick={() => (mode = 'websocket')}
			>
				WebSocket
			</button>
		</div>
	{/snippet}

	{#snippet actions()}
		{#if mode === 'microphone'}
			<button class="refresh-btn" onclick={refresh} disabled={loading} aria-label="Refresh">
				↻
			</button>
		{/if}
	{/snippet}

	{#if mode === 'websocket'}
		<div class="info-state">WebSocket mode not yet implemented</div>
	{:else if !frame && !loading && !error}
		<div class="empty-state">Click refresh to capture audio spectrum</div>
	{:else if frame}
		<div class="canvas-container">
			<canvas bind:this={canvas} width="600" height="200"></canvas>
			<div class="spectrum-info">
				<span>Sample Rate: {(frame.sampleRate / 1000).toFixed(1)} kHz</span>
				<span>FFT Size: {frame.fftSize}</span>
			</div>
		</div>
	{/if}
</Panel>

<style>
	.mode-selector {
		display: flex;
		gap: 0.25rem;
	}

	.mode-btn {
		background: none;
		border: 1px solid var(--border);
		color: var(--text-secondary);
		padding: 0.25rem 0.5rem;
		font-size: 0.6rem;
		border-radius: 3px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.mode-btn:hover {
		border-color: var(--accent);
		color: var(--text-primary);
	}

	.mode-btn.active {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--background);
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

	.canvas-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	canvas {
		width: 100%;
		height: 200px;
		border: 1px solid var(--border);
		border-radius: 4px;
	}

	.spectrum-info {
		display: flex;
		justify-content: space-between;
		font-size: 0.6rem;
		color: var(--text-secondary);
	}

	.empty-state,
	.info-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>

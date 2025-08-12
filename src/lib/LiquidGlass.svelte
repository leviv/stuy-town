<script lang="ts">
	import { onMount } from 'svelte';

	export let opacity: number = 1;

	let glassElement: HTMLElement;
	let filterId: string;

	// Generate unique ID for this component instance
	onMount(() => {
		const random = Math.random().toString(36).substr(2, 9);
		filterId = `liquid-glass-${random}`;

		// Create displacement map like the demo
		setTimeout(() => {
			createDisplacementMap();
		}, 10);

		updateOpacity(opacity);
	});

	function createDisplacementMap() {
		if (!glassElement) return;

		const rect = glassElement.getBoundingClientRect();
		const width = Math.max(rect.width || 200, 100);
		const height = Math.max(rect.height || 100, 50);

		// Create displacement map with visible distortion pattern
		const svgContent = `
			<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<radialGradient id="distortion-${filterId}" cx="50%" cy="50%" r="60%">
						<stop offset="0%" stop-color="rgb(128, 140, 128)"/>
						<stop offset="50%" stop-color="rgb(140, 128, 140)"/>
						<stop offset="100%" stop-color="rgb(128, 128, 140)"/>
					</radialGradient>
					<filter id="noise-${filterId}">
						<feTurbulence type="fractalNoise" baseFrequency="0.05 0.08" numOctaves="3" result="noise"/>
						<feColorMatrix in="noise" type="saturate" values="0" result="mono"/>
						<feOffset in="mono" dx="5" dy="3" result="offset"/>
						<feBlend in="offset" in2="SourceGraphic" mode="multiply"/>
					</filter>
				</defs>
				<!-- Base distortion -->
				<rect x="0" y="0" width="${width}" height="${height}" fill="url(#distortion-${filterId})" filter="url(#noise-${filterId})"/>
			</svg>
		`;

		const encoded = encodeURIComponent(svgContent);
		const dataUri = `data:image/svg+xml,${encoded}`;

		// Update the feImage href
		const feImage = document.querySelector(`#${filterId} feImage`);
		if (feImage) {
			feImage.setAttribute('href', dataUri);
		}
	}

	export function updateOpacity(newOpacity: number) {
		opacity = newOpacity;
		if (glassElement) {
			glassElement.style.opacity = opacity.toString();
		}
	}

	$: if (glassElement && filterId) {
		glassElement.style.opacity = opacity.toString();
		glassElement.style.backdropFilter = `url(#${filterId}) blur(5px) saturate(1.2) brightness(1.1)`;
		(glassElement.style as any).webkitBackdropFilter =
			`url(#${filterId}) blur(5px) saturate(1.2) brightness(1.1)`;
	}
</script>

<!-- SVG Filter for liquid glass distortion with chromatic aberration -->
<svg style="position: absolute; width: 0; height: 0;">
	<filter id={filterId || 'liquid-glass'} color-interpolation-filters="sRGB">
		<!-- the input displacement image - exactly like demo -->
		<feImage x="0" y="0" width="100%" height="100%" result="map" />

		<!-- RED channel with strongest displacement -->
		<feDisplacementMap
			in="SourceGraphic"
			in2="map"
			scale="40"
			xChannelSelector="R"
			yChannelSelector="G"
			result="dispRed"
		/>
		<feColorMatrix
			in="dispRed"
			type="matrix"
			values="1 0 0 0 0
					 0 0 0 0 0
					 0 0 0 0 0
					 0 0 0 1 0"
			result="red"
		/>

		<!-- GREEN channel (reference / least displaced) -->
		<feDisplacementMap
			in="SourceGraphic"
			in2="map"
			scale="30"
			xChannelSelector="R"
			yChannelSelector="G"
			result="dispGreen"
		/>
		<feColorMatrix
			in="dispGreen"
			type="matrix"
			values="0 0 0 0 0
					 0 1 0 0 0
					 0 0 0 0 0
					 0 0 0 1 0"
			result="green"
		/>

		<!-- BLUE channel with medium displacement -->
		<feDisplacementMap
			in="SourceGraphic"
			in2="map"
			scale="35"
			xChannelSelector="R"
			yChannelSelector="G"
			result="dispBlue"
		/>
		<feColorMatrix
			in="dispBlue"
			type="matrix"
			values="0 0 0 0 0
					 0 0 0 0 0
					 0 0 1 0 0
					 0 0 0 1 0"
			result="blue"
		/>

		<!-- Blend channels back together -->
		<feBlend in="red" in2="green" mode="screen" result="rg" />
		<feBlend in="rg" in2="blue" mode="screen" result="output" />

		<!-- Final blur for smooth effect -->
		<feGaussianBlur in="output" stdDeviation="0.7" />
	</filter>
</svg>

<div bind:this={glassElement} class="liquid-glass-effect"></div>

<style>
	.liquid-glass-effect {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.15) 0%,
			rgba(255, 255, 255, 0.08) 50%,
			rgba(255, 255, 255, 0.15) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.25);
		border-radius: 8px;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.4),
			inset 0 -1px 0 rgba(255, 255, 255, 0.2),
			0 4px 16px rgba(0, 0, 0, 0.1),
			0 8px 32px rgba(0, 0, 0, 0.05);
	}
</style>

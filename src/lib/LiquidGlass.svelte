<script lang="ts">
	// Original react component from https://medium.com/ekino-france/liquid-glass-in-css-and-svg-839985fcb88d
	// Tweaked and adopted to Svelte by me :)
	import { onMount } from 'svelte';
	import { getDisplacementFilter } from './LiquidHelpers';

	const depth = 10;
	const radius = 30;
	const strength = 100;
	const chromaticAberration = 100;
	const blur = 1;

	let glassElement: HTMLElement;
	let rect: DOMRect;
	let displacementFilter: string;

	onMount(() => {
		rect = glassElement.getBoundingClientRect();
		displacementFilter = getDisplacementFilter({
			width: rect.width,
			height: rect.height,
			radius,
			depth,
			strength,
			chromaticAberration
		});
	});
</script>

<div
	bind:this={glassElement}
	class="liquid-glass"
	style:border-radius="{`${radius}px`};"
	style:backdrop-filter={`
		blur(${blur / 2}px) 
		url('${displacementFilter}') 
		blur(${blur}px) 
		brightness(1.1) 
		saturate(1.5)
	`}
>
	<slot></slot>
</div>

<style>
	.liquid-glass {
		background: rgba(255, 255, 255, 0.73);
	}
</style>

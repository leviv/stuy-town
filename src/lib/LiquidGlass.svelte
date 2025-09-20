<script lang="ts">
	import { onMount } from 'svelte';
	import { getDisplacementFilter } from './LiquidHelpers';

	export let depth = 20;
	export let radius = 10;
	export let strength = 1;
	export let chromaticAberration = 0.5;
	export let blur = 2;

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

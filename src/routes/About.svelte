<script>
	import LiquidGlass from '$lib/LiquidGlass.svelte';

	let showIcon = true;
</script>

<div
	class="about"
	on:mouseenter={() => {
		showIcon = false;
	}}
	on:mouseleave={() => {
		showIcon = true;
	}}
	role="contentinfo"
>
	<LiquidGlass opacity={1} />
	<div class="about-content">
		<span style="display:{showIcon ? 'block' : 'none'};" class="icon">?</span>

		<div class="made-by text-box" style="display:{showIcon ? 'none' : 'block'};">
			<p>
				Made by
				<a href="https://leviv.cool" target="_blank">
					<img src="./assets/levi.png" alt="Levi" />
				</a>
				for the IMA Low Res summer showcase @ NYU.
			</p>
			<p>
				Special thanks to <em>Ashton Reeder</em> for Rhino help and <em>Daphne Chiang</em> for the color
				scheme
			</p>
			<p>&copy; August 2025.</p>
		</div>
	</div>
</div>

<style lang="scss">
	.about {
		position: absolute;
		bottom: 40px;
		right: 40px;
		min-width: 50px;
		max-width: 400px;
		min-height: 50px;
		cursor: help;
		display: flex;
		justify-content: center;
		align-items: center;

		@media (max-width: 450px) {
			right: auto;
		}

		z-index: 1000;
	}

	.icon {
		font-family: 'Modak', system-ui;
		font-size: 44px;
		color: #2e58ff;
		-webkit-text-stroke: 2px black;
		position: relative;
		top: 3px;
	}

	.about-content {
		position: relative;
		z-index: 3;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0 20px;
	}

	.made-by {
		font-size: 18px;
		text-align: right;
		line-height: 23px;

		img {
			border-radius: 50%;
			display: inline-block;
			height: 20px;
			margin: 0;
			align-items: center;
			justify-content: center;
		}

		&:before {
			background-image: url(../assets/border_transparent3.svg);
		}
	}
</style>

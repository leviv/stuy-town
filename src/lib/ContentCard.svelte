<script lang="ts">
</script>

<div class="content-card">
	<slot />
</div>

<style>
	.content-card :global(p) {
		margin: 0 0 10px 0;
		color: #222;
		text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
		line-height: 1.6;
		font-size: 14px;
	}

	.content-card :global(h4) {
		margin: 0 0 10px 0;
		color: #333;
		font-size: 16px;
		font-weight: 600;
	}

	.content-card :global(img) {
		max-width: 100%;
		height: auto;
		display: block;
		border-radius: 4px;
		margin: 10px 0;
	}

	.content-card :global(ul) {
		color: #222;
		font-size: 14px;
		line-height: 1.4;
		margin: 10px 0;
		padding-left: 20px;
	}

	.content-card :global(blockquote) {
		color: #444;
		font-size: 14px;
		margin: 10px 0;
		border-left: 3px solid #2e58ff;
		padding-left: 15px;
		font-style: italic;
	}

	.content-card :global(strong) {
		font-weight: 600;
	}

	.content-card :global(small) {
		font-size: 11px;
		opacity: 0.8;
	}

	.content-card :global(.stat-container) {
		display: flex;
		gap: 10px;
		margin: 10px 0;
	}

	.content-card :global(.stat-box) {
		background: rgba(46, 88, 255, 0.2);
		padding: 8px;
		border-radius: 4px;
		flex: 1;
		text-align: center;
	}

	.content-card :global(.feature-grid) {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		margin: 10px 0;
	}

	.content-card :global(.feature-box) {
		background: rgba(255, 255, 255, 0.1);
		padding: 10px;
		border-radius: 4px;
		text-align: center;
	}

	.content-card :global(.highlight) {
		color: #2e58ff;
		font-weight: bold;
	}

	.content-card :global(.gradient-text) {
		background: linear-gradient(45deg, #2e58ff, #fff);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		font-weight: bold;
		font-size: 1.2em;
	}

	.content-card :global(.architecture-box) {
		background: linear-gradient(135deg, rgba(139, 69, 19, 0.3), rgba(178, 34, 34, 0.3));
		padding: 15px;
		border-radius: 8px;
		margin: 10px 0;
	}

	.content-card :global(.architecture-box h4) {
		color: #8b4513;
	}

	.content-card :global(.population-box) {
		background: rgba(46, 88, 255, 0.1);
		border: 2px solid rgba(46, 88, 255, 0.3);
		padding: 15px;
		border-radius: 8px;
		margin: 10px 0;
	}

	.content-card :global(.citation) {
		background: linear-gradient(45deg, rgba(46, 88, 255, 0.1), rgba(255, 255, 255, 0.1));
		padding: 15px;
		border-radius: 8px;
		margin: 10px 0;
		border-left: 4px solid #2e58ff;
	}
</style>

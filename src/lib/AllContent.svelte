<script lang="ts">
	import ContentCard from './ContentCard.svelte';

	export let cardIndex: number = 0;

	// All content in one place - easy to edit!
	const allCards = [
		// INTRODUCTION SECTION
		{
			title: 'Introduction',
			component: 'intro1',
			content: {
				title: 'Introduction Overview',
				text: 'Stuyvesant Town, commonly known as Stuy Town, is a large post-World War II private residential development on the east side of Manhattan.',
				image: 'assets/Craft_Light.jpg',
				alt: 'Stuyvesant Town aerial view'
			}
		},
		{
			title: 'Introduction',
			component: 'intro2',
			content: {
				title: 'Historical Integration',
				text: 'Built by the Metropolitan Life Insurance Company, it was one of the first racially integrated housing developments in the United States.',
				note: 'This integration was groundbreaking for its time.'
			}
		},
		{
			title: 'Introduction',
			component: 'intro3',
			content: {
				title: 'Complex Statistics',
				text: 'The complex consists of 110 red brick buildings containing 11,250 apartments on 80 acres.',
				stats: ['110 buildings total', '11,250 individual apartments', '80 acres of development']
			}
		},

		// HISTORY SECTION
		{
			title: 'History',
			component: 'history1',
			content: {
				title: 'Construction Timeline',
				text: 'Construction began in 1943 and was completed in 1947, designed by the architectural firms of Gilmore D. Clarke and Robert Allan Jacobs.',
				quote: 'A revolutionary approach to urban housing for the post-war era'
			}
		},
		{
			title: 'History',
			component: 'history2',
			content: {
				title: 'Veterans Housing',
				text: 'The development was originally intended to provide affordable housing for returning World War II veterans and their families.',
				image: 'assets/Parchment.jpg',
				alt: 'Historical document',
				imageStyle: 'width: 60%;'
			}
		},
		{
			title: 'History',
			component: 'history3',
			content: {
				title: 'Investment Scale',
				text: 'Metropolitan Life invested $90 million in the project, making it one of the largest private housing developments of its time.',
				statBoxes: [
					{ label: '$90M', sublabel: 'Investment' },
					{ label: '1943-47', sublabel: 'Construction' }
				]
			}
		},

		// ARCHITECTURE SECTION
		{
			title: 'Architecture',
			component: 'arch1',
			content: {
				title: 'Park-like Setting',
				text: 'The buildings are arranged in a park-like setting with landscaped courtyards and playgrounds throughout the complex.',
				image: 'assets/Watercolor_ColdPress.jpg',
				alt: 'Architectural layout',
				imageStyle: 'opacity: 0.8;'
			}
		},
		{
			title: 'Architecture',
			component: 'arch2',
			content: {
				title: 'Building Design',
				text: 'Each building is 13 stories high and features the distinctive red brick facade that has become synonymous with post-war housing.',
				features: [
					'Red brick construction',
					'13-story height standard',
					'Modernist design principles'
				]
			}
		},
		{
			title: 'Architecture',
			component: 'arch3',
			content: {
				title: 'Community Focus',
				text: 'The design emphasizes community living with shared spaces and recreational facilities integrated throughout the development.',
				featureGrid: [
					{ icon: '🏞️', label: 'Green Spaces' },
					{ icon: '🏃‍♂️', label: 'Recreation' }
				]
			}
		},

		// COMMUNITY SECTION
		{
			title: 'Community',
			component: 'community1',
			content: {
				title: 'Population',
				text: 'Today, Stuy Town houses approximately 30,000 residents, making it one of the largest residential complexes in Manhattan.',
				highlight: '30,000 residents',
				note: "One of NYC's most populated single developments"
			}
		},
		{
			title: 'Community',
			component: 'community2',
			content: {
				title: 'Amenities',
				text: 'The community features multiple playgrounds, a recreation center, and extensive green spaces rare in Manhattan.',
				image: 'assets/noise1.png',
				alt: 'Community amenities',
				imageStyle: 'width: 80%; filter: sepia(20%);',
				caption: 'Community spaces and amenities'
			}
		},
		{
			title: 'Community',
			component: 'community3',
			content: {
				title: 'Legacy',
				text: 'Despite urban development pressures, the complex maintains its original character and continues to serve as affordable housing.',
				legacy: {
					title: 'Legacy Impact:',
					text: 'Stuy Town continues to be a model for large-scale affordable housing in urban environments, balancing community needs with architectural innovation.'
				}
			}
		}
	];

	$: currentCard = allCards[cardIndex] || allCards[0];
</script>

<!-- Render the current card based on cardIndex -->
{#if currentCard}
	<ContentCard title={currentCard.content.title}>
		<!-- Main text content -->
		{#if currentCard.content.text}
			<p>
				{#if currentCard.content.highlight}
					{@html currentCard.content.text.replace(
						currentCard.content.highlight,
						`<span style="font-size: 1.3em;" class="highlight">${currentCard.content.highlight}</span>`
					)}
				{:else if currentCard.component === 'intro3'}
					The complex consists of <span class="highlight">110 red brick buildings</span> containing
					<span class="highlight">11,250 apartments</span>
					on <span class="highlight">80 acres</span>.
				{:else if currentCard.component === 'arch2'}
					Each building is <span class="highlight">13 stories high</span> and features the
					distinctive <em>red brick facade</em> that has become synonymous with post-war housing.
				{:else if currentCard.component === 'history1'}
					Construction began in <strong>1943</strong> and was completed in <strong>1947</strong>,
					designed by the architectural firms of <em>Gilmore D. Clarke</em> and
					<em>Robert Allan Jacobs</em>.
				{:else if currentCard.component === 'history2'}
					The development was originally intended to provide <strong>affordable housing</strong> for
					returning World War II veterans and their families.
				{:else if currentCard.component === 'history3'}
					Metropolitan Life invested <span class="gradient-text">$90 million</span> in the project, making
					it one of the largest private housing developments of its time.
				{:else if currentCard.component === 'intro2'}
					Built by the <em>Metropolitan Life Insurance Company</em>, it was one of the first
					racially integrated housing developments in the United States.
				{:else if currentCard.component === 'arch1'}
					The buildings are arranged in a <strong>park-like setting</strong> with landscaped courtyards
					and playgrounds throughout the complex.
				{:else if currentCard.component === 'arch3'}
					The design emphasizes <strong>community living</strong> with shared spaces and recreational
					facilities integrated throughout the development.
				{:else if currentCard.component === 'community2'}
					The community features multiple <strong>playgrounds</strong>, a
					<strong>recreation center</strong>, and extensive <em>green spaces</em> rare in Manhattan.
				{:else if currentCard.component === 'community3'}
					Despite urban development pressures, the complex maintains its <em>original character</em>
					and continues to serve as <strong>affordable housing</strong>.
				{:else}
					{currentCard.content.text}
				{/if}
			</p>
		{/if}

		<!-- Image content -->
		{#if currentCard.content.image}
			<img
				src={currentCard.content.image}
				alt={currentCard.content.alt || ''}
				style={currentCard.content.imageStyle || ''}
			/>
		{/if}

		<!-- Caption -->
		{#if currentCard.content.caption}
			<div style="text-align: center;">
				<small style="color: rgba(0,0,0,0.6);">{currentCard.content.caption}</small>
			</div>
		{/if}

		<!-- Info box/note -->
		{#if currentCard.content.note}
			{#if currentCard.component === 'intro2'}
				<div class="info-box">
					<strong>Historical Note:</strong>
					{currentCard.content.note}
				</div>
			{:else if currentCard.component === 'community1'}
				<div class="population-box">
					<strong>Population Density:</strong>
					{currentCard.content.note}
				</div>
			{/if}
		{/if}

		<!-- Quote -->
		{#if currentCard.content.quote}
			<blockquote>
				"{currentCard.content.quote}"
			</blockquote>
		{/if}

		<!-- Stats list -->
		{#if currentCard.content.stats}
			<ul>
				{#each currentCard.content.stats as stat}
					<li>{stat}</li>
				{/each}
			</ul>
		{/if}

		<!-- Stat boxes -->
		{#if currentCard.content.statBoxes}
			<div class="stat-container">
				{#each currentCard.content.statBoxes as statBox}
					<div class="stat-box">
						<strong>{statBox.label}</strong><br /><small>{statBox.sublabel}</small>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Architecture features -->
		{#if currentCard.content.features}
			<div class="architecture-box">
				<h4>Architectural Features:</h4>
				<ul>
					{#each currentCard.content.features as feature}
						<li>{feature}</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Feature grid -->
		{#if currentCard.content.featureGrid}
			<div class="feature-grid">
				{#each currentCard.content.featureGrid as feature}
					<div class="feature-box">
						{feature.icon}<br /><strong>{feature.label}</strong>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Legacy box -->
		{#if currentCard.content.legacy}
			<div class="legacy-box">
				<h4>{currentCard.content.legacy.title}</h4>
				<p>{currentCard.content.legacy.text}</p>
			</div>
		{/if}
	</ContentCard>
{/if}

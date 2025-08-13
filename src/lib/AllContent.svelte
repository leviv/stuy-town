<script lang="ts">
	import ContentCard from './ContentCard.svelte';

	export let cardIndex: number = 0;
</script>

<!-- Card 0: Introduction Overview -->
<div class="card {cardIndex === 0 ? 'active' : ''}">
	<ContentCard title="Introduction Overview">
		<p>
			Stuyvesant Town, commonly known as StuyTown, is a housing development in Manhattan, New York
			City. It is the largest rental community in the United States.
		</p>
	</ContentCard>
</div>

<!-- Card 1: Historical Integration -->
<div class="card {cardIndex === 1 ? 'active' : ''}">
	<ContentCard title="Historical Integration">
		<p>
			The massive housing complex was conceived as a project between two of the largest forces in
			New York City in the mid twentieth century - Robert Moses and The Metropolitan Life Company
			(MetLife).
		</p>
		<div class="info-box">
			<strong>Historical Note:</strong>
			This integration was groundbreaking for its time.
		</div>
	</ContentCard>
</div>

<!-- Card 2: Complex Statistics -->
<div class="card {cardIndex === 2 ? 'active' : ''}">
	<ContentCard title="Complex Statistics">
		<p>
			The complex consists of <span class="highlight">110 red brick buildings</span> containing
			<span class="highlight">11,250 apartments</span>
			on <span class="highlight">80 acres</span>.
		</p>
		<ul>
			<li>110 buildings total</li>
			<li>11,250 individual apartments</li>
			<li>80 acres of development</li>
		</ul>
	</ContentCard>
</div>

<!-- Card 3: Construction Timeline -->
<div class="card {cardIndex === 3 ? 'active' : ''}">
	<ContentCard title="Construction Timeline">
		<p>
			Construction began in <strong>1943</strong> and was completed in <strong>1947</strong>,
			designed by the architectural firms of <em>Gilmore D. Clarke</em> and
			<em>Robert Allan Jacobs</em>.
		</p>
		<blockquote>"A revolutionary approach to urban housing for the post-war era"</blockquote>
	</ContentCard>
</div>

<!-- Card 4: Veterans Housing -->
<div class="card {cardIndex === 4 ? 'active' : ''}">
	<ContentCard title="Veterans Housing">
		<p>
			The development was originally intended to provide <strong>affordable housing</strong> for returning
			World War II veterans and their families.
		</p>
		<img src="assets/Parchment.jpg" alt="Historical document" style="width: 60%;" />
	</ContentCard>
</div>

<!-- Card 5: Investment Scale -->
<div class="card {cardIndex === 5 ? 'active' : ''}">
	<ContentCard title="Investment Scale">
		<p>
			Metropolitan Life invested <span class="gradient-text">$90 million</span> in the project, making
			it one of the largest private housing developments of its time.
		</p>
		<div class="stat-container">
			<div class="stat-box">
				<strong>$90M</strong><br /><small>Investment</small>
			</div>
			<div class="stat-box">
				<strong>1943-47</strong><br /><small>Construction</small>
			</div>
		</div>
	</ContentCard>
</div>

<!-- Card 6: Park-like Setting -->
<div class="card {cardIndex === 6 ? 'active' : ''}">
	<ContentCard title="Park-like Setting">
		<p>
			The buildings are arranged in a <strong>park-like setting</strong> with landscaped courtyards and
			playgrounds throughout the complex.
		</p>
		<img src="assets/Watercolor_ColdPress.jpg" alt="Architectural layout" style="opacity: 0.8;" />
	</ContentCard>
</div>

<!-- Card 7: Building Design -->
<div class="card {cardIndex === 7 ? 'active' : ''}">
	<ContentCard title="Building Design">
		<p>
			Each building is <span class="highlight">13 stories high</span> and features the distinctive
			<em>red brick facade</em> that has become synonymous with post-war housing.
		</p>
		<div class="architecture-box">
			<h4>Architectural Features:</h4>
			<ul>
				<li>Red brick construction</li>
				<li>13-story height standard</li>
				<li>Modernist design principles</li>
			</ul>
		</div>
	</ContentCard>
</div>

<!-- Card 8: Community Focus -->
<div class="card {cardIndex === 8 ? 'active' : ''}">
	<ContentCard title="Community Focus">
		<p>
			The design emphasizes <strong>community living</strong> with shared spaces and recreational facilities
			integrated throughout the development.
		</p>
		<div class="feature-grid">
			<div class="feature-box">
				�️<br /><strong>Green Spaces</strong>
			</div>
			<div class="feature-box">
				🏃‍♂️<br /><strong>Recreation</strong>
			</div>
		</div>
	</ContentCard>
</div>

<!-- Card 9: Population -->
<div class="card {cardIndex === 9 ? 'active' : ''}">
	<ContentCard title="Population">
		<p>
			Today, Stuy Town houses approximately <span style="font-size: 1.3em;" class="highlight"
				>30,000 residents</span
			>, making it one of the largest residential complexes in Manhattan.
		</p>
		<div class="population-box">
			<strong>Population Density:</strong>
			One of NYC's most populated single developments
		</div>
	</ContentCard>
</div>

<!-- Card 10: Amenities -->
<div class="card {cardIndex === 10 ? 'active' : ''}">
	<ContentCard title="Amenities">
		<p>
			The community features multiple <strong>playgrounds</strong>, a
			<strong>recreation center</strong>, and extensive <em>green spaces</em> rare in Manhattan.
		</p>
		<img
			src="assets/noise1.png"
			alt="Community amenities"
			style="width: 80%; filter: sepia(20%);"
		/>
		<div style="text-align: center;">
			<small style="color: rgba(0,0,0,0.6);">Community spaces and amenities</small>
		</div>
	</ContentCard>
</div>

<!-- Card 11: Legacy -->
<div class="card {cardIndex === 11 ? 'active' : ''}">
	<ContentCard title="Legacy">
		<p>
			Despite urban development pressures, the complex maintains its <em>original character</em> and
			continues to serve as <strong>affordable housing</strong>.
		</p>
		<div class="legacy-box">
			<h4>Legacy Impact:</h4>
			<p>
				Stuy Town continues to be a model for large-scale affordable housing in urban environments,
				balancing community needs with architectural innovation.
			</p>
		</div>
	</ContentCard>
</div>

<style>
	.card {
		display: none;
	}

	.card.active {
		display: block;
	}
</style>

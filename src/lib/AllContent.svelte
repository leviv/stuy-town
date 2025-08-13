<script lang="ts">
	import ContentCard from './ContentCard.svelte';

	export let cardIndex: number = 0;
	export let onToggleParkchester: (() => void) | undefined = undefined;
	export let showParkchester: boolean = false;
</script>

<div class="card {cardIndex === 0 ? 'active' : ''}">
	<ContentCard title="Introduction Overview">
		<p>
			Stuyvesant Town, commonly known as StuyTown, is a housing development in Manhattan, New York
			City. It is the largest rental community in the United States.
		</p>
	</ContentCard>
</div>

<div class="card {cardIndex === 1 ? 'active' : ''}">
	<ContentCard title="Historical Integration">
		<p>
			The massive housing complex was conceived as a project between two of the largest forces in
			New York City in the mid twentieth century - Robert Moses and The Metropolitan Life Company
			(MetLife). Life insurance companies were flush with cash, and were looking for ways to
			diversify their investments. At the same time, WWII had only made the housing crisis worse.
		</p>
		<p>
			In the early 1900s, New York City was facing an extreme housing crisis. Mass migration after
			WWI and the great depression had left resources strained, and led to crowded, unsanitary
			tenements. In 1926, Governor Al Smith, convinced a reluctant legislature to pass the Limited
			Dividend Housing Companies Law. This gave private developers twenty years of tax exemption in
			return for limited rents and profits. Most projects built under the program were
			union-sponsored, non-profit cooperatives. However, the program was unpopular, with private
			developers unwilling to undertake the risk of construction for seemingly less lucrative
			rent-stabilized units.
		</p>
		<div class="citation">
			<a
				href="https://www.jchs.harvard.edu/sites/default/files/tanaka_fiduciary_landlords_final_4-18-17_0.pdf"
				target="_blank"
			>
				Fiduciary Landlords: Life Insurers and Large-Scale Housing in New York City by Adam Tanaka
			</a>
		</div>
	</ContentCard>
</div>

<div class="card {cardIndex === 2 ? 'active' : ''}">
	<ContentCard title="Historical Integration">
		<p>
			One private developer with a history of involvement in public health initiatives was
			interested in the program, and In March 1922, Met Life executives succeeded in pressuring the
			legislature to pass the so-called “Metropolitan Bill.” This enabled them, and all insurance
			companies operating in New York State to invest up to ten percent of their assets in
			residential development, with profits capped at six percent. This led to the creation of
			Metropolitan Life apartments in Queens, but little other development. However, the coming
			depression would change the pace of life insurance based development.
		</p>
		<img src="assets/met-life-apts-lic.png" alt="Metropolitan Life Apartments in LIC, Queens" />
	</ContentCard>
</div>

<div class="card {cardIndex === 3 ? 'active' : ''}">
	<ContentCard title="Historical Integration">
		<p>
			Concerned with a stagnating economy in the late 1930s, Met Life once again began pressuring
			the government for advantageous legislation. And again they succeeded, allowing them to invest
			up to 10% of their assets in rental housing, but this time with no limitations on rents or
			dividends.
		</p>
		<p>
			Work began nearly immediately on Parkchester, an "apartment colony" in the southern Bronx,
			using what they had learned in Queens to construct a massive 12,271 apartment complex. This
			former orphanage land became largest housing development in American history. The project was
			a success, with tenants, city leads, and MetLife stockholders satisfied.
		</p>
		{#if onToggleParkchester}
			<button on:click={onToggleParkchester} class="parkchester-button">
				{showParkchester ? 'Back to Stuy Town' : 'Compare with Parkchester'}
			</button>
		{/if}
	</ContentCard>
</div>

<div class="card {cardIndex === 4 ? 'active' : ''}">
	<ContentCard title="Historical Integration">
		<p>
			As the need for affordable housing continued to climb as the 1930s turned into the 1940s,
			Robert Moses and Mayor Fiorello La Guardia began planning to offer even more lucrative
			incentives to private developers. The Metropolitan Life Insurance Company was the perfect
			target, with WWII giving a “stupendous increase” to all life insurer assets. The amended 1943
			law, extended the tax exemption to twenty-five years, removed income ceilings on occupants,
			and struck the clause requiring redevelopers to manage relocation proceedings. Functionally,
			this meant that private developers could now use eminent domain to erect private housing.
		</p>
		<p>
			Metropolitan Life was the largest employer in the city at this time, with over 15,000
			employees in its midtown office alone. Better housing, many believed, also meant longer lives
			and stronger business. A New York Times reporter noted that the development of Stuyvesant Town
			was a “purely self-interested proposition” for the nation's largest life insurer, as “people
			in non-slum areas live longer and continue to pay insurance premiums.” The redevelopment
			project would also shore up property values in a part of the city where Metropolitan had
			significant real estate and mortgage holdings and Stuyvesant Town's proximity to the company's
			lavish headquarters on 23rd Street meant it could also serve as low-rent housing for its
			workforce.
		</p>
		<p>
			Metropolitan Life officials saw their role differently, of course, publicly framing Stuyvesant
			Town as simply the latest iteration of the company's longstanding commitment, “characteristic
			of the American way of life, of private enterprise promoting public welfare.” Privately
			though, they recognized that rental housing represented a new investment class that might
			diversify company portfolios and compensate for sagging returns across the board.
		</p>
	</ContentCard>
</div>

<div class="card {cardIndex === 5 ? 'active' : ''}">
	<ContentCard title="Historical Integration">
		<p>
			The success of these developments (StuyTown in lower Manhattan, Parkchester in the Bronx,
			Rivertown in Harlem) led to insurance-led development around the country. Parkmerced in San
			Francisco, Parklabrea in Los Angeles, and Parkfairfax were all created by Met Life alone. The
			perfect conditions of wealthy life insurance companies, and a country desperate for post-war
			affordable urban housing created this unique period of architectural history.
		</p>
		<p>
			As tax incentives expired and the post-war housing boom slowed, life insurance giants turned
			their eyes towards the suburbs. This was in large part due to the effect of city planners such
			as Robert Moses, who prioritized highways and automobile infrastructure, making suburban
			living more accessible and appealing comparative to urban areas.
		</p>
	</ContentCard>
</div>

<div class="card {cardIndex === 6 ? 'active' : ''}">
	<ContentCard title="Historical Integration">
		<p>When stuy town was announced, there was no shortage of controversy.</p>
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

	.parkchester-button {
		margin-top: 15px;
		padding: 10px 20px;
		background: none;
		border: 3px solid #2e58ff;
		color: #2e58ff;
		border-radius: 8px;
		font-family: 'Fira Sans', sans-serif;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 2px 8px rgba(46, 88, 255, 0.3);
	}

	.parkchester-button:hover {
		background: #2e58ff;
		color: white;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(46, 88, 255, 0.4);
	}

	.parkchester-button:active {
		transform: translateY(0);
	}
</style>

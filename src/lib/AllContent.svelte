<script lang="ts">
	import ContentCard from './ContentCard.svelte';

	export let cardIndex: number = 0;
	export let onToggleParkchester: (() => void) | undefined = undefined;
	export let showParkchester: boolean = false;
	export let onToggleRiverton: (() => void) | undefined = undefined;
	export let showRiverton: boolean = false;
</script>

<div class="card {cardIndex === 0 ? 'active' : ''}">
	<ContentCard title="Introduction Overview">
		<p>
			Stuyvesant Town, commonly known as StuyTown, is a housing development in Manhattan, New York
			City. It is the <em>largest</em> rental community in the United States.
		</p>
	</ContentCard>
</div>

<div class="card {cardIndex === 1 ? 'active' : ''}">
	<ContentCard title="Historical Integration">
		<p>
			The massive housing complex was conceived as a project between two of the largest forces in
			New York City in the mid twentieth century - Robert Moses and The Metropolitan Life Company
			(MetLife). Life insurance companies were flush with cash, and were looking for ways to
			diversify their investments. At the same time, WWII had only made a bad housing crisis worse.
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
			<button on:click={onToggleParkchester} class="switch-button">
				{showParkchester ? 'Back to StuyTown' : 'Compare with Parkchester'}
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
			target, with WWII war bonds providing a “stupendous increase” to all life insurer assets. The
			amended 1943 law, extended the tax exemption to twenty-five years, removed income ceilings on
			occupants, and struck the clause requiring redevelopers to manage relocation proceedings.
			Functionally, this meant that private developers could now use eminent domain to erect private
			housing.
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
			Riverton in Harlem) led to insurance-led development around the country. Parkmerced in San
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
		<p>
			When StuyTown was announced, there was no shortage of controversy. There were two big issues
			at play:
		</p>
		<div class="citation">
			The 'whites only' renter policy established by Met Life president Frederick H. Ecker.
			Especially because the project used federal resources.
		</div>
		<div class="citation">
			Criticism of the extremely ultilitarian, superblock design of the neighborhood
		</div>
		<p>
			While racial discrimination seems the much greater injustice by todays standards, both issues
			had near equal weight in the public discourse of the time.
		</p>
	</ContentCard>
</div>

<div class="card {cardIndex === 7 ? 'active' : ''}">
	<ContentCard title="Historical Integration">
		<p>
			The real heart of the controversy was the fact that StuyTown was built with public resources,
			but did not serve everyone in the public equally. To clear space for the new construction,
			developers demolished 500 stores and small factories, three churches, three schools, and two
			theaters. In their place was put private housing, private roads and private parks, for only
			the benefit of white, middle-class veterans and their family. And while public housing
			projects in the city had to be open to any race, there were not yet any such restrictions on
			private developments.
		</p>
		<p>
			At the heart of the decision making was Fiorello La Guardia, the mayor of New York City. His
			wife, Thea, and only child had died of Tuberculosis in crowded dirty tenements, and his
			passion for so-called slum clearance was deeply personal. Also a champion for the rights of
			black and Puerto Rican New Yorkers, this issue tainted his legacy. City Planner Robert Moses
			downplayed the racial aspects of the controversy, instead stressing that without accepting Met
			Life's demands on tenant selection, the project would not get built.
		</p>
		<div class="citation">
			<a href="https://nyheritage.contentdm.oclc.org/digital/collection/NYHSR01/id/22170"
				>Fiorello H. La Guardia and the Stuyvesant Town Controversy of 1943 by Dominic J Capeci Jr</a
			>
		</div>
	</ContentCard>
</div>

<div class="card {cardIndex === 8 ? 'active' : ''}">
	<ContentCard title="Historical Integration">
		<p>
			Shamefaced by his role in the controversy, La Guardia sought to balance the scales by building
			more public housing in predominantly black and Puerto Rican neighborhoods. Abraham Lincoln and
			James Weldon Johnson houses, as well as the Met Life constructed Riverton Houses were all part
			of this effort.
		</p>
		<p>
			This 'separate but equal' approach hardly silenced the criticism. Especially because they were
			clearly not equal in terms of occupancy limit(11,250 apartments vs 1,232), amenities, and
			location. Metropolitan Life was notorious for seeking black customers while refusing to employ
			black people, and this was rightfully called out of being an extension of Eckers personal
			beliefs that "Negroes and whites don't mix. Perhaps they will in a hundred years, but they
			don't now."
		</p>
		{#if onToggleRiverton}
			<button on:click={onToggleRiverton} class="switch-button">
				{showRiverton ? 'Back to StuyTown' : 'Compare with Riverton'}
			</button>
		{/if}
	</ContentCard>
</div>

<div class="card {cardIndex === 9 ? 'active' : ''}">
	<ContentCard title="Historical Integration">
		<p>
			And residents of StuyTown were not silent in the face of these injustices. The population
			being compromised almost entirely of WWII veterans, these men who had fought facism abroad
			were calling to lay the groundwork for a more quitable post-war America at home. In fact, 62%
			of residents favored lifting ending discrimination in the complex.
		</p>
		<div class="citation">
			"If Negro and white can die side by side, they should be permitted to live side by side" -
			Harlem Committee Teachers Union
		</div>
		<p>
			Residents formed the Tenants' Committee to End Discrimination in Stuyvesant Town to advocate
			for integration, not just in StuyTown, but across New York. Activists were routinely evicted
			for holding rallies and posting flyers. In the case of University Professor Lee Lorch, fired
			from their position and blacklisted from new jobs. This caused outrage from around the
			country, with even Albert Einstein writing a letter decrying the action.
		</p>
	</ContentCard>
</div>

<div class="card {cardIndex === 10 ? 'active' : ''}">
	<ContentCard title="Historical Integration">
		<img
			src="assets/tenants.jpg"
			alt="Pamphlet by the Town and Village Committee to End Discrimination in Stuyvesant Town"
		/>
		<div class="citation">
			Pamphlet by the Town and Village Committee to End Discrimination in Stuyvesant Town showing 14
			families evicted for their fight against segregation (1950)
		</div>
	</ContentCard>
</div>

<div class="card {cardIndex === 11 ? 'active' : ''}">
	<ContentCard title="Legacy">
		<p>
			The New York Supreme Court had ruled in 1947 that as a private development, Met Life had the
			right to choose their tenants. The ruling stated that, "Clearly, housing accommodation is not
			a recognized civil right."
		</p>
		<p>
			These actions explicitly led to the passage of the Brown-Isaacs bill, which prohibited and
			penalized discrimination or segregation in private housing projects that received federal
			assistance or resources. The bill forbids discrimination against or segregation of any person
			because of “race, color, creed, religion, national origin or ancestry.”
		</p>
		<p>
			Legislation went even further with the Sharkey-Brown-Isaacs Bill, which banned discrimination
			in all private housing developments. This act represented the first attempt by the state or
			city to regulate discriminatory practices in housing with no public funding.
		</p>
	</ContentCard>
</div>

<div class="card {cardIndex === 12 ? 'active' : ''}">
	<ContentCard title="Legacy">
		<p>
			Four years after NYC's law, Albany enacted a similar statewide statute (the Metcalf-Baker Fair
			Housing Law) in 1961, barring discrimination in most private housing. This again was the first
			statewide legislation of it's kind, and it laid the groundwork for future anti-discrimination
			measures across the country.
		</p>
		<p>
			Because it was the first state to extend anti-discrimination protections this far into the
			private housing market, Metcalf-Baker became a model cited in debates leading to the federal
			Fair Housing Act of 1968.
		</p>
		<p>
			This is a legacy that current StuyTown residents should be proud of and continue to uphold.
		</p>
	</ContentCard>
</div>

<div class="card {cardIndex === 13 ? 'active' : ''}">
	<ContentCard title="Legacy">
		<div class="citation">
			"While some condemned the development as a 'Jim Crow housing project that will […] keep the
			Negro walled in,' others conceded that 'people are so badly in need of housing in the area
			that they would still apply over our protest.'"
		</div>
		<p>
			Few quotes sum up the conflicting sentiments surrounding the development better than this.
			Architecture journals and newspaper opinion columns were full of criticism for the
			developments aesthetics, and the public decried civil rights violations. But the tenants lucky
			enough to get an apartment cherished raising their families in the urban oasis these buildings
			provided at a rate they could afford.
		</p>
		<p>
			The design of StuyTown is a product of the modernist architectural movement of the time, the
			demands of the post-war housing crisis, and the vision of its design board.
		</p>
	</ContentCard>
</div>

<div class="card {cardIndex === 14 ? 'active' : ''}">
	<ContentCard title="Legacy">
		<p>
			The trend towards tall apartment buildings set in park-like settings in New York city was
			partially a reaction to the cramped, dirty tenements that bred disease, crime, and poverty.
			The lack of clean air, recreational space and nature was commonly believed to promote
			troublesome behavior in children, and poor health outcomes in everyone.
		</p>
		<p>
			Le Corbusier, a prominent Swiss-French architect, proposed a hyper-rationalist contemporary
			city, which proposed demolishing our old cities to replace them with these 'Towers in the
			Park'. Already known as a notable architect and urban planner, his ideas were spread widely in
			Europe and North America in World Fairs and architectural exhibitions. It was part of a larger
			trend of Modernism - housing was thought to be purely functional, and rid itself of ornamental
			material.
		</p>
	</ContentCard>
</div>

<div class="card {cardIndex === 15 ? 'active' : ''}">
	<ContentCard title="Legacy">
		<p>
			Arguably the two most influential designers of StuyTown, Gilmore David Clarke and Michael
			Rapuano, were well versed in the parks amongst the towers. They had both grown up surrounded
			by nature. Clarke was the son of a flourist and the grandon of a gardener, while Rapuano was
			the son of the Superintendent of Parks in the City of Syracuse. Both went on to work for the
			then parks commissioner Robert Moses, designing parks, playgrounds, and parkways in and around
			the New York City area.
		</p>
		<p>
			Both were educated at Cornell in landscape architecture and were well versed in modernism and
			hollistic planning, studying under Bryant Fleming. Rapuano had spent considerable time
			studying at the American Academy in Rome further developing his understanding of modernism.
			Already working with Robert Moses on the New York World's Fair, they were tapped to be two of
			the few people on the board of design which managed the Parkchester development.
		</p>
		<div class="citation">
			<a href="https://search.worldcat.org/title/1203731076" target="_blank"
				>Oral history interview with Gilmore David Clarke, 1959
			</a>
		</div>
	</ContentCard>
</div>

<div class="card {cardIndex === 16 ? 'active' : ''}">
	<ContentCard title="Legacy">
		<div class="citation">
			"They worked very hard to get the greatest economy of use - to cut down to the greatest
			possible degree the area of public space in the buildings, such as halls, and to arrange the
			rooms in each apartment in the most efficient possible manner."
			<br />
			<br />
			"They made mocked up, real size apartments with furniture and dishes and everything for employees
			of Met Life to walk through and suggest improvements. This helped inform things like the best place
			to but light outlets, or how high people should reach for shelves in the kitchen, or what kind
			of kitchen arrangements. The result was they could eliminate two light outlets - with 12 or 13
			thousand apartments and with light outlets at $3 apiece, you can see that we effected quite a saving.""
			<br />
			<br />
			"There were a lot of other things that we found out about merely by having people who couldn't
			read plans telling us what they thought would be an improvement. In a word, it paid off very well.
			Later when the same Board of Design was reconstituted for the planning of Stuyvesant Town, Peter
			Cooper Village, and Riverton, we took advantage of a lot of the criticism that had come up in Parkchester
			(by talking to tenants who were friendly but critical) as to how apartment details should be worked
			out."
			<br />
			<br />- Gilmore David Clarke
		</div>
		<p>
			The board of design went to great lengths to consider every design detail in the Parkchester
			complex. From the apartments, to the playground equipments, to the plants, everthing was
			considered.
		</p>
		{#if onToggleParkchester}
			<button on:click={onToggleParkchester} class="switch-button">
				{showParkchester ? 'Back to StuyTown' : 'Compare with Parkchester'}
			</button>
		{/if}
	</ContentCard>
</div>

<div class="card {cardIndex === 17 ? 'active' : ''}">
	<ContentCard title="Legacy">
		<p>
			In fact, the board of design was so successful the economical use of material in Parkchester,
			that their plans have been widely adopted in by New York City Housing in other public housing
			projects. And while many 'tower in the park' developments in New York City and around world
			have been largely seen as failures, these three developments (Parkchester, StuyTown, and
			Riverton) have been recognized as successful models.
		</p>
		<p>
			While Clarke views maintenance as what separates Stuy-town from other slums and projects. It
			also has to do with the location and nature of these developments. All are near public
			transportation, shops, and schools, which contributes to a more social environment. They were
			designed to accommodate for the needs of the middle-class, and tenants took pride in their
			spacious apartments set in a quiet green landscape.
		</p>
	</ContentCard>
</div>

<div class="card {cardIndex === 18 ? 'active' : ''}">
	<ContentCard title="Legacy">
		<p>
			Even with the sale of StuyTown to private equity in 2006, and again in 2016, the community
			stands as a testament to the power that housing has to shape our cities and individual lives.
			As the number of rent controlled units slowly drop off one by one, we can all use this history
			to remind ourselves that a better world is possible, if we design and fight for it.
		</p>
	</ContentCard>
</div>

<style>
	.card {
		display: none;
	}

	.card.active {
		display: block;
	}

	.switch-button {
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
		width: 100%;
	}

	.switch-button:hover {
		background: #2e58ff;
		color: white;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(46, 88, 255, 0.4);
	}

	.switch-button:active {
		transform: translateY(0);
	}
</style>

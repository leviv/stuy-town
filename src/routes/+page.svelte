<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	// @ts-ignore
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
	// @ts-ignore
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
	// import post from lib/post.js
	import { Post } from '$lib/post.js';
	import { Material } from '$lib/Material';
	import { generateParams as generateEnvParams } from '$lib/envMap';
	import { choosePort, getOrientation } from '$lib/arduino';
	import LiquidGlass from '$lib/LiquidGlass.svelte';
	import GUI from 'lil-gui';

	// Canvas element reference
	let canvasContainer: HTMLDivElement;
	let camera: THREE.PerspectiveCamera;
	let renderer: THREE.WebGLRenderer;
	let scene: THREE.Scene;
	let controls: OrbitControls;
	const bgColor = 0xffffff;

	// Arduino orientation variables
	let arduinoModel: THREE.Object3D | null = null;

	// Content navigation variables
	let contentContainer: HTMLDivElement;
	let currentSubtitle = 'Introduction';
	let currentParagraphIndex = 0;

	// Content sections data
	const contentSections = [
		{
			title: 'Introduction',
			paragraphs: [
				'Stuyvesant Town, commonly known as Stuy Town, is a large post-World War II private residential development on the east side of Manhattan.',
				'Built by the Metropolitan Life Insurance Company, it was one of the first racially integrated housing developments in the United States.',
				'The complex consists of 110 red brick buildings containing 11,250 apartments on 80 acres.'
			]
		},
		{
			title: 'History',
			paragraphs: [
				'Construction began in 1943 and was completed in 1947, designed by the architectural firms of Gilmore D. Clarke and Robert Allan Jacobs.',
				'The development was originally intended to provide affordable housing for returning World War II veterans and their families.',
				'Metropolitan Life invested $90 million in the project, making it one of the largest private housing developments of its time.'
			]
		},
		{
			title: 'Architecture',
			paragraphs: [
				'The buildings are arranged in a park-like setting with landscaped courtyards and playgrounds throughout the complex.',
				'Each building is 13 stories high and features the distinctive red brick facade that has become synonymous with post-war housing.',
				'The design emphasizes community living with shared spaces and recreational facilities integrated throughout the development.'
			]
		},
		{
			title: 'Community',
			paragraphs: [
				'Today, Stuy Town houses approximately 30,000 residents, making it one of the largest residential complexes in Manhattan.',
				'The community features multiple playgrounds, a recreation center, and extensive green spaces rare in Manhattan.',
				'Despite urban development pressures, the complex maintains its original character and continues to serve as affordable housing.'
			]
		}
	];

	// Flatten all paragraphs with section info
	const allParagraphs = contentSections.flatMap((section) =>
		section.paragraphs.map((paragraph) => ({
			text: paragraph,
			sectionTitle: section.title
		}))
	);

	let scrollY = 0;

	// Handle keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowUp' && currentParagraphIndex > 0) {
			currentParagraphIndex--;
			updateCurrentSubtitle();
		} else if (event.key === 'ArrowDown' && currentParagraphIndex < allParagraphs.length - 1) {
			currentParagraphIndex++;
			updateCurrentSubtitle();
		}
	}

	// Update subtitle based on current paragraph
	function updateCurrentSubtitle() {
		if (currentParagraphIndex >= 0 && currentParagraphIndex < allParagraphs.length) {
			currentSubtitle = allParagraphs[currentParagraphIndex].sectionTitle;
		}
	}

	// Handle scroll and update subtitle (keeping for compatibility but simplified)
	function handleScroll() {
		// Keep this function for any future scroll-based interactions
	}

	onMount(() => {
		scene = new THREE.Scene();

		const canvasWidth = window.innerWidth;
		const canvasHeight = window.innerHeight;

		// Camera
		camera = new THREE.PerspectiveCamera(60, canvasWidth / canvasHeight, 0.1, 10000);
		camera.position.set(5, 5, 5);

		// Renderer
		renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			preserveDrawingBuffer: true,
			powerPreference: 'high-performance'
		});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(canvasWidth, canvasHeight);
		renderer.setClearColor(bgColor);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		canvasContainer.appendChild(renderer.domElement);

		// Debug GUI
		const gui = new GUI();
		gui.close();
		const materialFolder = gui.addFolder('Material');

		// Lighting controls folder
		const lightingFolder = gui.addFolder('Lighting');

		// Camera controls folder
		const cameraFolder = gui.addFolder('Camera');

		// Camera flight control
		const cameraSettings = { autoFlight: true };
		cameraFolder.add(cameraSettings, 'autoFlight').name('Auto Flight');

		// Arduino controls folder
		const arduinoFolder = gui.addFolder('Arduino Control');

		// Arduino connection control
		const arduinoSettings = {
			enabled: false,
			status: 'Disconnected',
			connect: async () => {
				await choosePort();
				arduinoSettings.enabled = true;
				arduinoSettings.status = 'Connected';
			}
		};
		arduinoFolder.add(arduinoSettings, 'enabled').name('Arduino Control').listen();
		arduinoFolder.add(arduinoSettings, 'status').name('Status').listen();
		arduinoFolder.add(arduinoSettings, 'connect').name('Connect Arduino');

		// Shaders
		const post = new Post(renderer);
		post.setSize(canvasWidth, canvasHeight);

		const material = new Material({
			color: 0x808080,
			roughness: 0.2,
			metalness: 0.1,
			side: THREE.DoubleSide
		});

		// Array to store all materials that need to be updated
		const allMaterials = [material];
		// Generate custom material params that update all materials
		materialFolder.add(material, 'roughness', 0, 1).onChange((v: number) => {
			updateAllMaterials('roughness', v);
		});
		materialFolder.add(material, 'metalness', 0, 1).onChange((v: number) => {
			updateAllMaterials('metalness', v);
		});

		// Function to update all materials when GUI changes
		const updateAllMaterials = (property: string, value: any) => {
			allMaterials.forEach((mat) => {
				if ((mat as any)[property] !== undefined) {
					(mat as any)[property] = value;
				}
			});
		};

		const postController = post.generateParams(materialFolder);
		postController['paper'].setValue('Watercolor cold press');
		const envMapController = generateEnvParams(materialFolder, material);
		envMapController.setValue('bridge');

		// Controls
		controls = new OrbitControls(camera, renderer.domElement);
		// controls.enableDamping = true;
		controls.screenSpacePanning = true;

		// Lights - Softer, more gradual lighting for better crosshatching levels
		const light = new THREE.SpotLight(0xffffff, 650, 100, Math.PI / 3, 0.8, 1.5); // Reduced intensity, wider angle, softer penumbra
		light.position.set(0, 20, 30);
		light.target.position.set(0, 0, 0);
		light.castShadow = true;
		light.shadow.bias = -0.0001;
		light.shadow.mapSize.set(4096, 4096);
		light.shadow.camera.near = 0.1;
		light.shadow.camera.far = 100;
		scene.add(light);

		const light2 = new THREE.SpotLight(0xffffff, 650, 100, Math.PI / 2.5, 0.9, 1.2); // Even softer fill light
		light2.position.set(-30, 20, -30);
		light2.target.position.set(0, 0, 0);
		light2.castShadow = true;
		light2.shadow.bias = -0.0001;
		light2.shadow.mapSize.set(4096, 4096);
		light2.shadow.camera.near = 0.1;
		light2.shadow.camera.far = 100;
		scene.add(light2);

		const hemiLight = new THREE.HemisphereLight(0xffffff, 0x666666, 2); // More balanced hemisphere light
		scene.add(hemiLight);

		// Add ambient light for base illumination to ensure gradual transitions
		const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
		scene.add(ambientLight);

		// Add lighting controls to GUI
		lightingFolder.add(light, 'intensity', 0, 2000, 0.1).name('Spot Light 1');
		lightingFolder.add(light2, 'intensity', 0, 2000, 0.1).name('Spot Light 2');
		lightingFolder.add(hemiLight, 'intensity', 0, 10, 0.1).name('Hemisphere Light');
		lightingFolder.add(ambientLight, 'intensity', 0, 5, 0.1).name('Ambient Light');

		// Resize the canvas and update camera aspect ratio on window resize
		window.addEventListener('resize', () => {
			const canvasWidth = window.innerWidth;
			const canvasHeight = window.innerHeight;

			renderer.setSize(canvasWidth, canvasHeight);
			camera.aspect = canvasWidth / canvasHeight;
			camera.updateProjectionMatrix();
			// Also update post-processing size
			post.setSize(canvasWidth, canvasHeight);
		});

		// Load GLTF
		const loader = new GLTFLoader();
		loader.load(
			'stuy-town.gltf',
			(gltf: { scene: THREE.Object3D<THREE.Object3DEventMap> }) => {
				const model = gltf.scene;

				gltf.scene.traverse((child) => {
					if ((child as THREE.Mesh).isMesh) {
						const mesh = child as THREE.Mesh;
						// Use the same material as the cube but make it double-sided
						const doubleSidedMaterial = material.clone();
						doubleSidedMaterial.side = THREE.DoubleSide;
						mesh.material = doubleSidedMaterial;

						// Add the cloned material to our array so GUI updates affect it
						allMaterials.push(doubleSidedMaterial);
					}
				});

				model.scale.set(0.1, 0.1, 0.1); // Scale down the model

				// Center the model and place bottom on ground
				const box = new THREE.Box3().setFromObject(model);
				const center = box.getCenter(new THREE.Vector3());

				// Create a wrapper group to handle the transform origin properly
				const modelWrapper = new THREE.Group();

				// Move model so its center is at origin horizontally, but bottom is at y=0
				model.position.x = -center.x;
				model.position.z = -center.z;
				model.position.y = -box.min.y; // Move up so bottom is at y=0

				// Add the model to the wrapper
				modelWrapper.add(model);

				// Store the wrapper as the arduino model for rotation control
				arduinoModel = modelWrapper;

				scene.add(modelWrapper);
				console.log('Model lodaded');
			},
			(xhr: { loaded: number; total: number }) => {
				console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
			},
			(error: any) => {
				console.error('An error happened', error);
			}
		);

		const render = () => {
			// Apply Arduino rotation to the model
			const orientation = getOrientation();
			if (
				arduinoModel &&
				arduinoSettings.enabled &&
				(orientation.heading !== 0 || orientation.pitch !== 0 || orientation.roll !== 0)
			) {
				// Convert degrees to radians and apply to model rotation
				arduinoModel.rotation.x = THREE.MathUtils.degToRad(orientation.pitch);
				arduinoModel.rotation.y = THREE.MathUtils.degToRad(orientation.heading);
				arduinoModel.rotation.z = THREE.MathUtils.degToRad(orientation.roll);
			}

			if (cameraSettings.autoFlight) {
				// Camera flight path animation (60 second loop)
				const time = (performance.now() * 0.001) % 60; // 60 second loop
				const t = time / 60; // Normalize to 0-1

				// Define waypoints for camera path (adjust these based on your building layout)
				const cameraPath = new THREE.CatmullRomCurve3(
					[
						new THREE.Vector3(15, 8, 15), // Start position - wide perspective from corner
						new THREE.Vector3(12, 6, 8), // Moving closer but still wide
						new THREE.Vector3(5, 3, 6), // Medium distance view
						new THREE.Vector3(-3, 2, 4), // Between buildings (low)
						new THREE.Vector3(-10, 7, -5), // Far back, elevated view
						new THREE.Vector3(-8, 10, -12), // High wide view from behind
						new THREE.Vector3(2, 8, -15), // Far side view, elevated
						new THREE.Vector3(10, 6, -10), // Wide angle from other side
						new THREE.Vector3(18, 5, -2), // Very wide perspective
						new THREE.Vector3(16, 7, 8), // Coming back around wide
						new THREE.Vector3(15, 8, 15) // Back to start (smooth loop)
					],
					true
				); // true = closed loop

				// Define look-at targets (what the camera should focus on)
				const lookAtPath = new THREE.CatmullRomCurve3(
					[
						new THREE.Vector3(0, 1, 0), // Center of buildings
						new THREE.Vector3(-2, 1, -1), // Different building area
						new THREE.Vector3(-1, 1, 0), // Slightly offset center
						new THREE.Vector3(-2, 1, -1), // Different building area
						new THREE.Vector3(0, 2, -2), // Behind center
						new THREE.Vector3(1, 1, 0), // Side area
						new THREE.Vector3(2, 1, 1), // Another side
						new THREE.Vector3(0, 1, 2), // Front area
						new THREE.Vector3(-1, 1, 1), // Slight offset
						new THREE.Vector3(0, 2, 0), // Back to center
						new THREE.Vector3(0, 1, 0) // Ensure smooth loop
					],
					true
				); // true = closed loop

				// Get current position and look-at point from curves
				const cameraPosition = cameraPath.getPoint(t);
				const lookAtTarget = lookAtPath.getPoint(t);

				// Update camera position and orientation
				camera.position.copy(cameraPosition);
				camera.lookAt(lookAtTarget);

				// Disable OrbitControls during flight
				controls.enabled = false;
			} else {
				// Enable manual camera control
				controls.enabled = true;
				controls.update();
			}

			// Post-processing handles the final render to screen
			post.render(scene, camera);

			requestAnimationFrame(render);
		};

		render();

		// Add keyboard event listener
		window.addEventListener('keydown', handleKeydown);

		// Initialize subtitle
		updateCurrentSubtitle();

		// Cleanup function
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<div class="app-container">
	<div class="canvas-container" bind:this={canvasContainer}></div>
	<div class="headers">
		<h1>Stuytown</h1>
		<h2>{currentSubtitle}</h2>
	</div>
	<div class="content-overlay" bind:this={contentContainer}>
		{#if allParagraphs[currentParagraphIndex]}
			<div class="paragraph">
				<LiquidGlass opacity={1} />
				<div class="paragraph-content">
					<p>{allParagraphs[currentParagraphIndex].text}</p>
				</div>
			</div>
		{/if}

		<!-- Navigation hint -->
		<div class="navigation-hint">
			<p>Use ↑↓ arrow keys to navigate</p>
			<p>{currentParagraphIndex + 1} / {allParagraphs.length}</p>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		overflow: hidden; /* Prevent scrollbars */
	}

	.app-container {
		position: relative;
		width: 100vw;
		height: 100vh;
	}

	.canvas-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.headers {
		position: absolute;
		top: 20px;
		left: 20px;
		z-index: 15;
		pointer-events: none;
	}

	h1 {
		font-family: serif;
		font-size: 50px;
		color: rgba(0, 0, 0, 0.821);
		margin: 0;
		background: url('assets/Craft_Light.jpg') no-repeat center center;
		-webkit-background-clip: text;
		background-clip: text;
	}

	h2 {
		font-family: serif;
		font-size: 24px;
		color: rgba(0, 0, 0, 0.7);
		margin: 5px 0 0 0;
		transition: all 0.3s ease;
	}

	.content-overlay {
		position: absolute;
		bottom: 20px;
		left: 20px;
		width: 600px;
		max-height: 60vh;
		z-index: 10;
		overflow: visible;
		padding: 20px 0;
	}

	.paragraph {
		position: relative;
		margin: 0 0 20px 0;
		padding: 0;
		min-height: 80px;
		border-radius: 8px;
		overflow: hidden;
		z-index: 2;
		opacity: 1;
		transform: translateY(0);
		transition: all 0.3s ease;
	}

	.navigation-hint {
		margin-top: 10px;
		padding: 10px;
		background-color: rgba(255, 255, 255, 0.2);
		color: black;
		border-radius: 4px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(5px);
	}

	.navigation-hint p {
		margin: 2px 0;
		font-size: 12px;
		text-align: center;
	}

	.paragraph-content {
		position: relative;
		z-index: 3;
		padding: 20px;
		background-color: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.paragraph p {
		margin: 0;
		color: #222;
		text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
		line-height: 1.6;
		font-size: 14px;
	}
</style>

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
	import AllContent from '$lib/AllContent.svelte';
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

	// Smooth Arduino rotation tracking
	let targetRotation = { x: 0, y: 0, z: 0 };
	let currentRotation = { x: 0, y: 0, z: 0 };
	let lastSignificantRotation = { x: 0, y: 0, z: 0 };

	// Content navigation variables
	let contentContainer: HTMLDivElement;
	let currentSubtitle = 'Introduction';
	let currentParagraphIndex = 0;

	// Content sections data - now just metadata for navigation
	const contentSections = [
		{ title: 'Introduction', count: 3 },
		{ title: 'History', count: 3 },
		{ title: 'Architecture', count: 3 },
		{ title: 'Community', count: 3 }
	];

	// Create navigation array
	const allCards = contentSections.flatMap((section, sectionIndex) =>
		Array.from({ length: section.count }, (_, cardIndex) => ({
			sectionTitle: section.title,
			cardIndex: sectionIndex * 3 + cardIndex
		}))
	);

	let scrollY = 0;

	// Handle keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowUp' && currentParagraphIndex > 0) {
			currentParagraphIndex--;
			updateCurrentSubtitle();
		} else if (event.key === 'ArrowDown' && currentParagraphIndex < allCards.length - 1) {
			currentParagraphIndex++;
			updateCurrentSubtitle();
		}
	}

	// Update subtitle based on current paragraph
	function updateCurrentSubtitle() {
		if (currentParagraphIndex >= 0 && currentParagraphIndex < allCards.length) {
			currentSubtitle = allCards[currentParagraphIndex].sectionTitle;
		}
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
			// Apply Arduino rotation to the model with smooth interpolation
			const orientation = getOrientation();
			if (
				arduinoModel &&
				arduinoSettings.enabled &&
				(orientation.heading !== 0 || orientation.pitch !== 0 || orientation.roll !== 0)
			) {
				// Movement threshold - need at least 5 degrees of movement to update target
				const movementThreshold = 5.0;

				// Check if there's significant movement from last recorded position
				const pitchDiff = Math.abs(orientation.pitch - lastSignificantRotation.x);
				const headingDiff = Math.abs(orientation.heading - lastSignificantRotation.y);
				const rollDiff = Math.abs(orientation.roll - lastSignificantRotation.z);

				// If movement is significant enough, update target rotation
				if (
					pitchDiff > movementThreshold ||
					headingDiff > movementThreshold ||
					rollDiff > movementThreshold
				) {
					targetRotation.x = orientation.pitch;
					targetRotation.y = orientation.heading;
					targetRotation.z = orientation.roll;

					// Update last significant rotation
					lastSignificantRotation.x = orientation.pitch;
					lastSignificantRotation.y = orientation.heading;
					lastSignificantRotation.z = orientation.roll;
				}

				// Smoothly interpolate current rotation towards target (lerp factor controls smoothness)
				const lerpFactor = 0.05; // Lower = smoother, higher = more responsive
				currentRotation.x += (targetRotation.x - currentRotation.x) * lerpFactor;
				currentRotation.y += (targetRotation.y - currentRotation.y) * lerpFactor;
				currentRotation.z += (targetRotation.z - currentRotation.z) * lerpFactor;

				// Apply smooth rotation to model
				arduinoModel.rotation.x = THREE.MathUtils.degToRad(currentRotation.x);
				arduinoModel.rotation.y = THREE.MathUtils.degToRad(currentRotation.y);
				arduinoModel.rotation.z = THREE.MathUtils.degToRad(currentRotation.z);
			}

			if (cameraSettings.autoFlight) {
				// Camera flight path animation (60 second loop)
				const time = (performance.now() * 0.001) % 60; // 60 second loop
				const t = time / 60; // Normalize to 0-1

				// Scale factor for camera distance when Arduino is connected
				const zoomScale = arduinoSettings.enabled ? 2.5 : 1.0; // Zoom out by 2.5x when Arduino connected

				// Define waypoints for camera path (adjust these based on your building layout)
				const baseCameraPoints = [
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
				];

				// Scale camera points based on Arduino connection
				const scaledCameraPoints = baseCameraPoints.map(
					(point) =>
						new THREE.Vector3(
							point.x * zoomScale,
							point.y * Math.max(1.2, zoomScale * 0.8), // Keep some elevation variation
							point.z * zoomScale
						)
				);

				const cameraPath = new THREE.CatmullRomCurve3(scaledCameraPoints, true); // true = closed loop

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

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Modak&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="app-container">
	<div class="canvas-container" bind:this={canvasContainer}></div>
	<div class="headers">
		<h1>Stuytown</h1>
		<h2>{currentSubtitle}</h2>
	</div>
	<div class="content-container" bind:this={contentContainer}>
		{#if allCards[currentParagraphIndex]}
			<div class="paragraph">
				<LiquidGlass opacity={1} />
				<div class="paragraph-content">
					<AllContent cardIndex={currentParagraphIndex} />
				</div>
			</div>
		{/if}

		<!-- Navigation hint -->
		<div class="navigation-hint">
			<LiquidGlass opacity={1} />
			<div class="navigation-content">
				<p>Use ↑↓ arrow keys to navigate</p>
				<p>{currentParagraphIndex + 1} / {allCards.length}</p>
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		overflow: hidden; /* Prevent scrollbars */
		font-family: 'Fira Sans', sans-serif;
		font-weight: 400;
		font-style: normal;
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
		left: calc(50% - 300px);
		z-index: 15;
		text-align: center;
		width: 600px;
	}

	h1 {
		font-family: 'Modak', system-ui;
		font-weight: 400;
		line-height: 40px;
		font-style: normal;
		letter-spacing: 8px;
		font-size: 55px;
		color: #2e58ff;
		-webkit-text-stroke: 2px black;
		margin: 0;
		background: url('assets/Craft_Light.jpg') no-repeat center center;
		-webkit-background-clip: text;
		background-clip: text;
		margin: 0px;
	}

	h2 {
		font-family: 'Modak', system-ui;
		letter-spacing: -1px;
		font-size: 35px;
		-webkit-text-stroke: 2px black;
		color: #fff;
		margin: 5px 0 0 0;
		transition: all 0.3s ease;
	}

	.content-container {
		position: absolute;
		bottom: 20px;
		left: calc(50% - 300px);
		width: 600px;
		max-height: 60vh;
		z-index: 10;
		overflow: visible;
		padding: 20px 0 0 0;
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
		color: black;
		border-radius: 8px;
		overflow: hidden;
		z-index: 2;
		opacity: 1;
		transform: translateY(0);
		transition: all 0.3s ease;
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

	.navigation-content {
		position: relative;
		z-index: 3;
		padding: 20px;
		background-color: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}
</style>

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
	import GUI from 'lil-gui';

	// Canvas element reference
	let canvasContainer: HTMLDivElement;
	let camera: THREE.PerspectiveCamera;
	let renderer: THREE.WebGLRenderer;
	let scene: THREE.Scene;
	let controls: OrbitControls;
	const bgColor = 0xffffff;

	onMount(() => {
		scene = new THREE.Scene();

		// Axes helper
		// const axesHelper = new THREE.AxesHelper(5);
		// scene.add(axesHelper);

		// Camera
		camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
		camera.position.set(5, 5, 5);

		// Renderer
		renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			preserveDrawingBuffer: false,
			powerPreference: 'high-performance'
		});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(bgColor);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		canvasContainer.appendChild(renderer.domElement);

		// Debug GUI
		const gui = new GUI();
		const materialFolder = gui.addFolder('Material');
		materialFolder.open();

		// Lighting controls folder
		const lightingFolder = gui.addFolder('Lighting');
		lightingFolder.open();

		// Shaders
		const post = new Post(renderer);
		post.setSize(window.innerWidth, window.innerHeight);

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
		postController['paper'].setValue('Craft rough');
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
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			// Also update post-processing size
			post.setSize(window.innerWidth, window.innerHeight);
		});

		const geometry = new THREE.BoxGeometry();
		const cube = new THREE.Mesh(geometry, material);
		scene.add(cube);

		// Load GLTF
		const loader = new GLTFLoader();
		loader.load(
			'stuy-town.gltf',
			(gltf: { scene: THREE.Object3D<THREE.Object3DEventMap> }) => {
				console.log('Model loaded successfully');
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
				const size = box.getSize(new THREE.Vector3());

				// Move model so its center is at origin horizontally, but bottom is at y=0
				model.position.x = -center.x;
				model.position.z = -center.z;
				model.position.y = -box.min.y; // Move up so bottom is at y=0

				scene.add(model);
				console.log('Model placed successfully?');
				console.log('Model size:', size);
				console.log('Model center:', center);
			},
			(xhr: { loaded: number; total: number }) => {
				console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
			},
			(error: any) => {
				console.error('An error happened', error);
			}
		);

		const render = () => {
			cube.rotation.x += 0.01;
			cube.rotation.y += 0.01;
			controls.update();

			// // Animate noisiness on a loop (repeats every 4 seconds)
			// const time = performance.now() * 0.001; // Convert to seconds
			// const baseNoisiness = 0.01; // Base noisiness value
			// const wiggleAmount = 0.02; // Larger wiggle amount for more visible effect
			// const wiggleSpeed = Math.PI * 1; // Completes cycle every 4 seconds (2π / 4 = π/2)
			// const noisinessValue = baseNoisiness + Math.sin(time * wiggleSpeed) * wiggleAmount;

			// // Also animate edge noisiness with a different phase for more organic effect
			// const baseEdgeNoisiness = 0.01;
			// const edgeWiggleAmount = 0.006;
			// const edgeNoisinessValue =
			// 	baseEdgeNoisiness + Math.sin(time * wiggleSpeed + Math.PI / 3) * edgeWiggleAmount;

			// // Update the post-processing uniforms
			// if (post && post.renderPass && post.renderPass.shader) {
			// 	post.renderPass.shader.uniforms.noisiness.value = noisinessValue;
			// 	// post.renderPass.shader.uniforms.edgeNoisiness.value = edgeNoisinessValue;
			// 	console.log(
			// 		'Animating noisiness:',
			// 		noisinessValue.toFixed(4),
			// 		'edgeNoisiness:',
			// 		edgeNoisinessValue.toFixed(4)
			// 	);
			// }

			// Post-processing handles the final render to screen
			post.render(scene, camera);

			requestAnimationFrame(render);
		};

		render();
	});
</script>

<div bind:this={canvasContainer}></div>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<style>
	:global(body) {
		margin: 0;
		overflow: hidden; /* Prevent scrollbars */
	}
</style>

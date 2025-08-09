<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	// @ts-ignore
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
	// @ts-ignore
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
	// import post from lib/post.js
	import { Post } from '$lib/post.js';
	import { Material, generateParams } from '$lib/Material';
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
		const axesHelper = new THREE.AxesHelper(5);
		scene.add(axesHelper);

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

		// Shaders
		const post = new Post(renderer);
		post.setSize(window.innerWidth, window.innerHeight);

		const material = new Material({
			color: 0x808080,
			roughness: 0.2,
			metalness: 0.1,
			side: THREE.DoubleSide
		});
		generateParams(materialFolder, material);
		const postController = post.generateParams(materialFolder);
		postController['paper'].setValue('Parchment');
		const envMapController = generateEnvParams(materialFolder, material);
		envMapController.setValue('bridge');

		// Controls
		controls = new OrbitControls(camera, renderer.domElement);
		// controls.enableDamping = true;
		controls.screenSpacePanning = true;

		// Lighting
		const light = new THREE.AmbientLight(0xffffff, 5); // soft white light
		scene.add(light);

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

			// // Animate noiseScale on a loop (repeats every 240 frames / ~4 seconds at 60fps)
			// const frameCount = performance.now() * 0.01; // Use performance.now for smooth animation
			// const noiseScaleValue = 0.5 + 0.3 * Math.sin(frameCount * 0.05); // Oscillates between 0.2 and 0.8

			// // Update the post-processing noiseScale uniform
			// if (post && post.renderPass && post.renderPass.shader) {
			// 	post.renderPass.shader.uniforms.noiseScale.value = noiseScaleValue;
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

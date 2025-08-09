import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  PCFSoftShadowMap,
} from "three";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const canvas = document.querySelector("canvas");
if (!canvas) {
  throw new Error("Canvas element not found.");
}

const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
  canvas,
  preserveDrawingBuffer: false,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xffffff, 1);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;

const scene = new Scene();
const camera = new PerspectiveCamera(60, 1, 0.1, 100);
camera.position.set(5, 5, 5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;

const resizeFns: Array<() => void> = [];

function onResize(fn: () => void) {
  resizeFns.push(fn);
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  for (const fn of resizeFns) {
    fn();
  }
}

window.addEventListener("resize", resize);

export { renderer, scene, camera, resize, onResize };
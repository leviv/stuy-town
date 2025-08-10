import { MeshStandardMaterial } from "three";
import { GUI } from 'lil-gui';

const Material = MeshStandardMaterial;

function generateParams(gui: GUI, material: MeshStandardMaterial) {
  gui
    .add(material, "roughness", 0, 1)
    .onChange((v: number) => (material.roughness = v));
  gui
    .add(material, "metalness", 0, 1)
    .onChange((v: number) => (material.metalness = v));
}

export { Material, generateParams };
import { MeshStandardMaterial } from "three";

const Material = MeshStandardMaterial;

function generateParams(gui, material) {
  gui
    .add(material, "roughness", 0, 1)
    .onChange((v: number) => (material.roughness = v));
  gui
    .add(material, "metalness", 0, 1)
    .onChange((v: number) => (material.metalness = v));
}

export { Material, generateParams };
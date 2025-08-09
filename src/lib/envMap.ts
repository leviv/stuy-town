// Manages cube maps.

import {
  CubeTextureLoader,
  CubeTexture,
  MeshStandardMaterial,
} from "three";
import { GUI } from 'lil-gui';

const cubeTexLoader = new CubeTextureLoader();
cubeTexLoader.setPath("/assets/");

type Environment = {
  file: string;
  extension: string;
  texture: CubeTexture | null; // Replace 'any' with the specific type if known
};

const environments: Record<string, Environment> = {
  bridge: { file: "", extension: "jpg", texture: null },
  park: { file: "park_", extension: "jpg", texture: null },
  pisa: { file: "pisa_", extension: "png", texture: null },
};

function getTexture(name: string) {
  if (!environments[name].texture) {
    const f = environments[name].file;
    const ext = environments[name].extension;
    environments[name].texture = cubeTexLoader.load([
      `${f}posx.${ext}`,
      `${f}negx.${ext}`,
      `${f}posy.${ext}`,
      `${f}negy.${ext}`,
      `${f}posz.${ext}`,
      `${f}negz.${ext}`,
    ]);
    // environments[name].texture.encoding = 'sRGBEncoding';
  }
  return environments[name].texture;
}

const params = {
  environment: "bridge",
};
function generateParams(gui: GUI, material: MeshStandardMaterial) {
  return gui
    .add(params, "environment", Object.keys(environments))
    .onChange((v: string) => {
      material.envMap = getTexture(v);
    });
}

export { generateParams };
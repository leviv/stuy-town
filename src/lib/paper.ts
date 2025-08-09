import { RepeatWrapping, Texture, TextureLoader, ShaderMaterial } from "three";
import { GUI } from 'lil-gui';

const loader = new TextureLoader();

type Paper = {
  file: string;
  texture: Texture | null;
  promise: Promise<void> | null;
};
const papers: Record<string, Paper> = {
  "Craft light": { file: "Craft_Light.jpg", texture: null, promise: null },
  "Craft rough": { file: "Craft_Rough.jpg", texture: null, promise: null },
  "Watercolor cold press": {
    file: "Watercolor_ColdPress.jpg",
    texture: null,
    promise: null,
  },
  Parchment: { file: "Parchment.jpg", texture: null, promise: null },
};

async function getTexture(name: string) {
  if (papers[name].texture) {
    return papers[name].texture;
  }
  if (!papers[name].promise) {
    papers[name].promise = new Promise((resolve, reject) => {
      loader.load(
        `/assets/${papers[name].file}`,
        (res) => {
          res.wrapS = res.wrapT = RepeatWrapping;
          papers[name].texture = res;
          resolve();
        },
        undefined, // onProgress callback
        (error) => {
          console.error(`Failed to load texture: ${papers[name].file}`, error);
          reject(error);
        }
      );
    });
  }
  await papers[name].promise;
  return papers[name].texture;
}

const params = {
  paper: "Craft light",
};
function generateParams(gui: GUI, material: ShaderMaterial) {
  return gui.add(params, "paper", Object.keys(papers)).onChange(async (v: string) => {
    material.uniforms.paperTexture.value = await getTexture(v);
  });
}
export { generateParams };
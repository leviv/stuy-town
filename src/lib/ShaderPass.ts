import {
  OrthographicCamera,
  Scene,
  Mesh,
  PlaneGeometry,
  RawShaderMaterial,
  WebGLRenderer,
  WebGLRenderTarget,
Texture
} from "three";
import { getFBO } from "./FBO";

class ShaderPass {
  shader: RawShaderMaterial;
  private renderer: WebGLRenderer;
  private orthoScene: Scene;
  private orthoCamera: OrthographicCamera;
  private orthoQuad: Mesh;
  private fbo: WebGLRenderTarget;
  public texture: Texture;

  constructor(renderer: WebGLRenderer, shader: RawShaderMaterial, options = {}) {
    this.renderer = renderer;
    this.shader = shader;
    this.orthoScene = new Scene();
    this.fbo = getFBO(1, 1, options);
    this.orthoCamera = new OrthographicCamera(
      1 / -2,
      1 / 2,
      1 / 2,
      1 / -2,
      0.00001,
      1000
    );
    this.orthoQuad = new Mesh(new PlaneGeometry(1, 1), this.shader);
    this.orthoQuad.scale.set(1, 1, 1);
    this.orthoScene.add(this.orthoQuad);
    this.texture = this.fbo.texture;
  }

  render(final: boolean) {
    if (!final) {
      this.renderer.setRenderTarget(this.fbo);
    }
    this.renderer.render(this.orthoScene, this.orthoCamera);
    this.renderer.setRenderTarget(null);
  }

  setSize(width: number, height: number) {
    this.fbo.setSize(width, height);
    this.orthoQuad.scale.set(width, height, 1);
    this.orthoCamera.left = -width / 2;
    this.orthoCamera.right = width / 2;
    this.orthoCamera.top = height / 2;
    this.orthoCamera.bottom = -height / 2;
    this.orthoCamera.updateProjectionMatrix();
  }
}

export { ShaderPass };
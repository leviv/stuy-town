import {
  Color,
  DoubleSide,
  MeshNormalMaterial,
  RawShaderMaterial,
  TextureLoader,
  RepeatWrapping,
  WebGLRenderer,
  WebGLRenderTarget,
  Scene,
  Camera,
} from "three";
import { ShaderPass } from "./ShaderPass";
import { getFBO } from "./FBO";
import { shader as orthoVs } from "./shaders/ortho-vs.js";
import { shader as sobel } from "./shaders/sobel.js";
import { shader as aastep } from "./shaders/aastep.js";
import { shader as luma } from "./shaders/luma.js";
import { generateParams as generatePaperParams } from "./paper";
import { shader as darken } from "./shaders/blend-darken.js";
import { Controller, GUI } from 'lil-gui';

const normalMat = new MeshNormalMaterial({ side: DoubleSide });

const loader = new TextureLoader();
const noiseTexture = loader.load("/assets/noise1.png");
noiseTexture.wrapS = noiseTexture.wrapT = RepeatWrapping;

const fragmentShader = `precision highp float;

uniform sampler2D colorTexture;
uniform sampler2D normalTexture;
uniform sampler2D paperTexture;
uniform sampler2D noiseTexture;
uniform vec3 inkColor;
uniform float noiseScale;
uniform float scale;
uniform float thickness;
uniform float noisiness;
uniform float angle;
uniform float contour;
uniform float divergence;

varying vec2 vUv;

${sobel}

${luma}

${aastep}

${darken}

#define TAU 6.28318530718

#define LEVELS 10
#define fLEVELS float(LEVELS)

// Custom round function for older GLSL
float roundFloat(float x) {
  return floor(x + 0.5);
}

float sampleSrc(in sampler2D src, in vec2 uv) {
  vec4 color = texture2D(src, uv);
  float l = luma(color.rgb);
  return l;
}

float sampleStep(in sampler2D src, in vec2 uv, in float level) {
  float l = sampleSrc(src, uv);
  l = roundFloat(l*fLEVELS) / fLEVELS;
  return l > level ? 1. : 0.;
}

float findBorder(in sampler2D src, in vec2 uv, in vec2 resolution, in float level){
	float x = thickness / resolution.x;
	float y = thickness / resolution.y;
	float horizEdge = 0.;
	horizEdge -= sampleStep(src, vec2( uv.x - x, uv.y - y ), level ) * 1.0;
	horizEdge -= sampleStep(src, vec2( uv.x - x, uv.y     ), level ) * 2.0;
	horizEdge -= sampleStep(src, vec2( uv.x - x, uv.y + y ), level ) * 1.0;
	horizEdge += sampleStep(src, vec2( uv.x + x, uv.y - y ), level ) * 1.0;
	horizEdge += sampleStep(src, vec2( uv.x + x, uv.y     ), level ) * 2.0;
	horizEdge += sampleStep(src, vec2( uv.x + x, uv.y + y ), level ) * 1.0;
	float vertEdge = 0.;
	vertEdge -= sampleStep(src, vec2( uv.x - x, uv.y - y ), level ) * 1.0;
	vertEdge -= sampleStep(src, vec2( uv.x    , uv.y - y ), level ) * 2.0;
	vertEdge -= sampleStep(src, vec2( uv.x + x, uv.y - y ), level ) * 1.0;
	vertEdge += sampleStep(src, vec2( uv.x - x, uv.y + y ), level ) * 1.0;
	vertEdge += sampleStep(src, vec2( uv.x    , uv.y + y ), level ) * 2.0;
	vertEdge += sampleStep(src, vec2( uv.x + x, uv.y + y ), level ) * 1.0;
	float edge = sqrt((horizEdge * horizEdge) + (vertEdge * vertEdge));
	return edge;
}

float simplex(in vec3 v) {
  return 2. * texture2D(noiseTexture, v.xy/32.).r - 1.;
}

float fbm3(vec3 v) {
  float result = simplex(v);
  result += simplex(v * 2.) / 2.;
  result += simplex(v * 4.) / 4.;
  result /= (1. + 1./2. + 1./4.);
  return result;
}

float fbm5(vec3 v) {
  float result = simplex(v);
  result += simplex(v * 2.) / 2.;
  result += simplex(v * 4.) / 4.;
  result += simplex(v * 8.) / 8.;
  result += simplex(v * 16.) / 16.;
  result /= (1. + 1./2. + 1./4. + 1./8. + 1./16.);
  return result;
}

float texh(in vec2 p, in float lum) {
  // Simplified version without derivatives
  float e = thickness * 0.01; // Use a fixed edge threshold
  
  if (lum < 0.5) {
    float v = abs(mod(p.y+1., 16.0));
    if (v < e) {
      return 0.;
    }
  }

  if (lum < 0.25) {
    float v = abs(mod(p.y, 8.0));
    if (v < e) {
      return 0.;
    }
  }

 return 1.;
}

float lines( in float l, in vec2 fragCoord, in vec2 resolution, in float thickness){
  vec2 center = vec2(resolution.x/2., resolution.y/2.);
  vec2 uv = fragCoord.xy * resolution;

  float c = (.5 + .5 * sin(uv.x*.5));
  float f = (c+thickness)*l;
  // Use a fixed edge threshold instead of derivatives
  float e = 0.01; 
  f = smoothstep(.5-e, .5+e, f);
  return f;
}


void main() {
  // Use fixed texture size since textureSize() is not available in older GLSL
  vec2 size = vec2(1024.0, 1024.0); // You may need to pass this as a uniform
  
  float hatch = 0.;
  float ss = noiseScale * 1.;
  vec2 offset = noisiness * vec2(fbm3(vec3(ss*vUv,1.)), fbm3(vec3(ss*vUv.yx,1.)));
  vec2 uv = vUv + offset;

  float l = luma(texture2D(colorTexture, uv).rgb);
  l = roundFloat(l * float(LEVELS)) / float(LEVELS);
  //l *= 2.;
  hatch = 1.;

  float normalEdge = length(sobel(normalTexture, uv, size, 3. * contour));
  normalEdge = 1.-aastep(.5, normalEdge);
  l *= normalEdge;
  l *= 2.;
  l = clamp(l, 0., 1.);

  for(int i=0; i<LEVELS; i++) {
    float f = float(i)/fLEVELS;
    float n = float(i+1)/fLEVELS;

    float normalEdge = length(sobel(normalTexture, uv, size, 3. * thickness));
    normalEdge = aastep(.5, normalEdge);
  
    if(l<=f) {
      float ss = noiseScale * mix(1., 4., f);
      vec2 offset = noisiness * vec2(fbm3(vec3(ss*vUv,1.)), fbm3(vec3(ss*vUv.yx,1.)));
      vec2 uv = vUv + offset;
      
      float a = angle + divergence * mix(0., 3.2 * TAU, f);
      float s = sin(a);
      float c = cos(a);
      mat2 rot = mat2(c, -s, s, c);
    
      uv = rot * (uv - .5) + .5;

      float w = l/f;
      float v = lines(w, scale * mix(5.,1., f) * uv, size, w*(1.-thickness));
      hatch *= v;
    }
  }
  
  vec4 paper = texture2D(paperTexture, .00025 * vUv*size);
  gl_FragColor.rgb = blendDarken(paper.rgb, inkColor/255., 1.-hatch);
  //gl_FragColor.rgb = blendDarken(gl_FragColor.rgb, inkColor/255., 1.-normalEdge);
  gl_FragColor.a = 1.;
}
`;

class Post {
  private renderer: WebGLRenderer;
  private colorFBO: WebGLRenderTarget;
  private normalFBO: WebGLRenderTarget;
  private params: {
    scale?: number;
    thickness?: number;
    noiseScale?: number;
    noisiness?: number;
    divergence?: number;
    angle?: number;
    contour?: number;
    inkColor?: Color;
    paper?: boolean;
  };
  private renderPass: ShaderPass;

  constructor(renderer: WebGLRenderer) {
    this.renderer = renderer;
    this.colorFBO = getFBO(1, 1);
    this.normalFBO = getFBO(1, 1);
    this.params = {
      scale: 0.5,
      noiseScale: 0.72,
      angle: 2,
      divergence: 1,
      thickness: 0.72,
      contour: 1.2,
      noisiness: 0.007,
      inkColor: new Color(68, 107, 147),
    };
    const shader = new RawShaderMaterial({
      uniforms: {
        paperTexture: { value: null },
        colorTexture: { value: this.colorFBO.texture },
        normalTexture: { value: this.normalFBO.texture },
        noiseTexture: { value: noiseTexture },
        inkColor: { value: this.params.inkColor },
        scale: { value: this.params.scale },
        divergence: { value: this.params.divergence },
        thickness: { value: this.params.thickness },
        contour: { value: this.params.contour },
        noiseScale: { value: this.params.noiseScale },
        noisiness: { value: this.params.noisiness },
        angle: { value: this.params.angle },
      },
      vertexShader: orthoVs,
      fragmentShader,
    });
    this.renderPass = new ShaderPass(renderer, shader);
  }

  setSize(w: number, h: number) {
    this.normalFBO.setSize(w, h);
    this.colorFBO.setSize(w, h);
    this.renderPass.setSize(w, h);
  }

  render(scene: Scene, camera: Camera) {
    this.renderer.setRenderTarget(this.colorFBO);
    this.renderer.render(scene, camera);
    this.renderer.setRenderTarget(null);
    scene.overrideMaterial = normalMat;
    this.renderer.setRenderTarget(this.normalFBO);
    this.renderer.render(scene, camera);
    this.renderer.setRenderTarget(null);
    scene.overrideMaterial = null;
    this.renderPass.render(true);
  }

  generateParams(gui: GUI) {
    const controllers: Record<string, Controller> = {};
    controllers["scale"] = gui
      .add(this.params, "scale", 0.1, 2)
      .onChange(async (v: number) => {
        this.renderPass.shader.uniforms.scale.value = v;
      });
    controllers["thickness"] = gui
      .add(this.params, "thickness", 0, 1)
      .onChange(async (v: number) => {
        this.renderPass.shader.uniforms.thickness.value = v;
      });
    controllers["noiseScale"] = gui
      .add(this.params, "noiseScale", 0.1, 1)
      .onChange(async (v: number) => {
        this.renderPass.shader.uniforms.noiseScale.value = v;
      });
    controllers["noisiness"] = gui
      .add(this.params, "noisiness", 0, 0.02)
      .onChange(async (v: number) => {
        this.renderPass.shader.uniforms.noisiness.value = v;
      });
    controllers["divergence"] = gui
      .add(this.params, "divergence", 0, 1)
      .onChange(async (v: number) => {
        this.renderPass.shader.uniforms.divergence.value = v;
      });
    controllers["angle"] = gui
      .add(this.params, "angle", 0, Math.PI)
      .onChange(async (v: number) => {
        this.renderPass.shader.uniforms.angle.value = v;
      });
    controllers["contour"] = gui
      .add(this.params, "contour", 0, 10)
      .onChange(async (v: number) => {
        this.renderPass.shader.uniforms.contour.value = v;
      });
    controllers["inkColor"] = gui
      .addColor(this.params, "inkColor")
      .onChange(async (v: Color) => {
        this.renderPass.shader.uniforms.inkColor.value.copy(v);
      });
    controllers["paper"] = generatePaperParams(gui, this.renderPass.shader);
    return controllers;
  }
}

export { Post };
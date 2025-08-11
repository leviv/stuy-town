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
const noiseTexture = loader.load("assets/noise1.png");
noiseTexture.wrapS = noiseTexture.wrapT = RepeatWrapping;

const fragmentShader = `precision highp float;

uniform sampler2D colorTexture;
uniform sampler2D normalTexture;
uniform sampler2D paperTexture;
uniform sampler2D noiseTexture;
uniform vec3 inkColor;
uniform vec3 edgeColor;
uniform float noiseScale;
uniform float scale;
uniform float thickness;
uniform float edgeThickness;
uniform float noisiness;
uniform float edgeNoisiness;
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

// Manual derivative calculation for older GLSL
vec2 getDerivative(vec2 uv, vec2 resolution) {
  float eps = 1.0 / min(resolution.x, resolution.y);
  return vec2(eps, 0.0);
}

float texh(in vec2 p, in float lum) {
  vec2 resolution = vec2(1024.0, 1024.0); // Fixed resolution
  vec2 deriv = getDerivative(p, resolution);
  float e = thickness * max(deriv.x, deriv.y) * 10.0; // Use manual derivative
  
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
  
  // Calculate derivative manually for older GLSL
  vec2 deriv = getDerivative(fragCoord, resolution);
  float e = 1. * length(deriv);
  
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
  
  vec4 paper = texture2D(paperTexture, .00025 * vUv * size);
  
  // Apply hatching with ink color
  vec3 hatchedColor = blendDarken(paper.rgb, inkColor/255., 1.-hatch);
  
  // Apply edge detection with edge color using edgeThickness and separate edgeNoisiness
  float edgeSs = noiseScale * 1.;
  vec2 edgeOffset = edgeNoisiness * vec2(fbm3(vec3(edgeSs*vUv,1.)), fbm3(vec3(edgeSs*vUv.yx,1.)));
  vec2 edgeUv = vUv + edgeOffset;
  
  float finalNormalEdge = length(sobel(normalTexture, edgeUv, size, 3. * edgeThickness));
  finalNormalEdge = 1.-aastep(.5, finalNormalEdge);
  
  // Blend the edge color over the hatched result
  gl_FragColor.rgb = blendDarken(hatchedColor, edgeColor/255., 1.-finalNormalEdge);
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
    edgeThickness?: number;
    noiseScale?: number;
    noisiness?: number;
    edgeNoisiness?: number;
    divergence?: number;
    angle?: number;
    contour?: number;
    inkColor?: Color;
    edgeColor?: Color;
    paper?: boolean;
  };
  renderPass: ShaderPass;

  constructor(renderer: WebGLRenderer) {
    this.renderer = renderer;
    this.colorFBO = getFBO(1, 1);
    this.normalFBO = getFBO(1, 1);
    this.params = {
      scale: 1.5,
      noiseScale: 0.45,
      angle: 2.7,
      divergence: 1,
      thickness: 0.8,
      edgeThickness: .3,
      contour: 2.2,
      noisiness: 0.011,
      edgeNoisiness: 0.01,
      inkColor: new Color(68, 107, 147),
      edgeColor: new Color(0, 0, 0), // Black edges by default
    };
    const shader = new RawShaderMaterial({
      uniforms: {
        paperTexture: { value: null },
        colorTexture: { value: this.colorFBO.texture },
        normalTexture: { value: this.normalFBO.texture },
        noiseTexture: { value: noiseTexture },
        inkColor: { value: this.params.inkColor },
        edgeColor: { value: this.params.edgeColor },
        scale: { value: this.params.scale },
        divergence: { value: this.params.divergence },
        thickness: { value: this.params.thickness },
        edgeThickness: { value: this.params.edgeThickness },
        contour: { value: this.params.contour },
        noiseScale: { value: this.params.noiseScale },
        noisiness: { value: this.params.noisiness },
        edgeNoisiness: { value: this.params.edgeNoisiness },
        angle: { value: this.params.angle },
      },
      vertexShader: orthoVs,
      fragmentShader,
    });
    this.renderPass = new ShaderPass(renderer, shader);
    console.log("inkColor:", this.params.inkColor);
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
    controllers["edgeThickness"] = gui
      .add(this.params, "edgeThickness", 0, 10)
      .onChange(async (v: number) => {
        this.renderPass.shader.uniforms.edgeThickness.value = v;
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
    controllers["edgeNoisiness"] = gui
      .add(this.params, "edgeNoisiness", 0, 0.02)
      .onChange(async (v: number) => {
        this.renderPass.shader.uniforms.edgeNoisiness.value = v;
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
      .onChange(async (v: { r: number; g: number; b: number }) => {
        console.log("inkColor change:", v);
        // lil-gui provides RGB values in 0-1 range, convert to 0-255 range
        this.renderPass.shader.uniforms.inkColor.value.setRGB(v.r * 255, v.g * 255, v.b * 255);
      });
    controllers["edgeColor"] = gui
      .addColor(this.params, "edgeColor")
      .onChange(async (v: { r: number; g: number; b: number }) => {
        console.log("edgeColor change:", v);
        // lil-gui provides RGB values in 0-1 range, convert to 0-255 range
        this.renderPass.shader.uniforms.edgeColor.value.setRGB(v.r * 255, v.g * 255, v.b * 255);
      });
    controllers["paper"] = generatePaperParams(gui, this.renderPass.shader);
    return controllers;
  }
}

export { Post };
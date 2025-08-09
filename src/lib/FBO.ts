import {
  WebGLRenderTarget,
  ClampToEdgeWrapping,
  LinearFilter,
  RGBAFormat,
  UnsignedByteType,
  type MinificationTextureFilter,
  type MagnificationTextureFilter,
  type PixelFormat,
  type TextureDataType,
  type Wrapping,
} from "three";

type FBOOptions = {
  wrapS?: Wrapping;
  wrapT?: Wrapping;
  minFilter?: MinificationTextureFilter;
  magFilter?: MagnificationTextureFilter;
  format?: PixelFormat;
  type?: TextureDataType;
  stencilBuffer?: boolean;
  depthBuffer?: boolean;
};

function getFBO(w: number, h: number, options: FBOOptions = {}): WebGLRenderTarget {
  const fbo = new WebGLRenderTarget(w, h, {
    wrapS: options.wrapS  ? options.wrapS : ClampToEdgeWrapping,
    wrapT: options.wrapT || ClampToEdgeWrapping,
    minFilter: options.minFilter || LinearFilter,
    magFilter: options.magFilter || LinearFilter,
    format: options.format || RGBAFormat,
    type: options.type || UnsignedByteType,
    stencilBuffer: options.stencilBuffer || false,
    depthBuffer: options.depthBuffer || true,
  });
  return fbo;
}

export { getFBO };
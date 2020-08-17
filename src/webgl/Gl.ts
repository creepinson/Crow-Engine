import { GlBlendFunc, GlBlendFuncResolver } from './enum/GlBlendFunc';
import { GlCullFace, GlCullFaceResolver } from './enum/GlCullFace';
import { GlConstants } from './GlConstants';
import { vec2, vec4, ReadonlyVec2, ReadonlyVec4 } from 'gl-matrix';
import { LogLevel } from '../utility/log/LogLevel';
import { GlTexture2D } from './texture/GlTexture2D';
import { GlInternalFormat } from './enum/GlInternalFormat';
import { Engine } from '../core/Engine';
import { GlCubeMapTexture } from './texture/GlCubeMapTexture';
import { GlTexture2DArray } from './texture/GlTexture2DArray';
import { GlPerformance, GlPerformanceResolver } from './enum/GlPerformance';
import { GlMinificationFilter } from './enum/GlMinificationFilter';
import { GlMagnificationFilter } from './enum/GlMagnificationFIlter';
import { GlFormat } from './enum/GlFormat';
import { GlTextureDataType } from './enum/GlTextureDataType';
import { GlBlendEquation, GlBlendEquationResolver } from './enum/GlBlendEquation';

export class Gl {

    private static context: WebGL2RenderingContext;
    private static canvas: HTMLCanvasElement;

    private constructor() { }

    public static initialize(canvas: HTMLCanvasElement): void {
        Gl.context = canvas.getContext('webgl2', { depth: false, antialias: false });
        if (!Gl.context) {
            throw new Error('WebGL 2.0 isn\'t supported in your browser');
        }
        Gl.canvas = canvas;
        this.initializeUnsafe();
        Engine.getLog().logString(LogLevel.INFO_1, 'WebGL initialized');
    }

    private static initializeUnsafe(): void {
        GlConstants.initialize();
        if (!GlConstants.COLOR_BUFFER_FLOAT_ENABLED) {
            throw new Error();
        }
        this.setGlDefaultStates();
        this.createBlackTexture2D();
        this.createWhiteTexture2D();
        this.createBlackTexture2DArray();
        this.createBlackCubeMapTexture();
    }

    private static setGlDefaultStates(): void {
        Gl.gl.pixelStorei(Gl.gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, Gl.gl.NONE);
        Gl.setEnableCullFace(true);
        Gl.setCullFace(GlCullFace.BACK);
        Gl.setEnableBlend(true);
        Gl.setBlendFunc(GlBlendFunc.SRC_ALPHA, GlBlendFunc.ONE_MINUS_SRC_ALPHA);
        Gl.setEnableDepthTest(true);
    }

    private static createBlackTexture2D(): void {
        const texture = new GlTexture2D();
        texture.allocate(GlInternalFormat.RGBA8, vec2.fromValues(1, 1), false);
        texture.setMinificationFilter(GlMinificationFilter.NEAREST);
        texture.setMagnificationFilter(GlMagnificationFilter.NEAREST);
        Engine.getParameters().set(Engine.BLACK_TEXTURE_2D, texture);
    }

    private static createWhiteTexture2D(): void {
        const texture = new GlTexture2D();
        texture.allocate(GlInternalFormat.RGBA8, vec2.fromValues(1, 1), false);
        texture.storeFromBinary(new Uint8Array([255, 255, 255, 255]), vec2.fromValues(1, 1), GlFormat.RGBA, GlTextureDataType.UNSIGNED_BYTE)
        texture.setMinificationFilter(GlMinificationFilter.NEAREST);
        texture.setMagnificationFilter(GlMagnificationFilter.NEAREST);
        Engine.getParameters().set(Engine.WHITE_TEXTURE_2D, texture);
    }

    private static createBlackTexture2DArray(): void {
        const texture = new GlTexture2DArray();
        texture.allocate(GlInternalFormat.RGBA8, vec2.fromValues(1, 1), 1, false);
        texture.setMinificationFilter(GlMinificationFilter.NEAREST);
        texture.setMagnificationFilter(GlMagnificationFilter.NEAREST);
        Engine.getParameters().set(Engine.BLACK_TEXTURE_2D_ARRAY, texture);
    }

    private static createBlackCubeMapTexture(): void {
        const texture = new GlCubeMapTexture();
        texture.allocate(GlInternalFormat.RGBA8, vec2.fromValues(1, 1), false);
        texture.setMinificationFilter(GlMinificationFilter.NEAREST);
        texture.setMagnificationFilter(GlMagnificationFilter.NEAREST);
        Engine.getParameters().set(Engine.BLACK_CUBE_MAP_TEXTURE, texture);
    }

    public static get gl(): WebGL2RenderingContext {
        return Gl.context;
    }

    public static getCanvas(): HTMLCanvasElement {
        return Gl.canvas;
    }

    public static isFaceCulling(): boolean {
        return Gl.gl.isEnabled(Gl.gl.CULL_FACE);
    }

    public static setEnableCullFace(enable: boolean): void {
        if (enable) {
            Gl.gl.enable(Gl.gl.CULL_FACE);
        } else {
            Gl.gl.disable(Gl.gl.CULL_FACE);
        }
    }

    public static getCullFace(): GlCullFace {
        return GlCullFaceResolver.glToEnum(Gl.gl.getParameter(Gl.gl.CULL_FACE_MODE));
    }

    public static setCullFace(cullFace: GlCullFace): void {
        const glCullFace = GlCullFaceResolver.enumToGl(cullFace);
        Gl.gl.cullFace(glCullFace);
    }

    public static isAlphaBlend(): boolean {
        return Gl.gl.isEnabled(Gl.gl.BLEND);
    }

    public static setEnableBlend(enable: boolean): void {
        if (enable) {
            Gl.gl.enable(Gl.gl.BLEND);
        } else {
            Gl.gl.disable(Gl.gl.BLEND);
        }
    }

    public static getBlendRgbSource(): GlBlendFunc {
        return GlBlendFuncResolver.glToEnum(Gl.gl.getParameter(Gl.gl.BLEND_SRC_RGB));
    }

    public static getBlendRgbDestination(): GlBlendFunc {
        return GlBlendFuncResolver.glToEnum(Gl.gl.getParameter(Gl.gl.BLEND_DST_RGB));
    }

    public static getBlendAlphaSource(): GlBlendFunc {
        return GlBlendFuncResolver.glToEnum(Gl.gl.getParameter(Gl.gl.BLEND_SRC_ALPHA));
    }

    public static getBlendAlphaDestination(): GlBlendFunc {
        return GlBlendFuncResolver.glToEnum(Gl.gl.getParameter(Gl.gl.BLEND_DST_ALPHA));
    }

    public static setBlendFunc(source: GlBlendFunc, destination: GlBlendFunc): void {
        const glSFactor = GlBlendFuncResolver.enumToGl(source);
        const glDFactor = GlBlendFuncResolver.enumToGl(destination);
        Gl.gl.blendFunc(glSFactor, glDFactor);
    }

    public static setBlendFuncSeparate(rgbSource: GlBlendFunc, rgbDestination: GlBlendFunc, alphaSource: GlBlendFunc, alphaDestination: GlBlendFunc): void {
        const glRgbSource = GlBlendFuncResolver.enumToGl(rgbSource);
        const glRgbDestination = GlBlendFuncResolver.enumToGl(rgbDestination);
        const glAlphaSource = GlBlendFuncResolver.enumToGl(alphaSource);
        const glAlphaDestination = GlBlendFuncResolver.enumToGl(alphaDestination);
        Gl.gl.blendFuncSeparate(glRgbSource, glRgbDestination, glAlphaSource, glAlphaDestination);
    }

    public static getRgbBlendEquation(): GlBlendEquation {
        return GlBlendEquationResolver.glToEnum(Gl.gl.getParameter(Gl.gl.BLEND_EQUATION_RGB));
    }

    public static getAlphaBlendEquation(): GlBlendEquation {
        return GlBlendEquationResolver.glToEnum(Gl.gl.getParameter(Gl.gl.BLEND_EQUATION_ALPHA));
    }

    public static setBlendEquation(blendEquation: GlBlendEquation): void {
        const glBlendEquation = GlBlendEquationResolver.enumToGl(blendEquation);
        Gl.gl.blendEquation(glBlendEquation);
    }

    public static setBlendEquationSeparate(rgbBlendEquation: GlBlendEquation, alphaBlendEquation: GlBlendEquation): void {
        const glRgbBlendEquation = GlBlendEquationResolver.enumToGl(rgbBlendEquation);
        const glAlphaBlendEquation = GlBlendEquationResolver.enumToGl(alphaBlendEquation);
        Gl.gl.blendEquationSeparate(glRgbBlendEquation, glAlphaBlendEquation);
    }

    public static isDepthTest(): boolean {
        return Gl.gl.isEnabled(Gl.gl.DEPTH_TEST);
    }

    public static setEnableDepthTest(enable: boolean): void {
        if (enable) {
            Gl.gl.enable(Gl.gl.DEPTH_TEST);
        } else {
            Gl.gl.disable(Gl.gl.DEPTH_TEST);
        }
    }

    public static isDepthWrite(): boolean {
        return Gl.gl.getParameter(Gl.gl.DEPTH_WRITEMASK);
    }

    public static setDepthWrite(enable: boolean): void {
        Gl.gl.depthMask(enable);
    }

    public static getViewportSize(): ReadonlyVec2 {
        const viewport = Gl.gl.getParameter(Gl.gl.VIEWPORT);
        return vec2.fromValues(viewport[2], viewport[3]);
    }

    public static getViewportOffset(): ReadonlyVec2 {
        const viewport = Gl.gl.getParameter(Gl.gl.VIEWPORT);
        return vec2.fromValues(viewport[0], viewport[1]);
    }

    public static setViewport(size: ReadonlyVec2, offset: ReadonlyVec2): void {
        if (size[0] <= 0 || size[1] <= 0) {
            throw new Error();
        }
        Gl.gl.viewport(offset[0], offset[1], size[0], size[1]);
    }

    public static getClearColor(): vec4 {
        const clearColor: Float32Array = Gl.gl.getParameter(Gl.gl.COLOR_CLEAR_VALUE);
        return vec4.fromValues(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
    }

    public static setClearColor(color: ReadonlyVec4): void {
        Gl.gl.clearColor(color[0], color[1], color[2], color[3]);
    }

    public static clear(color: boolean, depth: boolean, stencil: boolean): void {
        const colorBit = color ? Gl.gl.COLOR_BUFFER_BIT : 0;
        const depthBit = depth ? Gl.gl.DEPTH_BUFFER_BIT : 0;
        const stencilBit = stencil ? Gl.gl.STENCIL_BUFFER_BIT : 0;
        Gl.gl.clear(colorBit | depthBit | stencilBit);
    }

    public static setMipmapPerformance(performance: GlPerformance): void {
        Gl.gl.hint(Gl.gl.GENERATE_MIPMAP_HINT, GlPerformanceResolver.enumToGl(performance))
    }

    public static setDerivativePerformance(performance: GlPerformance): void {
        Gl.gl.hint(Gl.gl.FRAGMENT_SHADER_DERIVATIVE_HINT, GlPerformanceResolver.enumToGl(performance))
    }

}
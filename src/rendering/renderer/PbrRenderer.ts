import { GeometryRenderer } from '../GeometryRenderer';
import { PbrShader } from '../../resource/shader/PbrShader';
import { PbrLightsStruct } from '../../component/light/pbr/PbrLightsStruct';
import { Conventions } from '../../resource/Conventions';
import { Engine } from '../../core/Engine';
import { RenderingPipeline } from '../RenderingPipeline';
import { mat4 } from 'gl-matrix';
import { AlphaMode } from '../../material/AlphaMode';
import { Gl } from '../../webgl/Gl';
import { IRenderableComponent } from '../../component/renderable/IRenderableComponent';
import { IRenderable } from '../../resource/IRenderable';
import { GlConstants } from '../../webgl/GlConstants';
import { GlTimeElapsedQuery } from '../../webgl/query/GlTimeElapsedQuery';
import { GlFboAttachmentSlot } from '../../webgl/enum/GlFboAttachmentSlot';

export class PbrRenderer extends GeometryRenderer {

    private shader: PbrShader;
    private query: GlTimeElapsedQuery;

    public constructor() {
        super('PBR Renderer');
        if (!GlConstants.COLOR_BUFFER_FLOAT_ENABLED || !GlConstants.TEXTURE_FLOAT_LINEAR_ENABLED) {
            throw new Error();
        }
        this.shader = new PbrShader();
        this.query = new GlTimeElapsedQuery();
    }

    /*protected renderUnsafe(): void {
        if (this.query.isResultAvailable()) {
            console.log(`${this.query.getResult() / 1000000} ms`);
        }
        this.query.beginQuery();
        super.renderUnsafe();
        this.query.endQuery();
    }*/

    protected beforeRendering(): void {
        super.beforeRendering();
        PbrLightsStruct.getInstance().useUbo();
        this.shader.getNativeShaderProgram().bindUniformBlockToBindingPoint(Conventions.BP_LIGHTS);
        let mats = Engine.getRenderingPipeline().getParameters().get(RenderingPipeline.SHADOW_PROJECTION_VIEW_MATRICES);
        if (!mats || !mats.length) {
            mats = new Array<mat4>(mat4.create());
        }
        for (let i = 0; i < mats.length; i++) {
            this.shader.getNativeShaderProgram().loadMatrix4(`shadowProjectionViewMatrices[${i}]`, mats[i]);
        }
        let splits = Engine.getRenderingPipeline().getParameters().get(RenderingPipeline.SHADOW_SPLITS);
        if (!splits || !splits.length) {
            splits = new Array<number>();
            const camera = Engine.getMainCamera();
            splits.push(camera.getNearPlaneDistance());
            splits.push(camera.getFarPlaneDistance());
        }
        for (let i = 0; i < splits.length; i++) {
            this.shader.getNativeShaderProgram().loadFloat(`splits[${i}]`, splits[i]);
        }

        const fbo = Engine.getRenderingPipeline().getGeometryFbo();
        fbo.setDrawBuffers(
            fbo.getAttachmentContainer(GlFboAttachmentSlot.COLOR, 0),
            fbo.getAttachmentContainer(GlFboAttachmentSlot.COLOR, 1),
            fbo.getAttachmentContainer(GlFboAttachmentSlot.COLOR, 2)
        );
    }

    protected afterRendering(): void {
        super.afterRendering();
        const fbo = Engine.getRenderingPipeline().getGeometryFbo();
        fbo.setDrawBuffers(fbo.getAttachmentContainer(GlFboAttachmentSlot.COLOR, 0));
    }

    protected drawPredicate(renderableComponent: IRenderableComponent<IRenderable>): boolean {
        const blending = renderableComponent.getMaterial().getParameters().get(Conventions.MP_ALPHA_MODE) === AlphaMode.BLEND;
        return super.drawPredicate(renderableComponent) && ((this.opaque && !blending) || (!this.opaque && blending));
    }

    protected setAlphaMode(renderableComponent: IRenderableComponent<IRenderable>, alphaMode: AlphaMode): void {
        this.getShader().getNativeShaderProgram().loadInt('alphaMode', alphaMode);
        Gl.setEnableBlend(alphaMode === AlphaMode.BLEND);
        if (alphaMode === AlphaMode.MASK) {
            const alphaCutoff = renderableComponent.getMaterial().getParameters().get(Conventions.MP_ALPHA_CUTOFF) ?? 0.5;
            this.getShader().getNativeShaderProgram().loadFloat('alphaCutoff', alphaCutoff);
        }
    }

    public getShader(): PbrShader {
        return this.shader;
    }

}
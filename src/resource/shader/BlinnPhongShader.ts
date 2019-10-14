import { Shader } from './Shader';
import { mat3 } from 'gl-matrix';
import { IRenderable } from '../IRenderable';
import { DiffuseSlotHelper } from './slotHelper/DiffuseSlotHelper';
import { SpecularSlotHelper } from './slotHelper/SpecularSlotHelper';
import { NormalSlotHelper } from './slotHelper/NormalSlotHelper';
import { ShaderSlotHelper } from './slotHelper/ShaderSlotHelper';
import { ReflectionSlotHelper } from './slotHelper/ReflectionSlotHelper';
import { RefractionSlotHelper } from './slotHelper/RefractionSlotHelper';
import { EnvironmentSlotHelper } from './slotHelper/EnvironmentSlotHelper';
import { IRenderableComponent } from '../../component/renderable/IRenderableComponent';
import { EmissiveSlotHelper } from './slotHelper/EmissiveSlotHelper';

export class BlinnPhongShader extends Shader {

    private readonly DIFFUSE_TEXTURE_UNIT = 1;
    private readonly SPECULAR_TEXTURE_UNIT = 2;
    private readonly NORMAL_POM_TEXTURE_UNIT = 3;
    private readonly REFLECTION_TEXTURE_UNIT = 4;
    private readonly REFRACTION_TEXTURE_UNIT = 5;
    private readonly ENVIRONMENT_INTENSITY_TEXTURE_UNIT = 6;
    private readonly EMISSIVE_TEXTURE_UNIT = 7;

    private slotHelpers: Array<ShaderSlotHelper>;

    public constructor() {
        super();
        this.slotHelpers = [
            new DiffuseSlotHelper(this.getShaderProgram(), this.DIFFUSE_TEXTURE_UNIT),
            new SpecularSlotHelper(this.getShaderProgram(), this.SPECULAR_TEXTURE_UNIT),
            new NormalSlotHelper(this.getShaderProgram(), this.NORMAL_POM_TEXTURE_UNIT),
            new ReflectionSlotHelper(this.getShaderProgram(), this.REFLECTION_TEXTURE_UNIT),
            new RefractionSlotHelper(this.getShaderProgram(), this.REFRACTION_TEXTURE_UNIT),
            new EnvironmentSlotHelper(this.getShaderProgram(), this.ENVIRONMENT_INTENSITY_TEXTURE_UNIT),
            new EmissiveSlotHelper(this.getShaderProgram(), this.EMISSIVE_TEXTURE_UNIT)
        ];
    }

    public setUniforms(renderableComponent: IRenderableComponent<IRenderable>): void {
        this.setMatrixUniforms(renderableComponent);
        const material = renderableComponent.getMaterial();
        for (const helper of this.slotHelpers) {
            helper.loadSlot(material);
        }
    }

    private setMatrixUniforms(renderableComponent: IRenderableComponent<IRenderable>): void {
        const model = renderableComponent.getModelMatrix();
        const inverseModel3x3 = mat3.fromMat4(mat3.create(), renderableComponent.getInverseModelMatrix());
        this.getShaderProgram().loadMatrix3('inverseTransposedModelMatrix3x3', inverseModel3x3, true);
        this.getShaderProgram().loadMatrix4('modelMatrix', model, false);
    }

    public connectTextureUnits(): void {
        //this.getShaderProgram().connectTextureUnit('shadowMap', 0);
    }

    protected getVertexShaderPath(): string {
        return 'res/shaders/blinnPhong/vertex.glsl';
    }
    protected getFragmentShaderPath(): string {
        return 'res/shaders/blinnPhong/fragment.glsl';
    }

}
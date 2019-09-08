import { Shader } from '../Shader';
import { mat3 } from 'gl-matrix';
import { IRenderable } from '../../IRenderable';
import { BlinnPhongDiffuseHelper } from './BlinnPhongDiffuseHelper';
import { BlinnPhongSpecularHelper } from './BlinnPhongSpecularHelper';
import { BlinnPhongNormalHelper } from './BlinnPhongNormalHelper';
import { BlinnPhongHelper } from './BlinnPhongHelper';
import { BlinnPhongReflectionHelper } from './BlinnPhongReflectionHelper';
import { BlinnPhongRefractionHelper } from './BlinnPhongRefractionHelper';
import { BlinnPhongEnvironmentHelper } from './BlinnPhongEnvironmentHelper';
import { IRenderableComponent } from '../../../component/renderable/IRenderableComponent';
import { Conventions } from '../../Conventions';

export class BlinnPhongShader extends Shader {

    private slotHelpers: Array<BlinnPhongHelper>;

    public constructor() {
        super();
        this.slotHelpers = [
            new BlinnPhongDiffuseHelper(),
            new BlinnPhongSpecularHelper(),
            new BlinnPhongNormalHelper(),
            new BlinnPhongReflectionHelper(),
            new BlinnPhongRefractionHelper(),
            new BlinnPhongEnvironmentHelper(),
        ];
    }

    public setUniforms(rc: IRenderableComponent<IRenderable>): void {
        //FIXME: na ezt tutira nem itt kéne
        this.getShaderProgram().bindUniformBlockToBindingPoint(Conventions.CAMERA_BINDING_POINT);
        this.getShaderProgram().bindUniformBlockToBindingPoint(Conventions.LIGHTS_BINDING_POINT);

        const model = rc.getModelMatrix();
        const inverseModel3x3 = mat3.fromMat4(mat3.create(), rc.getInverseModelMatrix());
        const sp = this.getShaderProgram();
        sp.loadMatrix3('inverseTransposedModelMatrix3x3', inverseModel3x3, true);
        sp.loadMatrix4('modelMatrix', model, false);
        //sp.loadBoolean('sRgb', false);

        const material = rc.getMaterial();
        for (const helper of this.slotHelpers) {
            //TODO: ellenőrizni, hogy a slot aktív-e slot.isActive()
            //mellesleg ezt a többi shaderben is kéne
            helper.loadSlot(material, sp);
        }
    }

    public connectTextureUnits(): void {
        //this.getShaderProgram().connectTextureUnit('shadowMap', 0);
        this.getShaderProgram().connectTextureUnit('material.reflection', Conventions.REFLECTION_TEXTURE_UNIT);
        this.getShaderProgram().connectTextureUnit('material.refraction', Conventions.REFRACTION_TEXTURE_UNIT);
    }

    protected getVertexShaderPath(): string {
        return 'res/shaders/blinnPhong/vertex.glsl';
    }
    protected getFragmentShaderPath(): string {
        return 'res/shaders/blinnPhong/fragment.glsl';
    }

}
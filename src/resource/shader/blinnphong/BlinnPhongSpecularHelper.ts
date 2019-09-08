import { BlinnPhongHelper } from './BlinnPhongHelper';
import { Material } from '../../../material/Material';
import { GlShaderProgram } from '../../../webgl/shader/GlShaderProgram';
import { vec4 } from 'gl-matrix';
import { MaterialSlot } from '../../../material/MaterialSlot';
import { BlinnPhongRenderer } from '../../../rendering/renderer/BlinnPhongRenderer';
import { Conventions } from '../../Conventions';

export class BlinnPhongSpecularHelper extends BlinnPhongHelper {

    private static readonly defaultValue = vec4.fromValues(0.5, 0.5, 0.5, 0.5);

    public loadSlot(material: Material<BlinnPhongRenderer>, sp: GlShaderProgram): void {
        this.setValues(material.getSlot(Material.SPECULAR), sp);
        if (this.isTexture2DUsable()) {
            this.loadTexture2D();
            this.loadGlossiness();
        } else if (this.isColorUsable()) {
            this.loadDefaultTexture2D();
            this.loadColor4();
        } else {
            this.loadDefaultTexture2D();
            this.loadDefaultColor4(BlinnPhongSpecularHelper.defaultValue);
        }
    }

    private loadGlossiness(): void {
        //debugger;
        const slot = this.getSlot();
        const sp = this.getSp();
        const isThereGlossiness = slot.getParameters().get(MaterialSlot.USE_GLOSSINESS);
        if (isThereGlossiness == null || isThereGlossiness != 1) {
            const color = slot.getColor();
            sp.loadBoolean(this.getIsThereGlossinessName(), false);
            if (color) {
                sp.loadVector4(this.getColorName(), color);
            } else {
                sp.loadVector4(this.getColorName(), BlinnPhongSpecularHelper.defaultValue);
            }
        } else {
            sp.loadBoolean(this.getIsThereGlossinessName(), true);
        }
    }

    protected getTextureUnit(): number {
        return Conventions.SPECULAR_TEXTURE_UNIT;
    }

    protected getMapName(): string {
        return 'material.specular';
    }

    protected getIsThereMapName(): string {
        return 'material.isThereSpecularMap';
    }

    protected getTileName(): string {
        return 'material.specularTile';
    }

    protected getOffsetName(): string {
        return 'material.specularOffset';
    }

    protected getColorName(): string {
        return 'material.specularColor';
    }

    protected getIsThereGlossinessName(): string {
        return 'material.isThereGlossiness';
    }

}
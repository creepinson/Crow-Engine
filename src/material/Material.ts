import { ParameterKey } from '../utility/parameter/ParameterKey';
import { MaterialSlot } from './MaterialSlot';
import { ParameterContainer } from '../utility/parameter/ParameterContainer';
import { GeometryRenderer } from '../rendering/GeometryRenderer';
import { AlphaMode } from './AlphaMode';

export class Material<T extends GeometryRenderer> {

    public static readonly SKYBOX = new ParameterKey<MaterialSlot>('SKYBOX');
    public static readonly DIFFUSE = new ParameterKey<MaterialSlot>('DIFFUSE');
    public static readonly SPECULAR = new ParameterKey<MaterialSlot>('SPECULAR');
    public static readonly NORMAL = new ParameterKey<MaterialSlot>('NORMAL');
    public static readonly REFLECTION = new ParameterKey<MaterialSlot>('REFLECTION');
    public static readonly REFRACTION = new ParameterKey<MaterialSlot>('REFRACTION');
    public static readonly ENVIRONMENT_INTENSITY = new ParameterKey<MaterialSlot>('ENVIRONMENT_INTENSITY');
    public static readonly BASE_COLOR = new ParameterKey<MaterialSlot>('BASE_COLOR');
    public static readonly ROUGHNESS_METALNESS = new ParameterKey<MaterialSlot>('ROUGHNESS_METALNESS');
    public static readonly OCCLUSION = new ParameterKey<MaterialSlot>('OCCLUSION');
    public static readonly EMISSIVE = new ParameterKey<MaterialSlot>('EMISSIVE');

    public static readonly ALPHA_MODE = new ParameterKey<AlphaMode>('ALPHA_MODE');
    public static readonly ALPHA_CUTOFF = new ParameterKey<number>('ALPHA_CUTOFF');
    public static readonly DOUBLE_SIDED = new ParameterKey<boolean>('DOUBLE_SIDED');

    private readonly slots = new ParameterContainer();
    private readonly parameters = new ParameterContainer();
    private readonly rendererType: new (..._) => T;

    public constructor(rendererType: new (..._) => T) {
        this.rendererType = rendererType;
    }

    public getRenderer(): new (..._) => T {
        return this.rendererType;
    }

    public getSlot(key: ParameterKey<MaterialSlot>): MaterialSlot {
        return this.slots.get(key);
    }

    public setSlot(key: ParameterKey<MaterialSlot>, slot: MaterialSlot): void {
        if (!key) {
            throw new Error();
        }
        this.slots.set(key, slot);
    }

    public getParameters(): ParameterContainer {
        return this.parameters;
    }

}

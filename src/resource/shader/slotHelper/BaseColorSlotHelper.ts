import { Material } from '../../../material/Material';
import { ShaderSlotHelper } from './ShaderSlotHelper';
import { ParameterKey } from '../../../utility/parameter/ParameterKey';
import { MaterialSlot } from '../../../material/MaterialSlot';

export class BaseColorSlotHelper extends ShaderSlotHelper {

    protected getMaterialSlotKey(): ParameterKey<MaterialSlot> {
        return Material.BASE_COLOR;
    }

    protected getMapName(): string {
        return 'material.baseColorMap';
    }

    protected getIsThereMapName(): string {
        return 'material.isThereBaseColorMap';
    }

    protected getTileName(): string {
        return 'material.baseColorMapTile';
    }

    protected getOffsetName(): string {
        return 'material.baseColorMapOffset';
    }

    protected getColorName(): string {
        return 'material.baseColor';
    }

}
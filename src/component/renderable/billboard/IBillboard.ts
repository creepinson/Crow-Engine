import { mat4 } from 'gl-matrix';
import { Transform } from '../../../core/Transform';
import { IRenderableComponent } from '../IRenderableComponent';
import { IRenderable } from '../../../resource/IRenderable';
import { IInvalidatable } from '../../../utility/invalidatable/IInvalidatable';

export interface IBillboard extends IInvalidatable {

    getModelMatrix(): mat4;

    getInverseModelMatrix(): mat4;

    getRenderableComponent(): IRenderableComponent<IRenderable>;

    private_setRenderableComponent(renderableComponent: IRenderableComponent<IRenderable>): void;

}
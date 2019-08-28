import { BoundingShape } from './BoundingShape';
import { Utility } from '../../../utility/Utility';
import { Scene } from '../../../core/Scene';
import { Log } from '../../../utility/log/Log';
import { LogLevel } from '../../../utility/log/LogLevel';

export class SphereBoundingShape extends BoundingShape {

    protected radius: number;

    public isInsideMainCameraFrustum(): boolean {
        const camera = Scene.getParameters().get(Scene.MAIN_CAMERA);
        if (camera && camera.getGameObject() && this.isUsable()) {
            const position = this.renderableComponent.getGameObject().getTransform().getAbsolutePosition();
            for (const plane of camera.getFrustum().getPlanesIterator()) {
                if (plane.computeDistanceFrom(position) + this.getWorldSpaceRadius() < 0) {
                    return false;
                }
            }
        }
        return true;
    }

    private refresh(): void {
        if (!this.isValid()) {
            this.refreshUnsafe();
            this.setValid(true);
            Log.logString(LogLevel.INFO_3, 'Sphere bounding shape refreshed');
        }
    }

    protected refreshUnsafe(): void {
        const osRadius = this.getObjectSpaceRadius();
        const absoluteScale = this.renderableComponent.getGameObject().getTransform().getAbsoluteScale();
        this.radius = osRadius * Utility.getMaxCoordinate(absoluteScale);
    }

    public getObjectSpaceRadius(): number {
        if (this.renderableComponent) {
            return this.renderableComponent.getRenderable().getObjectSpaceRadius();
        } else {
            return null;
        }
    }

    public getWorldSpaceRadius(): number {
        if (this.isUsable()) {
            this.refresh();
            return this.radius;
        } else {
            return null;
        }
    }

}
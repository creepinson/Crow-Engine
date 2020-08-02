import { mat4, ReadonlyMat4 } from 'gl-matrix';
import { Utility } from '../../utility/Utility';
import { GameObject } from '../../core/GameObject';
import { Frustum } from './frustum/Frustum';
import { IFrustum } from './frustum/IFrustum';
import { LogLevel } from '../../utility/log/LogLevel';
import { Engine } from '../../core/Engine';
import { ICameraComponent } from './ICameraComponent';
import { Component } from '../Component';
import { CameraType } from './CameraType';

export class CameraComponent extends Component implements ICameraComponent {

    private type: CameraType;
    private viewMatrix: mat4;
    private projectionMatrix: mat4;
    private frustum: IFrustum;
    private nearPlaneDistance = 1;
    private farPlaneDistance = 50;
    private fov = 55;
    private horizontalScale = 10;
    private verticalScale = 10;
    private aspectRatio = 1;

    public constructor(type = CameraType.PERSPECTIVE) {
        super();
        this.setType(type);
        this.setFrustum(new Frustum());
    }

    public getType(): CameraType {
        return this.type;
    }

    private setType(type: CameraType): void {
        this.type = type;
        this.invalidate();
    }

    public getHorizontalScale(): number {
        return this.horizontalScale;
    }

    public setHorizontalScale(scale: number): void {
        this.horizontalScale = scale;
        this.invalidate();
    }

    public getVerticalalScale(): number {
        return this.verticalScale;
    }

    public setVerticalScale(scale: number): void {
        this.verticalScale = scale;
        this.invalidate();
    }

    public getFov(): number {
        return this.fov;
    }

    public setFov(fov: number): void {
        if (fov <= 0 || fov >= 180) {
            throw new Error();
        }
        this.fov = fov;
        this.invalidate();
    }

    public getAspectRatio(): number {
        return this.aspectRatio;
    }

    public setAspectRatio(aspectRatio: number): void {
        if (aspectRatio <= 0) {
            throw new Error();
        }
        this.aspectRatio = aspectRatio;
        this.invalidate();
    }

    public getNearPlaneDistance(): number {
        return this.nearPlaneDistance;
    }

    public setNearPlaneDistance(nearPlaneDistance: number): void {
        if (nearPlaneDistance <= 0 || nearPlaneDistance >= this.farPlaneDistance) {
            throw new Error();
        }
        this.nearPlaneDistance = nearPlaneDistance;
        this.invalidate();
    }

    public getFarPlaneDistance(): number {
        return this.farPlaneDistance;
    }

    public setFarPlaneDistance(farPlaneDistance: number): void {
        if (this.nearPlaneDistance >= farPlaneDistance) {
            throw new Error();
        }
        this.farPlaneDistance = farPlaneDistance;
        this.invalidate();
    }

    protected refresh(): void {
        if (!this.isValid()) {
            if (this.isTheMainCamera()) {
                this.setAspectRatio(Utility.getCanvasAspectRatio());
                this.setVerticalScale(this.horizontalScale / this.aspectRatio);
            }
            this.refreshProjectionMatrix();
            this.refreshViewMatrix();
            Engine.getLog().logString(LogLevel.INFO_3, 'Camera matrices refreshed');
        }
    }

    private refreshProjectionMatrix(): void {
        if (this.type === CameraType.PERSPECTIVE) {
            this.projectionMatrix = Utility.computePerspectiveProjectionMatrix(
                this.fov,
                this.aspectRatio,
                this.nearPlaneDistance,
                this.farPlaneDistance
            );
        } else {
            this.projectionMatrix = Utility.computeOrthographicProjectionMatrix(
                -this.horizontalScale,
                this.horizontalScale,
                -this.verticalScale,
                this.verticalScale,
                this.nearPlaneDistance,
                this.farPlaneDistance
            );
        }
    }

    private refreshViewMatrix(): void {
        if (this.getGameObject()) {
            const transform = this.getGameObject().getTransform();
            const position = transform.getAbsolutePosition();
            const rotation = transform.getAbsoluteRotation();
            this.viewMatrix = Utility.computeViewMatrix(position, rotation);
            this.setValid(true);
        }
    }

    public getViewMatrix(): ReadonlyMat4 {
        if (this.getGameObject()) {
            this.refresh();
            return this.viewMatrix;
        } else {
            return null;
        }
    }

    public getProjectionMatrix(): ReadonlyMat4 {
        this.refresh();
        return this.projectionMatrix;
    }

    public getFrustum(): IFrustum {
        return this.frustum;
    }

    public setFrustum(frustum: IFrustum): void {
        if (!frustum || frustum.getCameraComponent()) {
            throw new Error();
        }
        if (this.frustum) {
            this.frustum._setCameraComponent(null);
        }
        this.frustum = frustum;
        this.frustum._setCameraComponent(this);
        this.invalidate();
    }

    public isTheMainCamera(): boolean {
        return Engine.getMainCamera() == this;
    }

    protected handleAttach(attached: GameObject): void {
        attached.getTransform().getInvalidatables().add(this);
    }

    protected handleDetach(detached: GameObject): void {
        detached.getTransform().getInvalidatables().remove(this);
    }

}

import { IRenderable } from '../../resource/IRenderable';
import { Component } from '../Component';
import { GameObject } from '../../core/GameObject';
import { Material } from '../../material/Material';
import { SphereBoundingShape } from './boundingshape/SphereBoundingShape';
import { IRenderableComponent } from './IRenderableComponent';
import { vec2, ReadonlyVec2, ReadonlyMat4, ReadonlyVec3, ReadonlyQuat } from 'gl-matrix';
import { BlinnPhongRenderer } from '../../rendering/renderer/BlinnPhongRenderer';
import { BoundingShape } from './boundingshape/BoundingShape';
import { Billboard } from './billboard/Billboard';
import { Engine } from '../../core/Engine';

export abstract class RenderableComponent<T extends IRenderable> extends Component implements IRenderableComponent<T>{

    private renderable: T;
    private material: Material<any>;
    private boundingShape: BoundingShape;
    private billboard: Billboard;
    private readonly visibilityInterval = vec2.fromValues(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
    private materialActive = true;
    private castShadow = true;
    private receiveShadow = true;
    private reflectable = false;

    public constructor(renderable: T, material: Material<any> = new Material(BlinnPhongRenderer), boundingShape: BoundingShape = new SphereBoundingShape()) {
        super();
        this.setRenderable(renderable);
        this.setMaterial(material);
        this.setBoundingShape(boundingShape);
    }

    public getRenderable(): T {
        return this.renderable;
    }

    public setRenderable(renderable: T): void {
        if (!renderable) {
            throw new Error();
        }
        this.renderable = renderable;
        this.invalidate();
    }

    public getMaterial(): Material<any> {
        return this.material;
    }

    public setMaterial(material: Material<any>): void {
        if (!material) {
            throw new Error();
        }
        this.material = material;
        this.invalidate();
    }

    public getBoundingShape(): BoundingShape {
        return this.boundingShape;
    }

    public setBoundingShape(boundingShape: BoundingShape): void {
        if (!boundingShape || boundingShape.getRenderableComponent()) {
            throw new Error();
        }
        if (this.boundingShape) {
            (this.boundingShape as any).setRenderableComponent(null);
        }
        this.boundingShape = boundingShape;
        (this.boundingShape as any).setRenderableComponent(this);
        this.invalidate();
    }

    public getBillboard(): Billboard {
        return this.billboard;
    }

    public setBillboard(billboard: Billboard): void {
        if (billboard && billboard.getRenderableComponent()) {
            throw new Error();
        }
        if (this.billboard) {
            (this.billboard as any).setRenderableComponent(null);
        }
        this.billboard = billboard;
        (this.billboard as any).setRenderableComponent(this);
        this.invalidate();
    }

    public isReflectable(): boolean {
        return this.reflectable;
    }

    public setReflectable(reflectable: boolean): void {
        this.reflectable = reflectable;
        this.invalidate();
    }

    public isCastShadow(): boolean {
        return this.castShadow;
    }

    public setCastShadow(castShadow: boolean): void {
        this.castShadow = castShadow;
        this.invalidate();
    }

    public isReceiveShadows(): boolean {
        return this.receiveShadow;
    }

    public setReceiveShadows(receiveShadows: boolean): void {
        this.receiveShadow = receiveShadows;
        this.invalidate();
    }

    public isMaterialActive(): boolean {
        return this.materialActive;
    }

    public setMaterialActive(materialActive: boolean): void {
        this.materialActive = materialActive;
        this.invalidate();
    }

    public getVisibilityInterval(): ReadonlyVec2 {
        return this.visibilityInterval;
    }

    public setVisibilityInterval(interval: ReadonlyVec2): void {
        if (!interval) {
            throw new Error();
        }
        this.visibilityInterval[0] = interval[0];
        this.visibilityInterval[1] = interval[1];
    }

    public getModelMatrix(): ReadonlyMat4 {
        if (this.getGameObject()) {
            if (this.billboard) {
                return this.billboard.getModelMatrix();
            } else {
                return this.getGameObject().getTransform().getModelMatrix();
            }
        } else {
            return null;
        }
    }

    public getInverseModelMatrix(): ReadonlyMat4 {
        if (this.getGameObject()) {
            if (this.billboard) {
                return this.billboard.getInverseModelMatrix();
            } else {
                return this.getGameObject().getTransform().getInverseModelMatrix();
            }
        } else {
            return null;
        }
    }

    public getForwardVector(): ReadonlyVec3 {
        if (this.getGameObject()) {
            if (this.billboard) {
                return this.billboard.getForwardVector();
            } else {
                return this.getGameObject().getTransform().getForwardVector();
            }
        } else {
            return null;
        }
    }

    public getRightVector(): ReadonlyVec3 {
        if (this.getGameObject()) {
            if (this.billboard) {
                return this.billboard.getRightVector();
            } else {
                return this.getGameObject().getTransform().getRightVector();
            }
        } else {
            return null;
        }
    }

    public getUpVector(): ReadonlyVec3 {
        if (this.getGameObject()) {
            if (this.billboard) {
                return this.billboard.getUpVector();
            } else {
                return this.getGameObject().getTransform().getUpVector();
            }
        } else {
            return null;
        }
    }

    public getRelativeRotation(): ReadonlyQuat {
        if (this.getGameObject()) {
            if (this.billboard) {
                return this.billboard.getRelativeRotation();
            } else {
                return this.getGameObject().getTransform().getRelativeRotation();
            }
        } else {
            return null;
        }
    }

    public getAbsoluteRotation(): ReadonlyQuat {
        if (this.getGameObject()) {
            if (this.billboard) {
                return this.billboard.getAbsoluteRotation();
            } else {
                return this.getGameObject().getTransform().getAbsoluteRotation();
            }
        } else {
            return null;
        }
    }

    public abstract getFaceCount(): number;

    public draw(): void {
        this.renderable.draw();
    }

    protected updateComponent(): void {
        this.renderable.update();
    }

    protected handleAttach(attached: GameObject): void {
        attached.getTransform().getInvalidatables().add(this);
        Engine.getRenderingPipeline().getRenderableContainer().add(this);
    }

    protected handleDetach(detached: GameObject): void {
        detached.getTransform().getInvalidatables().remove(this);
        Engine.getRenderingPipeline().getRenderableContainer().remove(this);
    }

}

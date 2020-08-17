import { Component } from '../component/Component';
import { vec3 } from 'gl-matrix';
import { Engine } from '../core/Engine';
import { RotationBuilder } from '../utility/RotationBuilder';
import { Axis } from '../utility/Axis';
import { PbrLightsStruct } from '../component/light/pbr/PbrLightsStruct';
import { RenderingPipeline } from '../rendering/RenderingPipeline';

export class PlayerComponent extends Component {

    private keysDown = new Map<string, KeyboardEvent>();

    public constructor() {
        super();
        document.onkeydown = (ev: KeyboardEvent) => {
            this.keysDown.set(ev.code, ev);
        };
        document.onkeyup = (ev: KeyboardEvent) => {
            this.keysDown.delete(ev.code);
        };
    }

    private includes(code: string): boolean {
        for (const keyCode of this.keysDown.keys()) {
            if (keyCode === code) {
                return true;
            }
        }
        return false;
    }

    public updateComponent(): void {
        const moveSpeed = 0.01;
        const rotateSpeed = 0.05;
        const deltaTime = Engine.getTimeManager().getDeltaTimeFactor();
        const forwardSpeed = vec3.scale(vec3.create(), this.getGameObject().getTransform().getForwardVector(), moveSpeed * deltaTime);
        const rightSpeed = vec3.scale(vec3.create(), this.getGameObject().getTransform().getRightVector(), moveSpeed * deltaTime);
        const upSpeed = vec3.scale(vec3.create(), this.getGameObject().getTransform().getUpVector(), moveSpeed * deltaTime);

        //move
        if (this.includes('KeyW')) {
            this.getGameObject().getTransform().move(forwardSpeed);
        }
        if (this.includes('KeyS')) {
            this.getGameObject().getTransform().move(vec3.negate(vec3.create(), forwardSpeed));
        }
        if (this.includes('KeyD')) {
            this.getGameObject().getTransform().move(rightSpeed);
        }
        if (this.includes('KeyA')) {
            this.getGameObject().getTransform().move(vec3.negate(vec3.create(), rightSpeed));
        }
        if (this.includes('KeyR')) {
            this.getGameObject().getTransform().move(upSpeed);
        }
        if (this.includes('KeyF')) {
            this.getGameObject().getTransform().move(vec3.negate(vec3.create(), upSpeed));
        }
        //rotate
        if (this.includes('KeyQ')) {
            const rotation = RotationBuilder.createRotation(Axis.Y, rotateSpeed * deltaTime).getQuaternion();
            this.getGameObject().getTransform().rotate(rotation);
        }
        if (this.includes('KeyE')) {
            const rotation = RotationBuilder.createRotation(Axis.Y_NEGATE, rotateSpeed * deltaTime).getQuaternion();
            this.getGameObject().getTransform().rotate(rotation);
        }

        const lightTransform = PbrLightsStruct.getInstance().getShadowLightSource().getGameObject().getTransform();
        if (this.includes('ArrowUp')) {
            const rotation = RotationBuilder.createRotation(Axis.X_NEGATE, rotateSpeed * 0.5 * deltaTime).getQuaternion();
            lightTransform.rotate(rotation);
        }
        if (this.includes('ArrowDown')) {
            const rotation = RotationBuilder.createRotation(Axis.X, rotateSpeed * 0.5 * deltaTime).getQuaternion();
            lightTransform.rotate(rotation);
        }
        for (let i = 1; i < 10; i++) {
            if (this.includes(`Digit${i}`)) {
                Engine.getRenderingPipeline().getParameters().set(RenderingPipeline.DUAL_DEPTH_PEEL_PASS_COUNT, i);
            }
        }
    }

}
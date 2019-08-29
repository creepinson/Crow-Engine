import { Billboard } from './Billboard';
import { mat4, vec3 } from 'gl-matrix';
import { Utility } from '../../../utility/Utility';

export class RealSphericalBillboard extends Billboard {

    protected refreshUnsafe(): void {
        const cameraTransform = this.getMainCameraTransform();
        const cameraPosition = cameraTransform.getAbsolutePosition();
        const cameraUp = cameraTransform.getUpVector();
        const transform = this.getRenderableComponent().getGameObject().getTransform();
        const position = transform.getAbsolutePosition();
        const forward = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), cameraPosition, position));
        if (Utility.isParallel(forward, cameraUp)) {
            this.setMatricesToDefault();
        } else {
            this.refreshMatrices(forward, cameraUp);
        }
    }

    private refreshMatrices(forward: vec3, cameraUp: vec3): void {
        const right = vec3.cross(vec3.create(), cameraUp, forward);
        const up = vec3.cross(vec3.create(), forward, right);
        const modelMatrix = this.createBillboard(forward, up, right);
        const inverseModelMatrix = mat4.invert(mat4.create(), modelMatrix);
        this.modelMatrix = modelMatrix;
        this.inverseModelMatrix = inverseModelMatrix;
    }

}
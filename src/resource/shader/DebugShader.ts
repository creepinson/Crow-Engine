import { Shader } from './Shader';
import { mat4 } from 'gl-matrix';

export class DebugShader extends Shader {

    protected getVertexShaderPath(): string {
        return 'res/shaders/debug/debug.vs';
    }
    protected getFragmentShaderPath(): string {
        return 'res/shaders/debug/debug.fs';
    }

    public connectTextureUnits(): void {
        this.getShaderProgram().connectTextureUnit('image', 0);
    }

    public setUniforms(data: { transformation: mat4, layer: number }): void {
        this.getShaderProgram().loadMatrix4("transformation", data.transformation);
        this.getShaderProgram().loadInt("layer", data.layer);
    }

}

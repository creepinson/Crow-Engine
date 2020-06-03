import { IMesh } from "./IMesh";
import { Vao } from "../../webgl/Vao";
import { Utility } from "../../utility/Utility";
import { Conventions } from "../Conventions";
import { vec3 } from "gl-matrix";
import { Gl } from "../../webgl/Gl";
import { RenderingMode, RenderingModeResolver } from "../RenderingMode";
import { IndicesType, IndicesTypeResolver } from "../IndicesType";
import { Engine } from "../../core/Engine";

export class StaticMesh implements IMesh {

    private vao: Vao;
    private vertexCount: number;
    private faceCount: number;
    private renderingMode: RenderingMode;
    private indicesType: IndicesType;
    private aabbMin: vec3;
    private aabbMax: vec3;
    private radius: number;

    public constructor(vao: Vao, vertexCount: number, faceCount: number, renderingMode: RenderingMode, indicesType: IndicesType, aabbMin: vec3, aabbMax: vec3, radius: number) {
        this.vao = vao;
        this.vertexCount = vertexCount;
        this.faceCount = faceCount;
        this.renderingMode = renderingMode;
        this.indicesType = indicesType;
        this.aabbMin = aabbMin;
        this.aabbMax = aabbMax;
        this.radius = radius;
        Engine.getResourceManager().add(this);
    }

    public getFaceCount(): number {
        return this.faceCount;
    }

    public getVertexCount(): number {
        return this.vertexCount;
    }

    public getObjectSpaceRadius(): number {
        return this.radius;
    }

    public getObjectSpaceAabbMin(): vec3 {
        return vec3.clone(this.aabbMin);
    }

    public getObjectSpaceAabbMax(): vec3 {
        return vec3.clone(this.aabbMax);
    }

    public draw(): void {
        const mode = RenderingModeResolver.enumToGl(this.renderingMode);
        this.vao.bind();
        if (this.vao.getEbo()) {
            const type = IndicesTypeResolver.enumToGl(this.indicesType);
            Gl.gl.drawElements(mode, this.getVertexCount(), type, 0);
        } else {
            Gl.gl.drawArrays(mode, 0, this.getVertexCount());
        }
    }

    public update(): void { }

    public hasTextureCoordinates(): boolean {
        return !!this.vao.getVertexAttribArray(Conventions.TEXTURE_COORDINATES_0_VBO_INDEX).getVbo();
    }

    public hasNormals(): boolean {
        return !!this.vao.getVertexAttribArray(Conventions.NORMALS_VBO_INDEX).getVbo();
    }

    public hasTangents(): boolean {
        return !!this.vao.getVertexAttribArray(Conventions.TANGENTS_VBO_INDEX).getVbo();
    }

    public hasVertexColors(): boolean {
        return !!this.vao.getVertexAttribArray(Conventions.VERTEX_COLORS_VBO_INDEX).getVbo();
    }

    public getAllDataSize(): number {
        return this.getDataSize();
    }

    public getDataSize(): number {
        return this.isUsable() ? this.vao.getAllDataSize() : 0;
    }

    public release(): void {
        if (this.isUsable()) {
            this.vao.releaseAll();
            this.vao = null;
        }
    }

    public isUsable(): boolean {
        return Utility.isUsable(this.vao);
    }

}
import { IResource } from '../resource/IResource';
import { Engine } from '../core/Engine';

export abstract class GlObject implements IResource {

    protected static readonly INVALID_ID = -1;
    private dataSize = 0;
    private id = GlObject.INVALID_ID;

    public constructor() {
        Engine.getResourceManager().add(this);
    }

    public getId(): number {
        return this.id;
    }

    protected setId(id: number): void {
        this.id = id;
    }

    public getAllDataSize(): number {
        return this.dataSize;
    }

    public getDataSize(): number {
        return this.dataSize;
    }

    protected setDataSize(size: number): void {
        this.dataSize = size;
    }

    public isUsable(): boolean {
        return this.id !== GlObject.INVALID_ID;
    }

    public abstract release(): void;

}
import { GlObject } from '../GlObject';
import { GlBufferObjectUsage, GlBufferObjectUsageResolver } from '../enum/GlBufferObjectUsage';
import { Gl } from '../Gl';

export abstract class GlBuffer extends GlObject {

    private allocated: boolean;
    private usage: GlBufferObjectUsage;

    public constructor() {
        super();
        this.setId(this.createId());
    }

    private createId(): number {
        return Gl.gl.createBuffer() as number;
    }

    protected abstract getTarget(): number;

    //bind
    public bind(): void {
        Gl.gl.bindBuffer(this.getTarget(), this.getId());
    }

    public bindToRead(): void {
        Gl.gl.bindBuffer(Gl.gl.COPY_READ_BUFFER, this.getId());
    }

    public bindToWrite(): void {
        Gl.gl.bindBuffer(Gl.gl.COPY_WRITE_BUFFER, this.getId());
    }

    //data allocation
    public isAllocated(): boolean {
        return this.allocated;
    }

    public allocate(size: number, usage: GlBufferObjectUsage): void {
        this.bind();
        this.allocationGeneral(size, usage);
        const glUsage = GlBufferObjectUsageResolver.enumToGl(usage);
        Gl.gl.bufferData(this.getTarget(), size, glUsage);
    }

    public allocateAndStore(data: BufferSource, usage: GlBufferObjectUsage): void {
        this.bind();
        this.allocationGeneral(data.byteLength, usage);
        const glUsage = GlBufferObjectUsageResolver.enumToGl(usage);
        Gl.gl.bufferData(this.getTarget(), data, glUsage);
    }

    protected allocationGeneral(size: number, usage: GlBufferObjectUsage): void {
        this.setDataSize(size);
        this.usage = usage;
        this.allocated = true;
    }

    //data store
    public store(data: BufferSource, offset = 0): void {
        this.bind();
        Gl.gl.bufferSubData(this.getTarget(), offset, data);
    }

    //misc
    public copyDataFrom(readSource: GlBuffer, readOffset: number, writeOffset: number, size: number): void {
        this.bindToWrite();
        readSource.bindToRead();
        Gl.gl.copyBufferSubData(Gl.gl.COPY_READ_BUFFER, Gl.gl.COPY_WRITE_BUFFER, readOffset, writeOffset, size);
    }

    public getUsage(): GlBufferObjectUsage {
        return this.usage;
    }

    public release(): void {
        Gl.gl.deleteBuffer(this.getId());
        this.setId(GlObject.INVALID_ID);
        this.setDataSize(0);
        this.allocated = false;
    }

}
import { GlQuery } from "./GlQuery";
import { Gl } from "../Gl";

export abstract class GlScopedQuery extends GlQuery {

    public beginQuery(): void {
        const target = this.getTarget();
        Gl.gl.beginQuery(target, this.getId());
    }

    public endQuery(): void {
        const target = this.getTarget();
        Gl.gl.endQuery(target);
        this.setAlreadyUsed();
    }

}
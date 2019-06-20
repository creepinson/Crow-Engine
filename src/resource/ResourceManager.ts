import { IResource } from "./IResource";
import { Utility } from "../utility/Utility";

export class ResourceManager {

    private static resources = new Array<IResource>();

    private constructor() { }

    public static private_add(resource: IResource): void {
        if (!ResourceManager.contains(resource)) {
            ResourceManager.resources.push(resource);
        }
    }

    public static contains(resource: IResource): boolean {
        return Utility.contains(ResourceManager.resources, resource);
    }

    public static getResourcesIterator(): IterableIterator<IResource> {
        return ResourceManager.resources.values();
    }

    public static getResources<T>(type: new () => T): Array<T> {
        let ret = new Array<T>();
        for (const resource of ResourceManager.resources) {
            if (resource instanceof type) {
                ret.push(resource);
            }
        }
        return ret;
    }

    public static releaseResources(): void {
        for (const resource of ResourceManager.resources) {
            resource.release();
        }
        ResourceManager.resources = [];
    }

}
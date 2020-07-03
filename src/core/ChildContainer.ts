import { GameObject } from './GameObject';
import { Utility } from '../utility/Utility';

export class ChildContainer {

    private children = new Array<GameObject>();
    private gameObject: GameObject;

    public constructor(gameObject: GameObject) {
        if (gameObject.getChildren()) {
            throw new Error();
        }
        this.gameObject = gameObject;
    }

    public contains(child: GameObject): boolean {
        return this.children.includes(child);
    }

    public containsDeep(child: GameObject): boolean {
        if (this.contains(child)) {
            return true;
        }
        return this.containsNonChildDescendant(child);
    }

    private containsNonChildDescendant(child: GameObject): boolean {
        for (const loopChild of this.children) {
            if (loopChild.getChildren().containsDeep(child)) {
                return true;
            }
        }
        return false;
    }

    public get(index: number): GameObject {
        return this.children[index];
    }

    public getCount(): number {
        return this.children.length;
    }

    public getIterator(): IterableIterator<GameObject> {
        return this.children.values();
    }

    public remove(child: GameObject): void {
        if (this.contains(child)) {
            child.setParent(null);
        }
    }

    public _removeChild(child: GameObject): void {
        const index = this.children.indexOf(child);
        Utility.removeElement(this.children, index);
    }

    public add(child: GameObject): void {
        child.setParent(this.gameObject);
    }

    public _addChild(child: GameObject): void {
        this.children.push(child);
    }

}
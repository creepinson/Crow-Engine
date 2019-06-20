import { GameObject } from "./GameObject";
import { Log } from "../utility/log/Log";

export class GameObjectContainer {

    private gameObjects = new Array<GameObject>();

    public private_updateComponents(): void {
        Log.lifeCycleInfo('updading components started');
        for (const gameObject of this.gameObjects) {
            gameObject.private_update();
        }
        Log.lifeCycleInfo('updading components finished');
    }

    public private_addGameObject(gameObject: GameObject): void {
        if (gameObject == null) {
            throw new Error();
        }
        const index = this.gameObjects.indexOf(gameObject);
        if (index === -1) {
            this.gameObjects.push(gameObject);
        }
    }

    public getGameObjectsIterator(): IterableIterator<GameObject> {
        return this.gameObjects.values();
    }

    public getGameObject(index: number): GameObject {
        return this.gameObjects[index];
    }

    public getGameObjectCount(): number {
        return this.gameObjects.length;
    }

}
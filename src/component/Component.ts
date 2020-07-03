import { GameObject } from '../core/GameObject';
import { InvalidatableContainer } from '../utility/invalidatable/InvalidatableContainer';
import { IComponent } from './IComponent';

export class Component implements IComponent {

    private readonly invalidatables = new InvalidatableContainer(this);
    private gameObject: GameObject;
    private active = true;
    private valid = false;

    public getInvalidatables(): InvalidatableContainer {
        return this.invalidatables;
    }

    public invalidate(sender?: any): void {
        this.valid = false;
        this.invalidatables.invalidate();
    }

    protected isValid(): boolean {
        return this.valid;
    }

    protected setValid(valid: boolean): void {
        this.valid = valid;
    }

    public isActive(): boolean {
        return this.active;
    }

    public setActive(active: boolean): void {
        this.active = active;
        this.invalidate();
    }

    public getGameObject(): GameObject {
        return this.gameObject;
    }

    public _attachToGameObject(gameObject: GameObject): void {
        this.gameObject = gameObject;
        this.invalidate();
        this.handleAttach(gameObject);
    }

    protected handleAttach(attached: GameObject): void {

    }

    public _detachFromGameObject(): void {
        const detached = this.gameObject;
        this.gameObject = null;
        this.invalidate();
        this.handleDetach(detached);
    }

    protected handleDetach(detached: GameObject): void {

    }

    public updateComponent(): void { }

}
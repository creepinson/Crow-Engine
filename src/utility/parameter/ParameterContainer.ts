import { ParameterKey } from './ParameterKey';
import { IInvalidatable } from '../invalidatable/IInvalidatable';
import { Utility } from '../Utility';

export class ParameterContainer {

    private parameters = new Map<string, any>();
    private invalidatables = new Map<string, Array<IInvalidatable>>();

    public get<T>(key: ParameterKey<T>): T {
        return this.parameters.get(key.getKey());
    }

    public set<T>(key: ParameterKey<T>, parameter: T): void {
        const oldParameter = this.get(key);
        this.parameters.set(key.getKey(), parameter);
        const invalidatables = this.invalidatables.get(key.getKey());
        this.removeInvalidatablesFromParameter(oldParameter, true, invalidatables);
        this.addInvalidatablesToParameter(parameter, true, invalidatables);
        this.invalidateInvalidatables(invalidatables);
    }

    private removeInvalidatablesFromParameter(parameter: any, invalidate: boolean, invalidatables: Array<IInvalidatable>): void {
        if (parameter && typeof parameter.getParameterInvalidatables === 'function') {
            if (invalidate) {
                parameter.invalidate(this);
            }
            if (invalidatables) {
                for (const invalidatable of invalidatables) {
                    parameter.getParameterInvalidatables().removeInvalidatable(invalidatable);
                }
            }
        }
    }

    private addInvalidatablesToParameter(parameter: any, invalidate: boolean, invalidatables: Array<IInvalidatable>): void {
        if (parameter && typeof parameter.getParameterInvalidatables === 'function') {
            if (invalidate) {
                parameter.invalidate(this);
            }
            if (invalidatables) {
                for (const invalidatable of invalidatables) {
                    parameter.getParameterInvalidatables().addInvalidatable(invalidatable);
                }
            }
        }
    }

    private invalidateInvalidatables(invalidatables: Array<IInvalidatable>) {
        if (invalidatables) {
            for (const invalidatable of invalidatables) {
                invalidatable.invalidate();
            }
        }
    }

    public addInvalidatable<T>(key: ParameterKey<T>, invalidatable: IInvalidatable): void {
        if (!key || !invalidatable) {
            throw Error();
        }
        this.addInvalidatableUnsafe(key, invalidatable);
    }

    private addInvalidatableUnsafe<T>(key: ParameterKey<T>, invalidatable: IInvalidatable): void {
        let invalidatables = this.invalidatables.get(key.getKey());
        if (!invalidatables) {
            invalidatables = new Array<IInvalidatable>();
            this.invalidatables.set(key.getKey(), invalidatables);
        }
        if (!invalidatables.includes(invalidatable)) {
            const parameter = this.get(key);
            this.addInvalidatablesToParameter(parameter, false, [invalidatable]);
            invalidatables.push(invalidatable);
        }
    }

    public removeInvalidatable<T>(key: ParameterKey<T>, invalidatable: IInvalidatable): void {
        if (!key || !invalidatable) {
            throw Error();
        }
        this.removeInvalidatableUnsafe(key, invalidatable);
    }

    private removeInvalidatableUnsafe<T>(key: ParameterKey<T>, invalidatable: IInvalidatable): void {
        const invalidatables = this.invalidatables.get(key.getKey());
        if (invalidatables && invalidatables.includes(invalidatable)) {
            const parameter = this.get(key);
            this.removeInvalidatablesFromParameter(parameter, false, [invalidatable]);
            const index = invalidatables.indexOf(invalidatable);
            Utility.removeElement(invalidatables, index);
            if (invalidatables.length === 0) {
                this.invalidatables.delete(key.getKey());
            }
        }
    }

    public containsInvalidatable<T>(key: ParameterKey<T>, invalidatable: IInvalidatable): boolean {
        const invalidatables = this.invalidatables.get(key.getKey());
        return invalidatables ? invalidatables.includes(invalidatable) : false;
    }

    public getInvalidatableIterator<T>(key: ParameterKey<T>): IterableIterator<IInvalidatable> {
        const invalidatables = this.invalidatables.get(key.getKey());
        return invalidatables ? invalidatables.values() : [].values();
    }

    public getInvalidatableCount<T>(key: ParameterKey<T>): number {
        const invalidatables = this.invalidatables.get(key.getKey());
        return invalidatables ? invalidatables.length : 0;
    }

}
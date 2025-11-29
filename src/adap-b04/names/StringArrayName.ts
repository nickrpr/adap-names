import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { MethodFailedException } from "../common/MethodFailedException";
import { InvalidStateException } from "../common/InvalidStateException";

export class StringArrayName extends AbstractName {

    protected components: string[] = [];

    constructor(source: string[], delimiter?: string) {
        super(delimiter);

        // Precondition: Source must not be null and an array
        IllegalArgumentException.assert(source != null, "Source cannot be null");
        IllegalArgumentException.assert(Array.isArray(source), "Source must be an array");

        this.components = source.slice();

        this.assertInvariant();
    }

    public clone(): Name {
        const clone = new StringArrayName(this.components, this.delimiter);
        MethodFailedException.assert(this.isEqual(clone), "Clone must be equal to original");
        return clone;
    }

    public getNoComponents(): number {
        return this.components.length;
    }

    public getComponent(i: number): string {
        // Precondition: Index must be within bounds
        IllegalArgumentException.assert(i >= 0 && i < this.components.length, "Index out of bounds");

        const comp = this.components[i];

        // Postcondition: The result must not be undefined
        MethodFailedException.assert(comp != undefined, "Retrieved component is undefined");

        return comp;
    }

    public setComponent(i: number, c: string) {
        // Preconditions
        IllegalArgumentException.assert(i >= 0 && i < this.components.length, "Index out of bounds");
        IllegalArgumentException.assert(c != null, "Component cannot be null");

        this.components[i] = c;

        MethodFailedException.assert(this.components[i] === c, "Set component failed");
    }

    public insert(i: number, c: string) {
        // Preconditions:
        // 1. Index can be equal to length (append at the end)
        IllegalArgumentException.assert(i >= 0 && i <= this.components.length, "Index out of bounds");
        // 2. Component must not be null
        IllegalArgumentException.assert(c != null, "Component cannot be null");

        const oldLength = this.components.length;

        this.components.splice(i, 0, c);

        // Postcondition: Length must have increased by 1
        MethodFailedException.assert(this.components.length === oldLength + 1, "Insert failed to increase length");

        this.assertInvariant();
    }

    public append(c: string) {
        // Precondition
        IllegalArgumentException.assert(c != null, "Component cannot be null");

        const oldLength = this.components.length;

        this.components.push(c);

        // Postcondition: Length must have increased by 1
        MethodFailedException.assert(this.components.length === oldLength + 1, "Insert failed to increase length");

        this.assertInvariant();
    }

    public remove(i: number) {
        // Precondition:
        IllegalArgumentException.assert(i >= 0 && i < this.components.length, "Index out of bounds");

        const oldLength = this.components.length;

        this.components.splice(i, 1);

        // Postcondition: Length must have decreased by 1
        MethodFailedException.assert(this.components.length === oldLength - 1, "Remove failed to decrease length");

        this.assertInvariant();
    }


    // Checks the integrity of the object:
    protected assertInvariant(): void {
        // Also call the invariant of the parent class (delimiter check)
        super.assertInvariant();

        // This class invariant
        InvalidStateException.assert(this.components != null, "Internal components array is null");
    }
}
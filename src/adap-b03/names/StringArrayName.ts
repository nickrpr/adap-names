import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

export class StringArrayName extends AbstractName {

    protected components: string[] = [];

    /** Expects that all source components are properly masked */
    constructor(source: string[], delimiter?: string) {
        super(delimiter);

        if (!Array.isArray(source)) {
            throw new TypeError("StringArrayName expects an array of components");
        }
        this.components = source.slice();
    }

    public clone(): Name {
        return new StringArrayName(this.components, this.delimiter);
    }

    public getNoComponents(): number {
        return this.components.length;
    }

    public getComponent(i: number): string {
        if (i < 0 || i >= this.components.length) {
            throw new Error("Index " + i + " is out of bounds");
        }
        return this.components[i];
    }

    public setComponent(i: number, c: string) {
        if (i < 0 || i >= this.components.length) {
            throw new Error("Index " + i + " is out of bounds");
        }
        this.components[i] = c;
    }

    public insert(i: number, c: string) {
        if (i < 0 || i > this.components.length) {
            throw new Error("Index " + i + " is out of bounds")
        }
        this.components.splice(i, 0, c);
    }

    public append(c: string) {
        this.components.push(c);
    }

    public remove(i: number) {
        if (i < 0 || i >= this.components.length) {
            throw new Error("Index " + i + " is out of bounds");
        }
        this.components.splice(i, 1);
    }

}
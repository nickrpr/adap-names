import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

export class StringArrayName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;
    protected components: string[] = [];

    constructor(source: string[], delimiter?: string) {
        if (!Array.isArray(source)) {
            throw new TypeError("StringArrayName expects an array of components");
        }

        this.components = source.slice(); // slice() to create a copy
        if (delimiter) {
            this.delimiter = delimiter;
        }
    }

    public asString(delimiter: string = this.delimiter): string {
        const humanReadableComponents = this.components.map(component =>
            component
                // erst Maskierung des Delimiters entfernen, also "\." -> "."
                .replaceAll(ESCAPE_CHARACTER + this.delimiter, this.delimiter)
                // dann Maskierung des Escape Characters selbst entfernen, also "\\" -> "\"
                .replaceAll(ESCAPE_CHARACTER + ESCAPE_CHARACTER, ESCAPE_CHARACTER)
        );
        return humanReadableComponents.join(delimiter);
    }

    public asDataString(): string {
        return this.components.join(DEFAULT_DELIMITER);
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    public isEmpty(): boolean {
        return this.components.length === 0;
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

    public setComponent(i: number, c: string): void {
        if (i < 0 || i >= this.components.length) {
            throw new Error("Index " + i + " is out of bounds");
        }
        this.components[i] = c;
    }

    public insert(i: number, c: string): void {
        if (i < 0 || i > this.components.length) {
            throw new Error("Index " + i + " is out of bounds")
        }
        this.components.splice(i, 0, c);
    }

    public append(c: string): void {
        this.components.push(c);
    }

    public remove(i: number): void {
        if (i < 0 || i >= this.components.length) {
            throw new Error("Index " + i + " is out of bounds");
        }
        this.components.splice(i, 1);
    }

    public concat(other: Name): void {
        for (let i = 0; i < this.components.length; i++) {
            this.components.push(other.getComponent(i));
        }
    }

}
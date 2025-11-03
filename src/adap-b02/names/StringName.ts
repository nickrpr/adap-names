import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

export class StringName implements Name {
    // StringName represents a name as a single string

    protected delimiter: string = DEFAULT_DELIMITER;
    protected name: string = "";
    protected noComponents: number = 0;

    constructor(source: string, delimiter?: string) {
        this.name = source;
        if (delimiter) {
            this.delimiter = delimiter;
        }
        this.noComponents = this.splitStringInComponents(source).length;
    }

    private splitStringInComponents(source: string): string[] {
        if (source === "") {
            return [""];
        }
        // Example: source = "..." should lead to components = [[""], [""], [""], [""]] (if "." is the delimiter)
        const components: string[] = [];
        let currentStr = "";
        let isEscaped = false;

        for (const char of source) {
            if (isEscaped && char === ESCAPE_CHARACTER) {
                isEscaped = false;
                currentStr += char;
            } else if (char === ESCAPE_CHARACTER) {
                isEscaped = true;
                currentStr += char;
            } else if (char === this.delimiter && !isEscaped) {
                components.push(currentStr);
                currentStr = "";
            } else {
                currentStr += char;
            }
        }

        components.push(currentStr);
        return components;
    }

    public asString(delimiter: string = this.delimiter): string {
        const components = this.splitStringInComponents(this.name);

        // Special characters are not escaped (daher werden die escape chars hier entfernt):
        const humanReadableComponents = components.map(component =>
            component
                // erst Maskierung des Delimiters entfernen, also "\." -> "."
                .replaceAll(ESCAPE_CHARACTER + this.delimiter, this.delimiter)
                // dann Maskierung des Escape Characters selbst entfernen, also "\\" -> "\"
                .replaceAll(ESCAPE_CHARACTER + ESCAPE_CHARACTER, ESCAPE_CHARACTER)
        );

        return humanReadableComponents.join(delimiter);
    }


    /**
     * Converts the internal name to a normalized data string by splitting it
     * into components (respecting escaped delimiters) and rejoining them
     * using the DEFAULT_DELIMITER. This ensures that escaped delimiters like
     * "\#" remain intact and only actual delimiters are replaced.
     */
    public asDataString(): string {
        // return this.name.replaceAll(this.delimiter, DEFAULT_DELIMITER); // so wäre es falsch, da falls z. B.
        // this.delimeter = '#' und this.name =  "test\#hi#top" --> dann sollte der # vor "hi" nicht durch den
        // DEFAULT_DELIMITER ausgetauscht werden, da er escaped ist.
        const components = this.splitStringInComponents(this.name);
        return components.join(DEFAULT_DELIMITER);
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    public isEmpty(): boolean {
        return this.noComponents === 0;
    }

    public getNoComponents(): number {
        return this.noComponents;
    }

    public getComponent(x: number): string {
        if (x < 0 || x >= this.noComponents) {
            throw new Error("Index " + x + " is out of bounds");
        }
        return this.splitStringInComponents(this.name)[x];
    }

    public setComponent(n: number, c: string): void {
        const components = this.splitStringInComponents(this.name);

        if (n < 0 || n >= components.length) {
            throw new Error("Index " + n + " is out of bounds");
        }
        components[n] = c;

        this.name = components.join(this.delimiter);
        this.noComponents = components.length;
    }

    public insert(n: number, c: string): void {
        const components = this.splitStringInComponents(this.name);

        if (n < 0 || n > components.length) {
            throw new Error("Index " + n + " is out of bounds");
        }
        components.splice(n, 0, c);

        this.name = components.join(this.delimiter);
        this.noComponents = components.length;
    }

    public append(c: string): void {
        // I assume that the string c is still properly masked
        this.name = `${this.name}${this.delimiter}${c}`;
        this.noComponents++;

        // Alternative Implementierung:
        // const components = this.splitStringInComponents(this.name);
        //
        // components.push(c);
        //
        // this.name = components.join(this.delimiter);
        // this.noComponents = components.length;
    }

    public remove(n: number): void {
        const components = this.splitStringInComponents(this.name);

        if (n < 0 || n >= components.length) {
            throw new Error("Index " + n + " is out of bounds");
        }
        components.splice(n, 1);

        this.name = components.join(this.delimiter);
        this.noComponents = components.length;
    }

    public concat(other: Name): void {
        const all_components: string[] = [];
        for (let i = 0; i < this.getNoComponents(); i++) {
            all_components.push(this.getComponent(i));
        }
        for (let i = 0; i < other.getNoComponents(); i++) {
            all_components.push(other.getComponent(i));
        }

        this.noComponents = all_components.length;
        this.name = all_components.join(this.delimiter);
    }

}
import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

export class StringName extends AbstractName {

    protected name: string = "";
    protected noComponents: number = 0;

    /** Expects that the source string is properly masked */
    constructor(source: string, delimiter?: string) {
        super(delimiter);
        this.name = source;
        this.noComponents = this.splitStringInComponents(source).length;
    }

    private splitStringInComponents(source: string): string[] {
        if (source === "") {
            return [""];
        }

        const components: string[] = [];
        let current = "";
        let isEscaped = false;

        for (const ch of source) {
            if (isEscaped) {
                // ESCAPE_CHARACTER war aktiv: das aktuelle Zeichen wird übernommen
                current += ESCAPE_CHARACTER + ch; // Backslash bleibt aber auch erhalten, da components immer noch alle Maskierungen enthalten soll
                isEscaped = false;
            } else if (ch === ESCAPE_CHARACTER) {
                // Nächstes Zeichen wird maskiert
                isEscaped = true;
            } else if (ch === this.delimiter) {
                // Trenne nur, wenn kein Escape aktiv ist
                components.push(current);
                current = "";
            } else {
                current += ch;
            }
        }

        components.push(current);
        return components;
    }

    public clone(): Name {
        return new StringName(this.name, this.delimiter);
    }

    public getNoComponents(): number {
        return this.noComponents;
    }

    public getComponent(i: number): string {
        if (i < 0 || i >= this.noComponents) {
            throw new Error("Index " + i + " is out of bounds");
        }
        return this.splitStringInComponents(this.name)[i];
    }

    public setComponent(i: number, c: string) {
        if (i < 0 || i >= this.noComponents) {
            throw new Error("Index out of bounds");
        }
        const components = this.splitStringInComponents(this.name);
        components[i] = c;
        this.name = components.join(this.delimiter);
    }

    public insert(i: number, c: string) {
        if (i < 0 || i > this.noComponents) {
            throw new Error("Index out of bounds");
        }
        const components = this.splitStringInComponents(this.name);
        components.splice(i, 0, c);
        this.name = components.join(this.delimiter);
        this.noComponents++;
    }

    public append(c: string) {
        // I assume that the string c is still properly masked
        if (this.noComponents === 0) { //dieser Fall tritt ein, wenn eine Namenskomponente erstellt wurde mit nur einer Komponente und dann remove(0) aufgerufen wurde. Da der Endstring nicht mit einem delimiter starten soll, wird er hier direkt zum String c.
            this.name = c;
        } else {
            this.name += this.delimiter + c;
        }
        this.noComponents++;
    }

    public remove(i: number) {
        if (i < 0 || i >= this.noComponents) {
            throw new Error("Index out of bounds");
        }
        const components = this.splitStringInComponents(this.name);
        components.splice(i, 1);
        this.name = components.join(this.delimiter);
        this.noComponents--;
    }

}
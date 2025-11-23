import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

export abstract class AbstractName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;

    constructor(delimiter: string = DEFAULT_DELIMITER) {
        this.delimiter = delimiter;
    }

    public abstract clone(): Name;

    public asString(delimiter: string = this.delimiter): string {
        const humanReadableComponents: string[] = [];
        for (let i = 0; i < this.getNoComponents(); i++) {
            let component = this.getComponent(i);
            // Unmasking logic relative to the internal delimiter
            component = component
                // erst Maskierung des Delimiters entfernen, also "\." -> "."
                .replaceAll(ESCAPE_CHARACTER + this.delimiter, this.delimiter)
                // dann Maskierung des Escape Characters selbst entfernen, also "\\" -> "\"
                .replaceAll(ESCAPE_CHARACTER + ESCAPE_CHARACTER, ESCAPE_CHARACTER);
            humanReadableComponents.push(component);
        }
        return humanReadableComponents.join(delimiter);
    }

    public toString(): string {
        return this.asDataString();
    }

    // public asDataString(): string {
    //     const components: string[] = [];
    //     for (let i = 0; i < this.getNoComponents(); i++) {
    //         components.push(this.getComponent(i));
    //     }
    //     return components.join(DEFAULT_DELIMITER);
    // } // -> diese Implementierung war etwas zu einfach gedacht für komplexere Fälle. Dazu gehören v.a. die Tests zu asDataString
    // Beispiel:
    // "hi\#der\.topf\\test"
    // asDataString soll daraus machen: "hi#der\\\.topf\\test" --> auch die 3 backslashes sind wichtig, da "\." so im String vorkommen soll, daher muss der backlash selbst und danach der Punkt maskiert werden
    public asDataString(): string {
        const components: string[] = [];
        for (let i = 0; i < this.getNoComponents(); i++) {
            let comp = this.getComponent(i);

            // Demaskieren (Originalwert wiederherstellen)
            // Entfernen der Maskierung für den aktuellen Delimiter und für Backslashes
            let rawComp = comp.replaceAll(ESCAPE_CHARACTER + this.delimiter, this.delimiter)
                .replaceAll(ESCAPE_CHARACTER + ESCAPE_CHARACTER, ESCAPE_CHARACTER);

            // Neu maskieren für den DEFAULT_DELIMITER
            // Backslashes und den DEFAULT_DELIMITER maskieren, damit das Einlesen funktioniert
            let maskedForDefault = "";
            for (const char of rawComp) {
                if (char === DEFAULT_DELIMITER || char === ESCAPE_CHARACTER) {
                    maskedForDefault += ESCAPE_CHARACTER;
                }
                maskedForDefault += char;
            }

            components.push(maskedForDefault);
        }
        return components.join(DEFAULT_DELIMITER);
    }


    public isEqual(other: Name): boolean {
        if (this.getNoComponents() !== other.getNoComponents()) {
            return false;
        }

        // Delimiter-Check für exakte Gleichheit -> // Assuming that the delimiters have to be identical as well
        if (this.getDelimiterCharacter() !== other.getDelimiterCharacter()) {
            return false;
        }

        for (let i = 0; i < this.getNoComponents(); i++) {
            if (this.getComponent(i) !== other.getComponent(i)) {
                return false;
            }
        }
        return true;
    }

    public getHashCode(): number {
        let hashCode: number = 0;
        const s: string = this.asDataString();
        for (let i = 0; i < s.length; i++) {
            let c = s.charCodeAt(i);
            hashCode = (hashCode << 5) - hashCode + c;
            hashCode |= 0;
        }
        return hashCode;
    }

    public isEmpty(): boolean {
        return this.getNoComponents() === 0;
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    abstract getNoComponents(): number;

    abstract getComponent(i: number): string;
    abstract setComponent(i: number, c: string): void;

    abstract insert(i: number, c: string): void;
    abstract append(c: string): void;
    abstract remove(i: number): void;

    public concat(other: Name): void {
        for (let i = 0; i < other.getNoComponents(); i++) {
            this.append(other.getComponent(i));
        }
    }
}
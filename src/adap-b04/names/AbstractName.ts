import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import {IllegalArgumentException} from "../common/IllegalArgumentException";
import { MethodFailedException } from "../common/MethodFailedException";
import { InvalidStateException } from "../common/InvalidStateException";


export abstract class AbstractName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;

    constructor(delimiter: string = DEFAULT_DELIMITER) {
        this.assertIsValidDelimiter(delimiter); // precondition

        this.delimiter = delimiter;
    }

    protected assertIsValidDelimiter(delimiter: string): void {
        IllegalArgumentException.assert(delimiter.length == 1, "Delimiter must be a single character");
        IllegalArgumentException.assert(delimiter != ESCAPE_CHARACTER, "Delimiter cannot be the escape character");
    }


    // Check for class invariant: The internal delimiter must always be valid.
    // Since 'delimiter' is protected, subclasses could theoretically corrupt it.
    protected assertInvariant(): void {
        InvalidStateException.assert(this.delimiter.length == 1, "Invalid internal state: Delimiter length must be 1");
        InvalidStateException.assert(this.delimiter != ESCAPE_CHARACTER, "Invalid internal state: Delimiter cannot be escape char");
    }


    public abstract clone(): Name;

    public asString(delimiter: string = this.delimiter): string {
        this.assertIsValidDelimiter(delimiter); // precondition

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

    public asDataString(): string {
        const components: string[] = [];
        for (let i = 0; i < this.getNoComponents(); i++) {
            let comp = this.getComponent(i);

            // Demaskieren
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
        // no precondition on purpose, because other == null should be allowed
        if (!other) { // 'this' kann nicht null sein, da innerhalb dieser Methode, daher wäre false, falls 'other' null wäre (soll aber kein Fehler werfen, da es ja ein berechtigter Aufruf ist)
            return false;
        }

        // Duck Typing:
        // Ist 'other' wirklich ein Name Objekt bzw. sieht zumindest so aus (also hat die Methoden)
        if (typeof (other as any).getNoComponents !== 'function' ||
            typeof (other as any).getDelimiterCharacter !== 'function') {
            return false;
        }

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
        // Precondition: other darf nicht null sein
        IllegalArgumentException.assert(other != null, "Cannot concatenate null");

        // remember states for postcondition
        const oldLength = this.getNoComponents();
        const otherLength = other.getNoComponents();

        for (let i = 0; i < other.getNoComponents(); i++) {
            this.append(other.getComponent(i));
        }

        // Postcondition -> correct change of length?
        MethodFailedException.assert(this.getNoComponents() === oldLength + otherLength,
            "Concat failed: Length did not increase correctly"
        );

        // Check for invariant (since append has changed the state)
        this.assertInvariant();
    }

}
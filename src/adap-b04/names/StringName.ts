import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { MethodFailedException } from "../common/MethodFailedException";

export class StringName extends AbstractName {

    protected name: string = "";
    protected noComponents: number = 0;

    /** Expects that the source string is properly masked */
    constructor(source: string, delimiter?: string) {
        super(delimiter);

        // Precondition für source
        IllegalArgumentException.assert(source != null, "Source cannot be null");

        this.name = source;
        this.noComponents = this.splitStringInComponents(source).length;
        this.assertInvariant();
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
        const clone = new StringName(this.name, this.delimiter);
        MethodFailedException.assert(this.isEqual(clone), "Clone must be equal to original");
        return clone;
    }

    public getNoComponents(): number {
        return this.noComponents;
    }

    public getComponent(i: number): string {
        IllegalArgumentException.assert(i >= 0 && i < this.noComponents, "Index out of bounds");
        const result = this.splitStringInComponents(this.name)[i];

        // Postcondition: The result must not be undefined (this should not happen with correct logic)
        MethodFailedException.assert(result != undefined, "Component retrieval failed");

        return result;
    }

    public setComponent(i: number, c: string) {
        IllegalArgumentException.assert(i >= 0 && i < this.noComponents, "Index out of bounds");
        IllegalArgumentException.assert(c != null, "Component cannot be null");

        const components = this.splitStringInComponents(this.name);
        components[i] = c;
        this.name = components.join(this.delimiter);

        this.assertInvariant();
    }

    public insert(i: number, c: string) {
        // Insert erlaubt i == noComponents (Anfügen am Ende)
        IllegalArgumentException.assert(i >= 0 && i <= this.noComponents, "Index out of bounds");
        IllegalArgumentException.assert(c != null, "Component cannot be null");

        const oldLength = this.noComponents; // save for postcondition

        const components = this.splitStringInComponents(this.name);

        if (this.noComponents === 0) {
            // in diesem Fall wurde das letzte Element des "Arrays" entfernt durch remove, wodurch
            // this.noComponents === 0 ist. Allerdings kommt bei this.splitStringInComponents(this.name).length eine 1
            // raus, da die Funktion [""] zurückgibt um Äquivalent zu StringArrayName zu arbeiten, wenn man StringName
            // mit einem leeren source = "" String aufruft. (In StringArrayName new StringArrayName([""]))
            // Hier wird in diesem Fall also das leere Element [""] im components Array durch c überschrieben, da ja
            // eigentlich kein Element im components Array sein sollte, da this.noComponents === 0. Würde man dies
            // nicht tun, würde man ["c", ""] bekommen und damit bei asString() das folgende bekommen: "c.", aber
            // der Punkt ist hier eben nicht korrekt.
            components.splice(i, 1, c);
        } else {
            components.splice(i, 0, c);
        }

        this.name = components.join(this.delimiter);
        this.noComponents++;

        this.assertInvariant();
        // Postcondition: length must be larger
        MethodFailedException.assert(this.noComponents === oldLength + 1, "Insert failed to increase length");
    }

    public append(c: string) {
        IllegalArgumentException.assert(c != null, "Component cannot be null");

        const oldLength = this.noComponents;

        // I assume that the string c is still properly masked
        if (this.noComponents === 0) { //dieser Fall tritt ein, wenn eine Namenskomponente erstellt wurde mit nur einer Komponente und dann remove(0) aufgerufen wurde. Da der Endstring nicht mit einem delimiter starten soll, wird er hier direkt zum String c.
            this.name = c;
        } else {
            this.name += this.delimiter + c;
        }
        this.noComponents++;

        // class invariant & postcondition:
        this.assertInvariant();
        MethodFailedException.assert(this.noComponents === oldLength + 1, "Append failed to increase length");
    }

    public remove(i: number) {
        IllegalArgumentException.assert(i >= 0 && i < this.noComponents, "Index out of bounds");

        const oldLength = this.noComponents;

        const components = this.splitStringInComponents(this.name);
        components.splice(i, 1);
        this.name = components.join(this.delimiter);
        this.noComponents--;

        // class invariant & postcondition:
        this.assertInvariant();
        MethodFailedException.assert(this.noComponents === oldLength - 1, "Remove failed to decrease length");
    }


     // Checks for class invariance
     // Ist der Zähler 'noComponents' synchron mit der tatsächlichen Anzahl der Komponenten im String 'name'?
    protected assertInvariant(): void {
        const calculatedLength = this.splitStringInComponents(this.name).length;

        // special case -> Tolerieren, wenn noComponents 0 ist, aber split [""] (Länge 1) liefert
        if (this.noComponents === 0 && calculatedLength === 1 && this.name === "") {
            return; // Zustand ist gültig (leer)
        }

        InvalidStateException.assert(
            this.noComponents === calculatedLength,
            `Internal state mismatch: Counter says ${this.noComponents}, but parsing string yields ${calculatedLength}`
        );
    }

}
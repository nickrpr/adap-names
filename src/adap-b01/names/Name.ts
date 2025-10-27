export const DEFAULT_DELIMITER: string = '.';
export const ESCAPE_CHARACTER = '\\';  // --> console.log(ESCAPE_CHARACTER) = \

/**
 * A name is a sequence of string components separated by a delimiter character.
 * Special characters within the string may need masking, if they are to appear verbatim.
 * There are only two special characters, the delimiter character and the escape character.
 * The escape character can't be set, the delimiter character can.
 *
 * Homogenous name examples
 *
 * "oss.cs.fau.de" is a name with four name components and the delimiter character '.'.
 * "///" is a name with four empty components and the delimiter character '/'.
 * "Oh\.\.\." is a name with one component, if the delimiter character is '.'.
 */
export class Name {

    private delimiter: string = DEFAULT_DELIMITER;
    private components: string[] = [];

    /** Expects that all Name components are properly masked */
    // @methodtype initialization-method
    constructor(other: string[], delimiter?: string) {
        // Do not auto-correct/mask here (as per assignment & forum answer).
        if (!Array.isArray(other)) {
            throw new TypeError("Name expects an array of components");
        }
        // console.log("other:", other);
        // console.log("\\")
        this.components = other.slice();

        // console.log("components:", this.components);
        if (delimiter !== undefined && delimiter !== null) {
            this.delimiter = delimiter;
        }
    }

    /**
     * Returns a human-readable representation of the Name instance using user-set special characters
     * Special characters are not escaped (creating a human-readable string) // Special characters = delimiter und escape character (genau, siehe oben)
     * Users can vary the delimiter character to be used
     -----------------------------------------------------------------------
     // e.g.: const n = new Name(["oss", "cs", "fau", "de"]);
     // n.asString(); // Ergebnis: "oss.cs.fau.de"
     -----------------------------------------------------------------------
     ["oss\\", "cs", "fau\.", "de"].asString() --> Ergebnis: "oss\\.cs.fau\..de" --> im Fall von \. wird der backslash
     * entfernt, da der String so mehr human-readable ist. Der Backslash ist in diesem Fall schließlich lediglich dazu
     * da, um den Punkt zu escapen/maskieren, sodass dieser intern nicht als Trennzeichen verstanden wird. Ein
     * Backlash ohne Punkt danach hat aber keinen Grund der Maskierung, sondern soll als Backslash in dieser Komponente
     * bewusst so vorkommen, weshalb solche Backslashes bewusst erhalten bleiben.

     * Interner Speicher (this.components): ["oss", "cs", "fau", "de"]
     * n.asString() gibt zurück: "oss.cs.fau.de"
     * n.asDataString() gibt zurück: "oss.cs.fau.de" (Hier gibt es nichts zu maskieren, da keine Sonderzeichen in den Komponenten sind).
     */

    // @methodtype conversion-method
    public asString(delimiter: string = this.delimiter): string {
        const test =  this.components.map(component => component.replaceAll(ESCAPE_CHARACTER + this.delimiter, this.delimiter)).join(delimiter)
        console.log(test);
        return test;
    }


    /**
     * Returns a machine-readable representation of Name instance using default control characters
     * Machine-readable means that from a data string, a Name can be parsed back in
     * The special characters in the data string are the default characters --> daher habe ich unten DEFAULT_DELIMETER statt this.delimeter verwendet
     */
    // @methodtype conversion-method
    public asDataString(): string {
        // da laut Konstruktor this.components bereits properly masked ist, werden hier die einzelnen Komponenten des Arrays lediglich zusammen geführt, jeweils getrennt durch den Standard-Delimeter. Dadurch bleibt es machine-readable und kann später wieder eingelesen werden.
        return this.components.join(DEFAULT_DELIMITER);
    }

    /** Returns properly masked component string */
    // @methodtype get-method
    public getComponent(i: number): string {
        if (i < 0 || i >= this.components.length) {
            throw new Error("Index " + i + " is out of bounds");
        }
        return this.components[i];
    }

    /** Expects that new Name component c is properly masked */
    // @methodtype set-method
    public setComponent(i: number, c: string): void {
        if (i < 0 || i >= this.components.length) {
            throw new Error("Index " + i + " is out of bounds");
        }
        this.components[i] = c;
    }

    /** Returns number of components in Name instance */
    // @methodtype get-method
    public getNoComponents(): number {
        return this.components.length;
    }

    /** Expects that new Name component c is properly masked */
    // @methodtype command-method
    public insert(i: number, c: string): void {
        if (i < 0 || i > this.components.length) {
            throw new Error("Index " + i + " is out of bounds")
        }
        this.components.splice(i, 0, c);
    }

    /** Expects that new Name component c is properly masked */
    // @methodtype command-method
    public append(c: string): void {
        this.components.push(c);
    }

    // @methodtype command-method
    public remove(i: number): void {
        if (i < 0 || i >= this.components.length) {
            throw new Error("Index " + i + " is out of bounds");
        }
        this.components.splice(i, 1);
    }

}
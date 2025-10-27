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
        // console.log("other:", other);
        // console.log("\\")
        this.components = other.slice();

        // console.log("components:", this.components);
        if (delimiter !== undefined) {
            this.delimiter = delimiter;
        }
    }

    /**
     * Returns a human-readable representation of the Name instance using user-set special characters
     * Special characters are not escaped (creating a human-readable string) // Special characters = delimiter und escape character (genau, siehe oben)
     * Users can vary the delimiter character to be used
     */
    // e.g.: const n = new Name(["oss", "cs", "fau", "de"]);
    // n.asString(); // Ergebnis: "oss.cs.fau.de"
    // @methodtype conversion-method
    public asString(delimiter: string = this.delimiter): string {
        return this.components.join(delimiter);
    }
    //["oss\\", "cs", "fau\.", "de"].asString() --> Ergebnis: "oss\\.cs.fau\..de" --> wäre das so korrekt?
    /**
     * Interner Speicher (this.components): ["oss", "cs", "fau", "de"]
     * n.asString() gibt zurück: "oss.cs.fau.de"
     * n.asDataString() gibt zurück: "oss.cs.fau.de" (Hier gibt es nichts zu maskieren, da keine Sonderzeichen in den Komponenten sind).
     */



    /**
     * Returns a machine-readable representation of Name instance using default control characters
     * Machine-readable means that from a data string, a Name can be parsed back in
     * The special characters in the data string are the default characters --> daher habe ich unten DEFAULT_DELIMETER statt this.delimeter verwendet
     */
    // @methodtype conversion-method
    public asDataString(): string {
        // console.log(this.components);
        // check whether a control character is present inside each string, and if so, escape each control character, such that they stay inside the data string and the data string gets machine readable
        // => "fau\.de.cs" --> Der Punkt nach fau soll also kein Trennzeichen sein, sondern ist Teil der Komponente! --> also ["fau.de", "cs"]
        const escapedComponents = this.components.map(component => {
            return component
                .replaceAll(ESCAPE_CHARACTER, ESCAPE_CHARACTER + ESCAPE_CHARACTER)  // z.B.: \\ wird zu \\\\
                .replaceAll(DEFAULT_DELIMITER, ESCAPE_CHARACTER + DEFAULT_DELIMITER);     // z.B.: . wird zu \.
        });
        return escapedComponents.join(DEFAULT_DELIMITER);
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
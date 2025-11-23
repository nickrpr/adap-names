import { describe, it, expect } from "vitest";

import { StringName } from "../../../src/adap-b03/names/StringName";
import { StringArrayName } from "../../../src/adap-b03/names/StringArrayName";
import { DEFAULT_DELIMITER } from "../../../src/adap-b03/common/Printable";

describe("Comprehensive Name Implementation Tests", () => {

    // Helper, um Tests für beide Klassen gleichzeitig laufen zu lassen
    const implementations = [
        {
            classType: "StringName",
            create: (components: string[], delimiter: string = DEFAULT_DELIMITER) =>
                new StringName(components.join(delimiter), delimiter)
        },
        {
            classType: "StringArrayName",
            create: (components: string[], delimiter: string = DEFAULT_DELIMITER) =>
                new StringArrayName(components, delimiter)
        }
    ];

    implementations.forEach((impl) => {
        describe(`Tests for ${impl.classType}`, () => {

            // --- Basic Accessor Tests ---
            it("should initialize correctly and return basic properties", () => {
                const n = impl.create(["oss", "cs", "fau", "de"]);
                expect(n.getNoComponents()).toBe(4);
                expect(n.getComponent(0)).toBe("oss");
                expect(n.getComponent(3)).toBe("de");
                expect(n.isEmpty()).toBe(false);
                expect(n.getDelimiterCharacter()).toBe(DEFAULT_DELIMITER);
            });

            it("should handle custom delimiters correctly", () => {
                const n = impl.create(["oss", "fau", "de"], '#');
                expect(n.getDelimiterCharacter()).toBe('#');
                expect(n.asString()).toBe("oss#fau#de");
                expect(n.getDelimiterCharacter()).toBe("#");
            });

            // --- Modification Tests (Insert/Append/Remove) ---
            it("should insert at the beginning, middle, and end (valid indices)", () => {
                const n = impl.create(["a", "c"]);

                // Mitte
                n.insert(1, "b");
                expect(n.asString()).toBe("a.b.c");

                // Anfang
                n.insert(0, "start");
                expect(n.asString()).toBe("start.a.b.c");

                // Ende (Index == Länge ist erlaubt bei insert)
                n.insert(4, "end");
                expect(n.asString()).toBe("start.a.b.c.end");
            });

            it("should throw error on insert with invalid index", () => {
                const n = impl.create(["a"]);
                expect(() => n.insert(-1, "x")).toThrow();
                expect(() => n.insert(2, "x")).toThrow(); // Length ist 1, Max Index ist 1
            });

            it("should append correctly", () => {
                const n = impl.create(["a"]);
                n.append("b");
                expect(n.getNoComponents()).toBe(2);
                expect(n.asString()).toBe("a.b");
            });

            it("should remove correctly", () => {
                const n = impl.create(["a", "b", "c"]);
                n.remove(1); // remove 'b'
                expect(n.asString()).toBe("a.c");

                n.remove(0); // remove 'a'
                expect(n.asString()).toBe("c");

                n.remove(0); // remove 'c'
                expect(n.isEmpty()).toBe(true);
            });

            it("should throw error on remove with invalid index", () => {
                const n = impl.create(["a"]);
                expect(() => n.remove(-1)).toThrow();
                expect(() => n.remove(1)).toThrow(); // Index 1 existiert nicht
            });

            it("should set component correctly", () => {
                const n = impl.create(["a", "b", "c"]);
                n.setComponent(1, "B");
                expect(n.asString()).toBe("a.B.c");
                expect(() => n.setComponent(3, "X")).toThrow();
            });

            // --- Equality & HashCode Tests ---
            it("should identify equal objects correctly", () => {
                const n1 = impl.create(["a", "b"]);
                const n2 = impl.create(["a", "b"]);
                const n3 = impl.create(["a", "c"]);

                expect(n1.isEqual(n2)).toBe(true);
                expect(n1.isEqual(n3)).toBe(false);

                // HashCode Contract: Equal objects MUST have equal hash codes
                expect(n1.getHashCode()).toBe(n2.getHashCode());
            });

            // --- Cloning Tests ---
            it("should create a deep clone (independent instance)", () => {
                const original = impl.create(["a", "b"], "#");
                const clone = original.clone();

                expect(original.isEqual(clone)).toBe(true);
                expect(original).not.toBe(clone); // Referenz ungleich
                expect(clone.getDelimiterCharacter()).toBe("#")

                // Modifikation am Original darf Klon nicht ändern
                original.append("c");
                expect(clone.getNoComponents()).toBe(2);
                expect(original.isEqual(clone)).toBe(false);
            });

            // --- Concat Tests ---
            it("should concatenate another name correctly", () => {
                const n1 = impl.create(["a", "b"]);
                const n2 = impl.create(["c", "d"]);
                n1.concat(n2);
                expect(n1.asString()).toBe("a.b.c.d");
                expect(n1.getNoComponents()).toBe(4);
            });

            // --- Conversion Tests (asString, asDataString) ---
            it("should allow asString with different delimiter", () => {
                const n = impl.create(["a", "b"], '.');
                expect(n.asString('#')).toBe("a#b");
            });

            // Test für masking in asDataString
            it("should correctly escape special chars in asDataString", () => {
                // Szenario: Wir haben einen Namen mit Delimiter '#'.
                // Eine Komponente enthält einen Punkt "a.b".
                // Da '#' der Trenner ist, ist der Punkt hier ein normales Zeichen.
                const n = impl.create(["a.b", "c"], '#');

                // asString('#') sollte "a.b#c" sein (unverändert)
                expect(n.asString()).toBe("a.b#c");

                // asDataString() nutzt IMMER den DEFAULT_DELIMITER ('.').
                // Damit "a.b" beim Einlesen nicht zerfällt, muss der Punkt maskiert werden!
                // Erwartet: "a\.b.c" (Im Code als String-Literal: "a\\.b.c")
                expect(n.asDataString()).toBe("a\\.b.c");
            });

            it("should handle masked delimiter correctly in input but remove masking in asDataString if not needed", () => {
                const n = impl.create(["test\\#hi", "top"], "#");
                expect(n.asDataString()).toBe("test#hi.top");
            });

            it("should add masking in asDataString if the component contains the default delimiter", () => {
                const n = impl.create(["a.b", "c"], "#");

                expect(n.asString()).toBe("a.b#c");
                expect(n.asDataString()).toBe("a\\.b.c");
            });

            it("should handle escape characters correctly", () => {
                // Szenario: Komponente enthält einen Backslash
                const n = impl.create(["a\\b"], '.');
                expect(n.asString()).toBe("a\\b");
                expect(n.asDataString()).toBe("a\\\\b"); // Muss escaped werden zu \\
            });

            // --- Edge Cases ---
            it("should handle empty state correctly", () => {
                // Erzeugt einen Namen mit einer leeren Komponente (wie `new StringName("")`)
                const n = impl.create([""]);
                expect(n.getNoComponents()).toBe(1);

                n.append("test");
                expect(n.asString()).toBe(".test");
                n.remove(1);

                n.remove(0);
                expect(n.isEmpty()).toBe(true);
                expect(n.getNoComponents()).toBe(0);
                expect(n.asString()).toBe("");

                n.append("new");
                expect(n.asString()).toBe("new");
            });
        });
    });

    // --- Cross-Implementation Tests ---
    describe("Interoperability Tests", () => {
        it("should treat StringName and StringArrayName as equal if content matches", () => {
            const sn = new StringName("a.b.c");
            const san = new StringArrayName(["a", "b", "c"]);

            expect(sn.isEqual(san)).toBe(true);
            expect(san.isEqual(sn)).toBe(true);
            expect(sn.getHashCode()).toBe(san.getHashCode());
        });

        it("should allow concatenation of mixed types", () => {
            const sn = new StringName("a");
            const san = new StringArrayName(["b"]);

            sn.concat(san);
            expect(sn.asString()).toBe("a.b");
        });
    });

    // --- Specific Constructor Tests ---
    describe("Constructor Specifics", () => {
        it("StringArrayName should throw on invalid input", () => {
            expect(() => new StringArrayName("not an array" as any)).toThrow(TypeError);
        });

        it("StringArrayName should accept empty array", () => {
            const san = new StringArrayName([]);
            expect(san.isEmpty()).toBe(true);
        });
    });

});
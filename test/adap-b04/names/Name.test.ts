import { describe, it, expect } from "vitest";

import { StringName } from "../../../src/adap-b04/names/StringName";
import { StringArrayName } from "../../../src/adap-b04/names/StringArrayName";
import { Name } from "../../../src/adap-b04/names/Name";
import { IllegalArgumentException } from "../../../src/adap-b04/common/IllegalArgumentException";
import {InvalidStateException} from "../../../src/adap-b04/common/InvalidStateException";
import { DEFAULT_DELIMITER } from "../../../src/adap-b04/common/Printable";

describe("Design by Contract Tests for Names (B04)", () => {

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
        describe(`Contract Tests for ${impl.classType}`, () => {
            it("test", () =>{
                const n = impl.create([""]);
                // console.log(n);

                expect(n.getNoComponents()).toBe(1);
                expect(n.isEmpty()).toBe(false);

                n.append("test");
                expect(n.asString()).toBe(".test");
                n.remove(1);
                expect(n.isEmpty()).toBe(false);

                n.remove(0);
                expect(n.isEmpty()).toBe(true);
                expect(n.getNoComponents()).toBe(0);
                expect(n.asString()).toBe("");

                n.append("new");
                expect(n.asString()).toBe("new");

                n.append("");
                expect(n.asString()).toBe("new.")

                n.append("");
                expect(n.asString()).toBe("new..")

                expect(n.asDataString()).toBe("new..")

                expect(n.getComponent(0)).toBe("new");
                expect(n.getComponent(1)).toBe("");
                expect(n.getComponent(2)).toBe("");

                expect(() => n.getComponent(3)).toThrow(IllegalArgumentException);


            });
            // Constructor Preconditions:
            it("Constructor: should throw IllegalArgumentException for invalid delimiter (length != 1)", () => {
                expect(() => impl.create(["a", "b"], "")).toThrow(IllegalArgumentException);
                expect(() => impl.create(["a", "b"], "--")).toThrow(IllegalArgumentException);
            });

            it("should throw IllegalArgumentException if delimiter is the escape character", () => {
                expect(() => impl.create(["a", "b"], "\\")).toThrow(IllegalArgumentException);
                const n = impl.create(["a", "b"]);
                expect(() => n.asString("\\")).toThrow(IllegalArgumentException);
            });


            // Method Preconditions:
            describe("getComponent Contracts", () => {
                it("should throw IllegalArgumentException if index is out of bounds", () => {
                    const n = impl.create(["a", "b"]); // Length = 2, Indices: 0, 1
                    expect(() => n.getComponent(-1)).toThrow(IllegalArgumentException);
                    expect(() => n.getComponent(2)).toThrow(IllegalArgumentException);
                });
            });

            describe("setComponent Contracts", () => {
                it("should throw IllegalArgumentException if index is out of bounds", () => {
                    const n = impl.create(["a", "b"]);
                    expect(() => n.setComponent(-1, "c")).toThrow(IllegalArgumentException);
                    expect(() => n.setComponent(2, "c")).toThrow(IllegalArgumentException);
                });

                it("should throw IllegalArgumentException if component is null", () => {
                    const n = impl.create(["a", "b"]);
                    // @ts-ignore
                    expect(() => n.setComponent(0, null)).toThrow(IllegalArgumentException);
                });
            });

            describe("insert Contracts", () => {
                it("should throw IllegalArgumentException if index is out of bounds", () => {
                    const n = impl.create(["a"]); // Length = 1
                    expect(() => n.insert(-1, "b")).toThrow(IllegalArgumentException);
                    expect(() => n.insert(2, "b")).toThrow(IllegalArgumentException); // Insert at length (1) is allowed! But 2 is not.
                });

                it("should allow insert at index == length (append semantics)", () => {
                    const n = impl.create(["a"]);
                    expect(() => n.insert(1, "b")).not.toThrow(); // Should work
                });

                it("should throw IllegalArgumentException if component is null", () => {
                    const n = impl.create(["a"]);
                    // @ts-ignore
                    expect(() => n.insert(0, null)).toThrow(IllegalArgumentException);
                });
            });

            describe("append Contracts", () => {
                it("should throw IllegalArgumentException if component is null", () => {
                    const n = impl.create(["a"]);
                    // @ts-ignore
                    expect(() => n.append(null)).toThrow(IllegalArgumentException);
                });
            });

            describe("remove Contracts", () => {
                it("should throw IllegalArgumentException if index is out of bounds", () => {
                    const n = impl.create(["a", "b"]);
                    expect(() => n.remove(-1)).toThrow(IllegalArgumentException);
                    expect(() => n.remove(2)).toThrow(IllegalArgumentException);
                });
            });

            describe("concat Contracts", () => {
                it("should throw IllegalArgumentException if other name is null", () => {
                    const n = impl.create(["a"]);
                    // @ts-ignore
                    expect(() => n.concat(null)).toThrow(IllegalArgumentException);
                });
            });

            describe("asString Contracts", () => {
                it("should throw IllegalArgumentException if delimiter length is not 1", () => {
                    const n = impl.create(["a", "b"]);
                    expect(() => n.asString("")).toThrow(IllegalArgumentException);
                    expect(() => n.asString("::")).toThrow(IllegalArgumentException);
                });
            });

        });
    });


    // Specific Constructor Tests (Direct Instantiation):
    describe("Specific Constructor Preconditions", () => {
        it("StringName: should throw IllegalArgumentException if source string is null", () => {
            // @ts-ignore
            expect(() => new StringName(null)).toThrow(IllegalArgumentException);
        });

        it("StringArrayName: should throw IllegalArgumentException if source array is null", () => {
            // @ts-ignore
            expect(() => new StringArrayName(null)).toThrow(IllegalArgumentException);
        });

        it("StringArrayName: should throw IllegalArgumentException if source is not an array (Runtime check)", () => {
            // @ts-ignore
            expect(() => new StringArrayName("I am a string")).toThrow(IllegalArgumentException);
        });
    });

});


// ============================================================
// B03: Functional Tests:
describe("B03: Comprehensive Name Implementation Tests", () => {

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
        describe(`Functional Tests for ${impl.classType}`, () => {

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
            });

            it("should insert at the beginning, middle, and end (valid indices)", () => {
                const n = impl.create(["a", "c"]);
                n.insert(1, "b");
                expect(n.asString()).toBe("a.b.c");
                n.insert(0, "start");
                expect(n.asString()).toBe("start.a.b.c");
                n.insert(4, "end");
                expect(n.asString()).toBe("start.a.b.c.end");
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

            it("should set component correctly", () => {
                const n = impl.create(["a", "b", "c"]);
                n.setComponent(1, "B");
                expect(n.asString()).toBe("a.B.c");
            });

            it("should identify equal objects correctly", () => {
                const n1 = impl.create(["a", "b"]);
                const n2 = impl.create(["a", "b"]);
                const n3 = impl.create(["a", "c"]);
                expect(n1.isEqual(n2)).toBe(true);
                expect(n1.isEqual(n3)).toBe(false);
                expect(n1.getHashCode()).toBe(n2.getHashCode());
            });

            it("should return false for null or undefined (isEqual)", () => {
                const n = impl.create(["a"]);
                // @ts-ignore
                expect(n.isEqual(null)).toBe(false);
                // @ts-ignore
                expect(n.isEqual(undefined)).toBe(false);
            });

            it("should return false for foreign objects (Duck Typing)", () => {
                const n = impl.create(["a"]);
                const fake = { getNoComponents: () => 1 }; // Hat nicht alle Methoden
                // @ts-ignore
                expect(n.isEqual(fake)).toBe(false);
            });

            it("should create a deep clone (independent instance)", () => {
                const original = impl.create(["a", "b"], "#");
                const clone = original.clone();
                expect(original.isEqual(clone)).toBe(true);
                expect(original).not.toBe(clone);
                original.append("c");
                expect(clone.getNoComponents()).toBe(2);
                expect(original.isEqual(clone)).toBe(false);
            });

            it("should concatenate another name correctly", () => {
                const n1 = impl.create(["a", "b"]);
                const n2 = impl.create(["c", "d"]);
                n1.concat(n2);
                expect(n1.asString()).toBe("a.b.c.d");
                expect(n1.getNoComponents()).toBe(4);
            });

            it("should correctly escape special chars in asDataString", () => {
                const n = impl.create(["a.b", "c"], '#');
                expect(n.asString()).toBe("a.b#c");
                expect(n.asDataString()).toBe("a\\.b.c");
            });

            it("should handle empty state correctly", () => {
                const n = impl.create([""]);
                expect(n.getNoComponents()).toBe(1);
                n.append("test");
                expect(n.asString()).toBe(".test");
                n.remove(1);
                n.remove(0);
                expect(n.isEmpty()).toBe(true);
            });
        });
    });

    describe("Constructor Specifics", () => {
        it("StringArrayName should throw on invalid input", () => {
            expect(() => new StringArrayName("not an array" as any)).toThrow(IllegalArgumentException);
        });
    });
});



// ============================================================
// Advanced Contract test:
class BuggyStringName extends StringName {
    // Methode zum absichtlichen Zerstören der Invariante
    public corruptState() {
        // Zähler auf falschen Wert setzen:
        this.noComponents = -99;
    }
}

describe("Advanced Contract Tests (State Corruption)", () => {
    it("should throw InvalidStateException if internal state is corrupted", () => {
        const n = new BuggyStringName("a.b");
        n.corruptState();

        // Jeder Aufruf einer Methode, die assertInvariant() nutzt, sollte fehler werfen
        expect(() => n.append("c")).toThrow(InvalidStateException);
    });
});
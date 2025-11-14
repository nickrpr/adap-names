import { describe, it, expect } from "vitest";

import { Name } from "../../../src/adap-b02/names/Name";
import { StringName } from "../../../src/adap-b02/names/StringName";
import { StringArrayName } from "../../../src/adap-b02/names/StringArrayName";

describe("Basic StringName function tests", () => {
  it("test insert", () => {
    let n: Name = new StringName("oss.fau.de");
    n.insert(1, "cs");
    expect(n.asString()).toBe("oss.cs.fau.de");
  });
  it("test append", () => {
    let n: Name = new StringName("oss.cs.fau");
    n.append("de");
    expect(n.asString()).toBe("oss.cs.fau.de");
  });
  it("test remove", () => {
    let n: Name = new StringName("oss.cs.fau.de");
    n.remove(0);
    expect(n.asString()).toBe("cs.fau.de");
  });
});

describe("Basic StringArrayName function tests", () => {
  it("test insert", () => {
    let n: Name = new StringArrayName(["oss", "fau", "de"]);
    n.insert(1, "cs");
    expect(n.asString()).toBe("oss.cs.fau.de");
  });
  it("test append", () => {
    let n: Name = new StringArrayName(["oss", "cs", "fau"]);
    n.append("de");
    expect(n.asString()).toBe("oss.cs.fau.de");
  });
  it("test remove", () => {
    let n: Name = new StringArrayName(["oss", "cs", "fau", "de"]);
    n.remove(0);
    expect(n.asString()).toBe("cs.fau.de");
  });
});

describe("Delimiter function tests", () => {
  it("test insert", () => {
    let n: Name = new StringName("oss#fau#de", '#');
    n.insert(1, "cs");
    expect(n.asString()).toBe("oss#cs#fau#de");
  });
});

describe("Escape character extravaganza", () => {
  it("test escape and delimiter boundary conditions", () => {
    let n: Name = new StringName("oss.cs.fau.de", '#');
    expect(n.getNoComponents()).toBe(1);
    expect(n.asString()).toBe("oss.cs.fau.de");
    n.append("people");
    expect(n.asString()).toBe("oss.cs.fau.de#people");
  });
});



//
// Erweiterte Tests
//
describe("Cross-implementation consistency tests", () => {
    it("should produce identical output for identical operations", () => {
        const s1: Name = new StringName("a.b.c");
        const s2: Name = new StringArrayName(["a", "b", "c"]);

        s1.insert(1, "x");
        s2.insert(1, "x");
        expect(s1.asString()).toBe(s2.asString());

        s1.append("y");
        s2.append("y");
        expect(s1.asString()).toBe(s2.asString());

        s1.remove(0);
        s2.remove(0);
        expect(s1.asString()).toBe(s2.asString());
    });

    it("should handle custom delimiters consistently", () => {
        const s1: Name = new StringName("root#child#leaf", "#");
        const s2: Name = new StringArrayName(["root", "child", "leaf"]);
        s1.append("extra");
        s2.append("extra");
        expect(s1.asString("#")).toBe(s2.asString("#"));
    });
});

describe("Advanced delimiter handling", () => {
    it("should correctly parse when multiple delimiters appear in a row", () => {
        const n: Name = new StringName("a..b...c");
        expect(n.getNoComponents()).toBe(6);
        expect(n.asString()).toBe("a..b...c");
    });

    it("should correctly handle escaped delimiters", () => {
        const n: Name = new StringName("a\\.b\\b.c."); // “a.b.c” where '.' is escaped in the first part  // guter test: a\.b\b.c.
        expect(n.getNoComponents()).toBe(3);
        expect(n.asString()).toBe("a.b\\b.c.");
    });
});

describe("Edge cases", () => {
    it("should handle empty source strings gracefully", () => {
        const n: Name = new StringName("");
        expect(n.getNoComponents()).toBe(1);
        n.append("test");
        expect(n.asString()).toBe(".test");
    });

    it("check empty string, remove, append for StringName", () => {
        const n: Name = new StringName("");
        expect(n.asString()).toBe("");
        expect(n.getNoComponents()).toBe(1);
        expect(n.isEmpty()).toBe(false);
        n.remove(0);
        expect(n.isEmpty()).toBe(true);
        expect(n.getNoComponents()).toBe(0);
        n.append("test");
        expect(n.asString()).toBe("test");
    });

    it("check empty string, remove, INSERT for StringName", () => {
        const n: Name = new StringName("");
        expect(n.asString()).toBe("");
        expect(n.getNoComponents()).toBe(1);
        expect(n.isEmpty()).toBe(false);
        n.remove(0);
        expect(n.isEmpty()).toBe(true);
        expect(n.getNoComponents()).toBe(0);
        n.insert(0, "test");
        expect(n.asString()).toBe("test");
    });

    it("check empty string, remove, append for StringArrayName", () => {
        const ar: Name = new StringArrayName([""]);
        expect(ar.getNoComponents()).toBe(1);
        expect(ar.asString()).toBe("");
        expect(ar.isEmpty()).toBe(false);
        ar.remove(0);
        expect(ar.isEmpty()).toBe(true);
        ar.append("test");
        expect(ar.asString()).toBe("test");
    });

    it("should handle single-component names", () => {
        const n: Name = new StringArrayName(["single"]);
        expect(n.getNoComponents()).toBe(1);
        expect(n.asString()).toBe("single");
    });

    it("should remove the last component correctly", () => {
        const n: Name = new StringArrayName(["one", "two"]);
        n.remove(1);
        expect(n.asString()).toBe("one");
    });
});

describe("Delimiter conversion behavior", () => {
    it("should allow changing delimiters on output", () => {
        const n: Name = new StringArrayName(["oss", "cs", "fau", "de"]);
        expect(n.asString("-")).toBe("oss-cs-fau-de");
    });

    it("should maintain internal consistency after delimiter change", () => {
        const n: Name = new StringName("oss#cs#fau#de", "#");
        expect(n.asString(".")).toBe("oss.cs.fau.de");
        n.insert(2, "ai");
        expect(n.asString(".")).toBe("oss.cs.ai.fau.de");
    });
});

describe("Interface integrity tests", () => {
    it("should behave identically when using only Name interface", () => {
        const variants: Name[] = [
            new StringName("root.middle.leaf"),
            new StringArrayName(["root", "middle", "leaf"]),
        ];

        for (const n of variants) {
            n.insert(2, "extra");
            n.append("tail");
            n.remove(0);
            expect(n.asString()).toBe("middle.extra.leaf.tail");
        }
    });
});

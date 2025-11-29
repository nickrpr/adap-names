import { describe, it, expect } from "vitest";

import { File } from "../../../src/adap-b04/files/File";
import { Directory } from "../../../src/adap-b04/files/Directory";
import { RootNode } from "../../../src/adap-b04/files/RootNode";
import { IllegalArgumentException } from "../../../src/adap-b04/common/IllegalArgumentException";

describe("File System Contract Tests (B04)", () => {

    function createTestEnv() {
        const root = new RootNode();
        const dir = new Directory("testDir", root);
        const file = new File("testFile", dir);
        return { root, dir, file };
    }

    describe("File State Contracts", () => {

        it("should allow opening a closed file", () => {
            const { file } = createTestEnv();
            // Initial state is CLOSED
            expect(() => file.open()).not.toThrow();
        });

        it("should throw when opening an already open file", () => {
            const { file } = createTestEnv();
            file.open();
            // Precondition failure: File is already OPEN
            expect(() => file.open()).toThrow(IllegalArgumentException);
        });

        it("should throw when reading from a closed file", () => {
            const { file } = createTestEnv();
            // State is CLOSED
            expect(() => file.read(1)).toThrow(IllegalArgumentException);
        });

        it("should allow reading from an open file", () => {
            const { file } = createTestEnv();
            file.open();
            expect(() => file.read(1)).not.toThrow();
        });

        it("should throw when reading with negative bytes", () => {
            const { file } = createTestEnv();
            file.open();
            // Precondition: noBytes >= 0
            expect(() => file.read(-1)).toThrow(IllegalArgumentException);
        });

        it("should allow closing an open file", () => {
            const { file } = createTestEnv();
            file.open();
            expect(() => file.close()).not.toThrow();
        });

        it("should throw when closing an already closed file", () => {
            const { file } = createTestEnv();
            // State is CLOSED
            expect(() => file.close()).toThrow(IllegalArgumentException);
        });
    });

    describe("Directory Contracts", () => {

        it("should throw when adding a null child", () => {
            const { dir } = createTestEnv();
            // @ts-ignore
            expect(() => dir.addChildNode(null)).toThrow(IllegalArgumentException);
        });

        it("should throw when checking for a null child", () => {
            const { dir } = createTestEnv();
            // @ts-ignore
            expect(() => dir.hasChildNode(null)).toThrow(IllegalArgumentException);
        });

        it("should throw when removing a null child", () => {
            const { dir } = createTestEnv();
            // @ts-ignore
            expect(() => dir.removeChildNode(null)).toThrow(IllegalArgumentException);
        });

        it("should throw when removing a child that does not exist", () => {
            const { root, dir } = createTestEnv();
            const otherFile = new File("other", root); // Ist im Root, nicht in dir

            expect(() => dir.removeChildNode(otherFile)).toThrow(IllegalArgumentException);
        });

        it("should allow removing an existing child", () => {
            const { dir, file } = createTestEnv();
            expect(() => dir.removeChildNode(file)).not.toThrow();
        });
    });

    describe("Node Contracts", () => {

        it("should throw if parent is null in constructor", () => {
            // @ts-ignore
            expect(() => new File("name", null)).toThrow(IllegalArgumentException);
        });

        it("should throw if basename is null or empty in constructor", () => {
            const { root } = createTestEnv();
            // @ts-ignore
            expect(() => new Directory(null, root)).toThrow(IllegalArgumentException);
            expect(() => new Directory("", root)).toThrow(IllegalArgumentException);
        });

        it("should throw if renaming to invalid name", () => {
            const { file } = createTestEnv();
            // @ts-ignore
            expect(() => file.rename(null)).toThrow(IllegalArgumentException);
            expect(() => file.rename("")).toThrow(IllegalArgumentException);
        });

        it("should throw if moving to null target", () => {
            const { file } = createTestEnv();
            // @ts-ignore
            expect(() => file.move(null)).toThrow(IllegalArgumentException);
        });

        it("should allow moving to a valid directory", () => {
            const { file, root } = createTestEnv();
            const newDir = new Directory("newDir", root);

            expect(() => file.move(newDir)).not.toThrow();
            expect(newDir.hasChildNode(file)).toBe(true);
        });
    });

});
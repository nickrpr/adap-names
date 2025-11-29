import { Node } from "./Node";
import { Directory } from "./Directory";
import { IllegalArgumentException } from "../common/IllegalArgumentException";

enum FileState {
    OPEN,
    CLOSED,
    DELETED        
};

export class File extends Node {

    protected state: FileState = FileState.CLOSED;

    constructor(baseName: string, parent: Directory) {
        super(baseName, parent);
    }

    public open(): void {
        // Preconditions:
        IllegalArgumentException.assert(this.state !== FileState.DELETED, "Cannot open a deleted file");
        IllegalArgumentException.assert(this.state !== FileState.OPEN, "File is already open");

        this.state = FileState.OPEN;

    }

    public read(noBytes: number): Int8Array {
        // read something
        // Preconditions:
        IllegalArgumentException.assert(this.state !== FileState.DELETED, "File is deleted"); // theoretisch nicht zusätzlich notwendig
        IllegalArgumentException.assert(this.state !== FileState.CLOSED, "Cannot read from a closed file"); // theoretisch nicht zusätzlich notwendig
        IllegalArgumentException.assert(this.state === FileState.OPEN, "File must be open to read");
        IllegalArgumentException.assert(noBytes >= 0, "Number of bytes must be non-negative");

        return new Int8Array(noBytes);
    }

    public close(): void {
        // Preconditions:
        IllegalArgumentException.assert(this.state !== FileState.DELETED, "Cannot close a deleted file"); // eig nicht notwendig, da bereits State OPEN sein muss
        IllegalArgumentException.assert(this.state !== FileState.CLOSED, "Cannot close a closed file");
        IllegalArgumentException.assert(this.state === FileState.OPEN, "Cannot close a file that is not open");

        this.state = FileState.CLOSED;
    }

    protected doGetFileState(): FileState {
        return this.state;
    }

}
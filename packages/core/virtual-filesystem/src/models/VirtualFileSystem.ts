export type FileStream = ReadableStream | WritableStream | TransformStream

export abstract class VirtualFileSystem {
    abstract open(): FileStream
}

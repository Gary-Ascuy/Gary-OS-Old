import { WritableStream, TransformStream, ReadableStream } from 'web-streams-polyfill/ponyfill'

export type FileStream = ReadableStream | WritableStream | TransformStream

export abstract class VirtualFileSystem {
  abstract mount(): Promise<void>
  abstract unmount(): Promise<void>

  abstract open(path: string, mode: string): Promise<FileStream>
  abstract exist(path: string): Promise<boolean>
  abstract remove(path: string): Promise<void>

  abstract readAllContent(path: string): Promise<string | null>
}

import { VirtualFile } from './VirtualFile'
import { FileStream, VirtualFileSystem, readFile, writeFile } from './VirtualFileSystem'

export abstract class BaseFileSystem implements VirtualFileSystem {
  abstract mount(): Promise<void>
  abstract unmount(): Promise<void>

  abstract getFile(path: string, exclusive: boolean): Promise<VirtualFile>
  abstract free(file: VirtualFile | string): Promise<void>

  abstract open(path: string, mode: string): Promise<FileStream>
  abstract exist(path: string): Promise<boolean>
  abstract remove(path: string): Promise<void>

  readFile(path: string): Promise<string> {
    return readFile(this, path)
  }

  writeFile(path: string, content: string, mode: string): Promise<void> {
    return writeFile(this, path, content, mode)
  }
}

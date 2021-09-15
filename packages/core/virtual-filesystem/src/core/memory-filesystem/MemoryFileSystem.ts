import { v4 as uuid } from 'uuid'
import { WritableStream, ReadableStream } from 'web-streams-polyfill'

import { MemoryDisk } from './MemoryDisk'
import { MemoryFile } from './MemoryFile'
import { FileStream, VirtualFileSystem } from '../../models/VirtualFileSystem'

export class MemoryFileSystem extends VirtualFileSystem {
  private _disk: MemoryDisk = { index: {}, data: {} }

  async open(path: string, mode: string = 'r'): Promise<FileStream> {
    if (!/^[rwa]{1}$/.test(mode)) throw new Error('Invalid File Mode')

    if (mode.includes('r')) {
      if (!await this.exist(path)) throw Error('File does not exist')
      return this.openReadMode(path, mode)
    }

    if (mode.includes('w') || mode.includes('a')) {
      return this.openWriteMode(path, mode)
    }

    throw new Error('Invalid File Mode')
  }

  async readAllContent(path: string): Promise<string | null> {
    const file = this._disk.index[path]
    return this._disk.data[file?.uuid] ?? null
  }

  async exist(path: string): Promise<boolean> {
    const file = this._disk.index[path]
    return !!file
  }

  async remove(path: string): Promise<void> {
    if (!await this.exist(path)) throw Error('File does not exist')

    const file = await this.getFile(path, true)
    delete this._disk.index[path]
    delete this._disk.data[file.uuid]
  }

  get disk(): MemoryDisk {
    return this._disk
  }

  private async openReadMode(path: string, mode: string): Promise<ReadableStream> {
    const file = await this.getFile(path, false)
    return new ReadableStream({
      pull: async (controller: ReadableStreamDefaultController) => {
        const chunks = this._disk.data[file.uuid].split(/(?=\n)/g)
        for (let chunk of chunks) controller.enqueue(chunk)
        controller.close()
      }
    })
  }

  private async openWriteMode(path: string, mode: string): Promise<WritableStream> {
    const file = await this.getFile(path, true)
    if (mode.includes('w')) this._disk.data[file.uuid] = ''

    return new WritableStream({
      write: (chunk: string, controller: WritableStreamDefaultController) => {
        this._disk.data[file.uuid] += chunk
      },
      close: () => {
        file.lock = false
        file.setSize(this._disk.data[file.uuid]?.length ?? 0)
      },
    })
  }

  private register(file: MemoryFile): MemoryFile {
    this._disk.index[file.path] = file
    this._disk.data[file.uuid] = ''
    return file
  }

  private async getFile(path: string, exclusive: boolean = false): Promise<MemoryFile> {
    const file = this._disk.index[path]
    if (file && file.lock) throw new Error('The process cannot access the file because it is being used by another process')
    const registeredFile = file ? file : this.register(new MemoryFile(uuid(), path))
    registeredFile.lock = exclusive
    return registeredFile
  }
}

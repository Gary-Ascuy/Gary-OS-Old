import { WritableStream, ReadableStream } from 'web-streams-polyfill'

import { FileStream, VirtualFileSystem } from '../../models/VirtualFileSystem'
import { LocalStorageFile } from './LocalStorageFile'

export class LocalStorageFileSystem extends VirtualFileSystem {
  constructor(
    public namespace: string = 'fs',
    public index: { [key: string]: LocalStorageFile } = {},
  ) {
    super()
  }

  async mount(): Promise<void> {
    this.index = await this.loadIndex()
  }

  async unmount(): Promise<void> {
    await this.saveIndex()
  }

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
    return localStorage[this.getDataKey(path)] ?? null
  }

  async exist(path: string): Promise<boolean> {
    const file = this.index[path]
    return !!file
  }

  async remove(path: string): Promise<void> {
    if (!await this.exist(path)) throw Error('File does not exist')

    delete this.index[path]
    this.saveIndex()
    localStorage.removeItem(this.getDataKey(path))
  }

  private async openReadMode(path: string, mode: string): Promise<ReadableStream> {
    const file = await this.getFile(path, false)
    return new ReadableStream({
      pull: async (controller: ReadableStreamDefaultController) => {
        const value = localStorage.getItem(this.getDataKey(path))
        const chunks = value ? value.split(/(?=\n)/g) : []
        for (let chunk of chunks) controller.enqueue(chunk)
        controller.close()
      }
    })
  }

  private async openWriteMode(path: string, mode: string): Promise<WritableStream> {
    const file = await this.getFile(path, true)
    const key = this.getDataKey(path)
    const ref = { value: localStorage.getItem(key) || '' }

    if (mode.includes('w')) {
      localStorage.setItem(key, '')
      ref.value = ''
    }

    return new WritableStream({
      write: (chunk: string, controller: WritableStreamDefaultController) => {
        ref.value += chunk
      },
      close: () => {
        file.lock = false
        localStorage.setItem(this.getDataKey(path), ref.value)
        file.setSize(ref.value.length ?? 0)
      },
    })
  }

  private async getFile(path: string, exclusive: boolean = false): Promise<LocalStorageFile> {
    const file = this.index[path]
    if (file && file.lock) throw new Error('The process cannot access the file because it is being used by another process')
    const registeredFile = file ? file : this.register(new LocalStorageFile(path))
    registeredFile.lock = exclusive
    return registeredFile
  }

  private register(file: LocalStorageFile): LocalStorageFile {
    this.index[file.path] = file
    localStorage.setItem(this.getDataKey(file.path), '')
    return file
  }

  private getDataKey(path: string) {
    return `@garyos.${this.namespace}.data__${path}`
  }

  private getIndexKey() {
    return `@garyos.${this.namespace}.index`
  }

  private async loadIndex(): Promise<{ [key: string]: LocalStorageFile }> {
    const index = localStorage.getItem(this.getIndexKey())
    return index ? JSON.parse(index) : {}
  }

  private async saveIndex(): Promise<void> {
    localStorage.setItem(this.getIndexKey(), JSON.stringify(this.index))
  }
}

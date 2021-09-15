import startsWith from 'lodash/startsWith'

import { MemoryFileSystem } from './core/memory-filesystem/MemoryFileSystem'
import { FileStream, VirtualFileSystem } from './models/VirtualFileSystem'

export class FileSystemManager extends VirtualFileSystem {
  constructor(
    public map: { [key: string]: VirtualFileSystem } = {}
  ) {
    super()
  }

  async install(path: string, fileSystem: VirtualFileSystem) {
    this.map[path] = fileSystem
    await fileSystem.mount()
  }

  async uninstall(path: string) {
    const fileSystem = this.map[path]
    await fileSystem.unmount()
    delete this.map[path]
  }

  async mount(): Promise<void> {
    this.install('/', new MemoryFileSystem()) // adding root '/' (default)
  }

  async unmount(): Promise<void> {
    const keys = Object.keys(this.map)
    for (const key of keys) await this.uninstall(key)
  }

  async open(path: string, mode: string): Promise<FileStream> {
    const fs = await this.getFileSystem(path)
    return fs.open(path, mode)
  }

  async remove(path: string): Promise<void> {
    const fs = await this.getFileSystem(path)
    return fs.remove(path)
  }

  async readAllContent(path: string): Promise<string | null> {
    const fs = await this.getFileSystem(path)
    return fs.readAllContent(path)
  }

  async exist(path: string): Promise<boolean> {
    const fs = await this.getFileSystem(path)
    return fs.exist(path)
  }

  public async getFileSystem(path: string | null): Promise<VirtualFileSystem> {
    if (!path) throw new Error('Invalid path, review the configuration')

    const keys = Object.keys(this.map)
    const key = await this.findKey(path, keys)
    return this.map[key]
  }

  public async findKey(path: string, keys: string[]): Promise<string> {
    const contains = (key: string) => startsWith(path, key)
    const length = (key: string) => key.split('/').filter(Boolean).length
    const sortByLength = (a: string, b: string) => length(b) - length(a)
    const [key] = keys.filter(contains).sort(sortByLength)

    if (!key) throw new Error('Unable to find file system for this path')
    return key
  }
}

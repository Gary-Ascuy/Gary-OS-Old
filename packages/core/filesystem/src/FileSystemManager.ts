import { BaseFileSystem, FileStream, VirtualFile, VirtualFileSystem } from '@garyos/kernel'
import isString from 'lodash/isString'
import startsWith from 'lodash/startsWith'

import { MemoryFileSystem } from './drivers/memory-filesystem/MemoryFileSystem'

export class FileSystemManager extends BaseFileSystem {
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
    // adding root '/' (default)
    this.install('/', new MemoryFileSystem())
  }

  async unmount(): Promise<void> {
    const keys = Object.keys(this.map)
    for (const key of keys) await this.uninstall(key)
  }

  async getFile(path: string, exclusive: boolean): Promise<VirtualFile> {
    const fs = await this.getFileSystem(path)
    return fs.getFile(path, exclusive)

  }

  async free(file: VirtualFile | string): Promise<void> {
    const path = isString(file) ? file : file.path
    const fs = await this.getFileSystem(path)
    await fs.free(file)
  }

  async open(path: string, mode: string): Promise<FileStream> {
    const fs = await this.getFileSystem(path)
    return fs.open(path, mode)
  }

  async remove(path: string): Promise<void> {
    const fs = await this.getFileSystem(path)
    return fs.remove(path)
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

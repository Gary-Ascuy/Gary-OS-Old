import { VirtualFolder } from '../../models/VirtualFolder'
import { MemoryFile } from './MemoryFile'

export class MemoryFolder extends MemoryFile implements VirtualFolder {
  private _length: number = 0

  constructor(
    uuid: string,
    path: string,
    tags: string[] = [],
    createdAt: number = new Date().getTime(),
    updatedAt: number = new Date().getTime(),
  ) {
    super(uuid, path, tags, createdAt, updatedAt)
  }

  setLength(length: number) {
    this._length = length
  }

  async length(): Promise<number> {
    return this._length
  }
}

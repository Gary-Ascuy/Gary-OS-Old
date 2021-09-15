import { VirtualFile } from '../../models/VirtualFile'

export class MemoryFile extends VirtualFile {
  public lock: boolean = false
  private _size: number = 0

  constructor(
    public uuid: string,
    public path: string,
    public tags: string[] = [],
    public createdAt: number = new Date().getTime(),
    public updatedAt: number = new Date().getTime(),
  ) {
    super(path, tags, createdAt, updatedAt)
  }

  public setSize(size: number) {
    this._size = size
  }

  public async size(): Promise<number> {
    return this._size
  }
}

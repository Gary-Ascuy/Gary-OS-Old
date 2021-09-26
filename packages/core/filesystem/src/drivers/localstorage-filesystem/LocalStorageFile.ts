import { VirtualFile, VirtualFileKind } from '@garyos/kernel'

export class LocalStorageFile implements VirtualFile {
  public lock: boolean = false

  constructor(
    public path: string,
    public kind: VirtualFileKind = 0,
    public tags: string[] = [],
    public size: number = 0,
    public createdAt: number = new Date().getTime(),
    public updatedAt: number = new Date().getTime(),
  ) { }
}

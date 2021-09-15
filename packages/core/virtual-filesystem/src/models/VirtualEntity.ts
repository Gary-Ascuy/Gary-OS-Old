export abstract class VirtualEntity {
  public lock: boolean = false

  constructor(
    public path: string,
    public tags: string[] = [],
    public createdAt: number = new Date().getTime(),
    public updatedAt: number = new Date().getTime(),
  ) { }
}

import { VirtualEntity } from './VirtualEntity'

export abstract class VirtualFile extends VirtualEntity {
  abstract size(): Promise<number>
}

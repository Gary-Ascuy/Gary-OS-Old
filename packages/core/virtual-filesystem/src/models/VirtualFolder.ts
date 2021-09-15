import { VirtualFile } from './VirtualFile'

export abstract class VirtualFolder extends VirtualFile {
  abstract length(): Promise<number>
}

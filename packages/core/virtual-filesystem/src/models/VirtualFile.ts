import { VirtualFileKind } from './VirtualFileKind'

export interface VirtualFile {
  lock: boolean

  path: string
  kind: VirtualFileKind
  tags: string[]

  size: number
  createdAt: number
  updatedAt: number
}

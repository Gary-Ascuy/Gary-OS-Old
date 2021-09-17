import concat from 'lodash/concat'
import { InvalidFileReferenceError } from './errors/InvalidFileReferenceError'

import { VirtualFile } from './models/VirtualFile'
import { VirtualFileKind } from './models/VirtualFileKind'

export * from './models/VirtualFile'
export * from './models/VirtualFileSystem'

function checkFile(file: VirtualFile) {
  if (!file) throw new InvalidFileReferenceError()
}

export async function isDirectory(file: VirtualFile): Promise<boolean> {
  checkFile(file)
  return (file.kind & VirtualFileKind.Directory) === VirtualFileKind.Directory
}

export async function isFile(file: VirtualFile) {
  return !await isDirectory(file)
}

export function addTags(file: VirtualFile, tags: string[]): VirtualFile {
  checkFile(file)
  file.tags = concat(file.tags).filter(Boolean)
  return file
}

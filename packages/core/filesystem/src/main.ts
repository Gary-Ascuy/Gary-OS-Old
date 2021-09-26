import { VirtualFile, VirtualFileKind } from '@garyos/kernel'
import concat from 'lodash/concat'

import { InvalidFileReferenceError } from './errors/InvalidFileReferenceError'

export * from './FileSystemManager'
export * as memory from './drivers/memory-filesystem'
export * as localstorage from './drivers/localstorage-filesystem'
export * as github from './drivers/github-filesystem'

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

export async function addTags(file: VirtualFile, tags: string[]): Promise<VirtualFile> {
  checkFile(file)

  const set = new Set(concat(file.tags, tags).filter(Boolean))

  file.tags = Array.from(set.keys())
  return file
}

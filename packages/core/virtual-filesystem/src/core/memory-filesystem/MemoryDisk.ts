import { MemoryFile } from './MemoryFile'
import { MemoryFolder } from './MemoryFolder'

export interface MemoryDiskFile {
  [path: string]: MemoryFile | MemoryFolder
}

export interface MemoryDiskData {
  [key: string]: string
}

export interface MemoryDisk {
  index: MemoryDiskFile
  data: MemoryDiskData
}

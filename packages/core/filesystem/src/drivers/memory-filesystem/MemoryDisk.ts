import { MemoryFile } from './MemoryFile'

export interface MemoryDiskFile {
  [path: string]: MemoryFile
}

export interface MemoryDiskData {
  [key: string]: string
}

export interface MemoryDisk {
  index: MemoryDiskFile
  data: MemoryDiskData
}

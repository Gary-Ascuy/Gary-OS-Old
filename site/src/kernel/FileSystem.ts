export type FileStream = WritableStream | ReadableStream | TransformStream

export abstract class FileSystem {
  private static __instance?: FileSystem = undefined

  abstract open(path: string, mode: FileMode): FileStream

  getInstance(): FileSystem {
    if (!FileSystem.__instance) FileSystem.__instance = new LocalStorageFileSystem()

    return FileSystem.__instance
  }
}

export enum FileMode {
  Read = 'r',
  Write = 'w',
  Append = 'a',
  ReadAndWrite = 'rw',
}

export class MemoryFileSystem extends FileSystem {
  open(path: string, mode: FileMode = FileMode.Read): FileStream {
    throw new Error('Not implemented yet')
  }
}

export class LocalStorageFileSystem extends FileSystem {
  open(path: string, mode: FileMode = FileMode.Read): FileStream {
    switch (mode) {
      case FileMode.Write: {
        const write = (chunk: string) => {
          const value = localStorage.getItem(path) || ''
          localStorage.setItem(path, chunk)
        }

        return new WritableStream({ write })
      }

      case FileMode.Append: {
        const write = (chunk: string) => {
          const value = localStorage.getItem(path) || ''
          localStorage.setItem(path, `${value}${chunk}`)
        }

        return new WritableStream({ write })
      }

      case FileMode.Read: {
        const start = (controller: any) => {
          const value = localStorage.getItem(path)
          controller.enqueue(value)
          controller.close()
        }

        return new ReadableStream({ start })
      }

      case FileMode.ReadAndWrite: {
        const start = (controller: any) => {
          const value = localStorage.getItem(path)
          controller.enqueue(value)
          controller.close()
        }

        const transform = (chunk: string) => {
          const value = localStorage.getItem(path) || ''
          localStorage.setItem(path, `${value}${chunk}`)
        }

        return new TransformStream({ start, transform })
      }

      default: throw new Error('Invalid FileSystem Mode')
    }
  }
}

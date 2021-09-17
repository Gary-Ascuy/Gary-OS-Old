import { WritableStream, TransformStream, ReadableStream } from 'web-streams-polyfill/ponyfill'

import { VirtualFile } from './VirtualFile'

export type FileStream = ReadableStream | WritableStream | TransformStream

export abstract class VirtualFileSystem {
  abstract mount(): Promise<void>
  abstract unmount(): Promise<void>

  abstract getFile(path: string, exclusive: boolean): Promise<VirtualFile>
  abstract free(file: VirtualFile | string): Promise<void>

  abstract open(path: string, mode: string): Promise<FileStream>
  abstract exist(path: string): Promise<boolean>
  abstract remove(path: string): Promise<void>

  abstract readAllContent(path: string): Promise<string | null>

  async readFile(path: string): Promise<string> {
    const file = await this.open(path, 'r') as ReadableStream
    const reader = file.getReader()

    let done
    let content = ''

    do {
      const chunk = await reader.read()
      content += chunk.value || ''
      done = chunk.done
    } while (!done)

    return content
  }

  async writeFile(path: string, content: string, mode: string = 'w'): Promise<void> {
    const file = await this.open(path, mode) as WritableStream
    const writer = file.getWriter()
    await writer.write(content)
    await writer.close()
  }
}

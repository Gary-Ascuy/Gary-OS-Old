import { WritableStream, TransformStream, ReadableStream } from 'web-streams-polyfill'

import { VirtualFile } from './VirtualFile'

export type FileStream = ReadableStream<string> | WritableStream<string> | TransformStream<string>

export interface VirtualFileSystem {
  mount(): Promise<void>
  unmount(): Promise<void>

  getFile(path: string, exclusive: boolean): Promise<VirtualFile>
  free(file: VirtualFile | string): Promise<void>

  open(path: string, mode: string): Promise<FileStream>
  exist(path: string): Promise<boolean>
  remove(path: string): Promise<void>

  readFile(path: string): Promise<string>
  writeFile(path: string, content: string, mode: string): Promise<void>
}

export async function readFile(fs: VirtualFileSystem, path: string): Promise<string> {
  const file = await fs.open(path, 'r') as ReadableStream
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

export async function writeFile(fs: VirtualFileSystem, path: string, content: string, mode: string = 'w'): Promise<void> {
  const file = await fs.open(path, mode) as WritableStream
  const writer = file.getWriter()
  await writer.write(content)
  await writer.close()
}

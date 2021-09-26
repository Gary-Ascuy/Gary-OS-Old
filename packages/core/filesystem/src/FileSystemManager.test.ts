import { VirtualFileSystem } from '@garyos/kernel'
import { ReadableStream } from 'web-streams-polyfill'
import { LocalStorageFileSystem } from './drivers/localstorage-filesystem/LocalStorageFileSystem'
import { MemoryFileSystem } from './drivers/memory-filesystem/MemoryFileSystem'
import { FileSystemManager } from './FileSystemManager'

describe('FileSystemManager.ts', () => {
  let manager: FileSystemManager

  beforeEach(async () => {
    manager = new FileSystemManager()
    manager.mount()
  })

  afterEach(async () => {
    await manager.unmount()
  })

  describe('.findKey()', () => {
    test('should find a valid key', async () => {
      const key = await manager.findKey('/root/gary.txt', ['/'])
      expect(key).toBe('/')
    })

    test('should find a valid key when there is two options', async () => {
      const key = await manager.findKey('/root/gary.txt', ['/gary/', '/'])
      expect(key).toBe('/')
    })

    test('should find a valid key when there is spesific key', async () => {
      const key = await manager.findKey('/root/gary.txt', ['/root/', '/'])
      expect(key).toBe('/root/')
    })

    test('should find a valid key when there is two matches', async () => {
      const key = await manager.findKey('/root/gary/gary.txt', ['/root/', '/root/gary/', '/'])
      expect(key).toBe('/root/gary/')
    })

    test('should find a valid key when there is many matches', async () => {
      const key = await manager.findKey('/root/path/to/resource/very/long/gary.txt', ['/root/', '/root/path/to/', '/root/path/to/resource/very/long/', '/root/gary/', '/'])
      expect(key).toBe('/root/path/to/resource/very/long/')
    })

    test('should throws an error when there is not a valid path', async () => {
      expect(manager.findKey('/gary.txt', [])).rejects.toThrowError()
    })
  })

  describe('.getFileSystem()', () => {
    test('should thrown an error when path is null', async () => {
      expect(manager.getFileSystem(null)).rejects.toThrowError()
    })

    test('should thrown an error when path is undefined', async () => {
      expect(manager.getFileSystem('')).rejects.toThrowError()
    })
  })
})

async function createFile(fs: VirtualFileSystem, path: string): Promise<void> {
  let file = await fs.open(path, 'w') as WritableStream
  expect(file).toBeDefined()

  const writer = file.getWriter()
  expect(writer).toBeDefined()

  await writer.write('FirstLine\n')
  await writer.write('SecondLine\n')
  await writer.close()
  expect(await fs.readFile(path)).toBe('FirstLine\nSecondLine\n')
}

describe.each([
  ['Root', '/root/logs.txt'],
  ['LocalStorageFileSystem', '/dev/mount/localstorage/logs.txt'],
  ['MemoryFileSystem', '/dev/memory/secondary/logs.txt']
])('FileSystemManager.%s.ts', (name: string, path: string) => {
  let fs: FileSystemManager

  describe('.open()', () => {
    beforeEach(async () => {
      fs = new FileSystemManager()
      expect(fs).toBeDefined()

      await fs.mount()

      // install/mount extra file systems
      await fs.install('/dev/mount/localstorage/', new LocalStorageFileSystem('fs'))
      await fs.install('/dev/memory/secondary/', new MemoryFileSystem())
    })

    afterEach(async () => {
      await fs.unmount()
      localStorage.clear()
    })

    test('should open a file in write mode', async () => {
      const file = await fs.open(path, 'w') as WritableStream
      expect(file).toBeDefined()

      const writer = file.getWriter()
      expect(writer).toBeDefined()

      await writer.write('FirstLine\n')
      await writer.write('SecondLine\n')
      await writer.close()
      expect(await fs.readFile(path)).toBe('FirstLine\nSecondLine\n')
    })

    test('should open a file in append mode', async () => {
      let file = await fs.open(path, 'a') as WritableStream
      expect(file).toBeDefined()

      const writer = file.getWriter()
      expect(writer).toBeDefined()

      await writer.write('FirstLine\n')
      await writer.write('SecondLine\n')
      await writer.close()
      expect(await fs.readFile(path)).toBe('FirstLine\nSecondLine\n')
    })

    test('should open a file in append mode and append content', async () => {
      let file = await fs.open(path, 'w') as WritableStream
      expect(file).toBeDefined()

      const writer = file.getWriter()
      expect(writer).toBeDefined()

      await writer.write('FirstLine\n')
      await writer.write('SecondLine\n')
      await writer.close()
      expect(await fs.readFile(path)).toBe('FirstLine\nSecondLine\n')

      let appendFile = await fs.open(path, 'a') as WritableStream
      expect(appendFile).toBeDefined()

      const appendWriter = appendFile.getWriter()
      expect(appendWriter).toBeDefined()

      await appendWriter.write('LastLine\n')
      await appendWriter.close()
      expect(await fs.readFile(path)).toBe('FirstLine\nSecondLine\nLastLine\n')
    })

    test('should open a file in append mode and append content', async () => {
      await createFile(fs, path)

      let appendFile = await fs.open(path, 'a') as WritableStream
      expect(appendFile).toBeDefined()

      const appendWriter = appendFile.getWriter()
      expect(appendWriter).toBeDefined()

      await appendWriter.write('LastLine\n')
      await appendWriter.close()
      expect(await fs.readFile(path)).toBe('FirstLine\nSecondLine\nLastLine\n')
    })

    test('should open a file in read mode and get all the content', async () => {
      await createFile(fs, path)

      const file = await fs.open(path, 'r') as ReadableStream
      expect(file).toBeDefined()

      const reader = file.getReader()
      expect(reader).toBeDefined()

      let hasMore
      let data = ''
      do {
        const { done, value } = await reader.read()
        data += value || ''
        hasMore = !done
      } while (hasMore)

      expect(data).toBe('FirstLine\nSecondLine\n')
    })

    test('should open and read two files at the same time', async () => {
      await createFile(fs, path)

      const file1 = await fs.open(path, 'r') as ReadableStream
      expect(file1).toBeDefined()

      const file2 = await fs.open(path, 'r') as ReadableStream
      expect(file2).toBeDefined()

      const reader1 = file1.getReader()
      expect(reader1).toBeDefined()

      const reader2 = file2.getReader()
      expect(reader2).toBeDefined()

      const readAll = async (reader: any) => {
        let hasMore
        let data = ''
        do {
          const { done, value } = await reader.read()
          data += value || ''
          hasMore = !done
        } while (hasMore)
        return data
      }

      const [data1, data2] = await Promise.all([readAll(reader1), readAll(reader2)])
      expect(data1).toBe('FirstLine\nSecondLine\n')
      expect(data2).toBe('FirstLine\nSecondLine\n')
    })

    test('should thrown an Error trying to open a nonexistent file', async () => {
      expect(fs.open(path, 'r')).rejects.toThrowError()
    })
  })

  describe('.remove()', () => {
    beforeEach(async () => {
      fs = new FileSystemManager()
      expect(fs).toBeDefined()

      // install/mount extra file systems
      await fs.mount()
      await fs.install('/dev/mount/localstorage/', new LocalStorageFileSystem('fs'))
      await fs.install('/dev/memory/secondary/', new MemoryFileSystem())

      // create file to check of exist
      await createFile(fs, path)
    })

    afterEach(async () => {
      await fs.unmount()
      localStorage.clear()
    })

    test('should remove a file', async () => {
      await fs.remove(path)

      expect(fs.readFile(path)).rejects.toThrowError()
    })

    test('should thrown an error trying to remove a deleted file', async () => {
      await fs.remove(path)
      expect(fs.readFile(path)).rejects.toThrowError()

      expect(fs.remove(path)).rejects.toThrowError()
    })
  })

  describe('.exist()', () => {
    beforeEach(async () => {
      fs = new FileSystemManager()
      expect(fs).toBeDefined()

      // install/mount extra file systems
      await fs.mount()
      await fs.install('/dev/mount/localstorage/', new LocalStorageFileSystem('fs'))
      await fs.install('/dev/memory/secondary/', new MemoryFileSystem())

      // create file to delete
      await createFile(fs, path)
    })

    afterEach(async () => {
      await fs.unmount()
      localStorage.clear()
    })

    test('should check if file exist', async () => {
      const hasFile = await fs.exist(path)
      expect(hasFile).toBe(true)
    })

    test('should check if file does not exist', async () => {
      const hasFile = await fs.exist('/gary/inexistentFile.txt')
      expect(hasFile).toBe(false)
    })
  })
})

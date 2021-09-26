import { WritableStream, ReadableStream } from 'web-streams-polyfill'

import { LocalStorageFileSystem } from './LocalStorageFileSystem'

async function createFile(fs: LocalStorageFileSystem, path: string): Promise<void> {
  let file = await fs.open(path, 'w') as WritableStream
  expect(file).toBeDefined()

  const writer = file.getWriter()
  expect(writer).toBeDefined()

  await writer.write('FirstLine\n')
  await writer.write('SecondLine\n')
  await writer.close()
  expect(await fs.readAllContent(path)).toBe('FirstLine\nSecondLine\n')
}

describe('LocalStorageFileSystem.ts', () => {
  describe('.open()', () => {
    let fs: LocalStorageFileSystem
    const path = '/root/logs.txt'

    beforeEach(async () => {
      fs = new LocalStorageFileSystem()
      expect(fs).toBeDefined()

      await fs.mount()
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
      expect(await fs.readAllContent(path)).toBe('FirstLine\nSecondLine\n')
    })

    test('should open a file in append mode', async () => {
      let file = await fs.open(path, 'a') as WritableStream
      expect(file).toBeDefined()

      const writer = file.getWriter()
      expect(writer).toBeDefined()

      await writer.write('FirstLine\n')
      await writer.write('SecondLine\n')
      await writer.close()
      expect(await fs.readAllContent(path)).toBe('FirstLine\nSecondLine\n')
    })

    test('should open a file in append mode and append content', async () => {
      let file = await fs.open(path, 'w') as WritableStream
      expect(file).toBeDefined()

      const writer = file.getWriter()
      expect(writer).toBeDefined()

      await writer.write('FirstLine\n')
      await writer.write('SecondLine\n')
      await writer.close()
      expect(await fs.readAllContent(path)).toBe('FirstLine\nSecondLine\n')

      let appendFile = await fs.open(path, 'a') as WritableStream
      expect(appendFile).toBeDefined()

      const appendWriter = appendFile.getWriter()
      expect(appendWriter).toBeDefined()

      await appendWriter.write('LastLine\n')
      await appendWriter.close()
      expect(await fs.readAllContent(path)).toBe('FirstLine\nSecondLine\nLastLine\n')
    })

    test('should open a file in append mode and append content', async () => {
      await createFile(fs, path)

      let appendFile = await fs.open(path, 'a') as WritableStream
      expect(appendFile).toBeDefined()

      const appendWriter = appendFile.getWriter()
      expect(appendWriter).toBeDefined()

      await appendWriter.write('LastLine\n')
      await appendWriter.close()
      expect(await fs.readAllContent(path)).toBe('FirstLine\nSecondLine\nLastLine\n')
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
    let fs: LocalStorageFileSystem
    const path = '/root/logs.txt'

    beforeEach(async () => {
      fs = new LocalStorageFileSystem()
      expect(fs).toBeDefined()

      const file = await fs.open(path, 'w') as WritableStream
      expect(file).toBeDefined()

      const writer = file.getWriter()
      expect(writer).toBeDefined()

      await writer.write('FirstLine\n')
      await writer.write('SecondLine\n')
      await writer.close()
      expect(await fs.readAllContent(path)).toBe('FirstLine\nSecondLine\n')
    })

    test('should remove a file', async () => {
      await fs.remove(path)
      expect(await fs.readAllContent(path)).toBe(null)
    })

    test('should thrown an error trying to remove a deleted file', async () => {
      await fs.remove(path)
      expect(await fs.readAllContent(path)).toBe(null)

      expect(fs.remove(path)).rejects.toThrowError()
    })
  })

  describe('.exist()', () => {
    let fs: LocalStorageFileSystem
    const path = '/root/logs.txt'

    beforeEach(async () => {
      fs = new LocalStorageFileSystem()
      expect(fs).toBeDefined()

      const file = await fs.open(path, 'w') as WritableStream
      expect(file).toBeDefined()

      const writer = file.getWriter()
      expect(writer).toBeDefined()

      await writer.write('FirstLine\n')
      await writer.write('SecondLine\n')
      await writer.close()
      expect(await fs.readAllContent(path)).toBe('FirstLine\nSecondLine\n')
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

import { VirtualFileKind } from '@garyos/kernel'
import { MemoryFile } from './drivers/memory-filesystem/MemoryFile'
import { addTags, isDirectory, isFile } from './main'

describe('main.ts', () => {
  let uuid = 'd7b3d41a-5cc4-432a-a924-b70dd0dff42f'

  describe('.isDirectory()', () => {
    test('should return true when file is pointing to a directory', async () => {
      const file = new MemoryFile(uuid, '/root/data/', VirtualFileKind.Directory)
      const directory = await isDirectory(file)
      expect(directory).toBe(true)
    })

    test('should return false when file is pointing to a file', async () => {
      const file = new MemoryFile(uuid, '/root/data/', VirtualFileKind.File)
      const directory = await isDirectory(file)
      expect(directory).toBe(false)
    })

    test('should return true when file has many flags', async () => {
      const file = new MemoryFile(uuid, '/root/data/', VirtualFileKind.Directory | VirtualFileKind.Hidden | VirtualFileKind.Remote)
      const directory = await isDirectory(file)
      expect(directory).toBe(true)
    })
  })

  describe('.isFile()', () => {
    test('should return false when file is pointing to a directory', async () => {
      const file = new MemoryFile(uuid, '/root/data/gary.txt', VirtualFileKind.Directory)
      const value = await isFile(file)
      expect(value).toBe(false)
    })

    test('should return true when file is pointing to a file', async () => {
      const file = new MemoryFile(uuid, '/root/data/gary.txt', VirtualFileKind.File)
      const value = await isFile(file)
      expect(value).toBe(true)
    })
  })

  describe('.addTags()', () => {
    test('should add one tag', async () => {
      const input = new MemoryFile(uuid, '/root/data/gary.txt', VirtualFileKind.Directory)
      const file = await addTags(input, ['test'])
      expect(file.tags).toEqual(['test'])
    })

    test('should add two tags', async () => {
      const input = new MemoryFile(uuid, '/root/data/gary.txt', VirtualFileKind.Directory)
      const file = await addTags(input, ['test', 'gary'])
      expect(file.tags).toEqual(['test', 'gary'])
    })

    test('should add tags many times', async () => {
      const input = new MemoryFile(uuid, '/root/data/gary.txt', VirtualFileKind.Directory)
      let file = await addTags(input, ['test', 'gary'])
      file = await addTags(input, ['info', 'garyos'])

      expect(file.tags).toEqual(['test', 'gary', 'info', 'garyos'])
    })

    test('should remove repeated tags tags', async () => {
      const input = new MemoryFile(uuid, '/root/data/gary.txt', VirtualFileKind.Directory)
      let file = await addTags(input, ['test', 'gary', 'test'])
      file = await addTags(input, ['info', 'gary'])

      expect(file.tags).toEqual(['test', 'gary', 'info'])
    })
  })
})

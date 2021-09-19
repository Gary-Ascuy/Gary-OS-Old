import { GitHubFileSystem } from './GitHubFileSystem'

describe('GitHubFileSystem.ts', () => {
  describe('.constructor()', () => {
    test('should create an empty instance of github file system', () => {
      const fs = new GitHubFileSystem('Gary-Ascuy')
      expect(fs).toBeDefined()
      expect(fs.username).toBe('Gary-Ascuy')
    })

    test('should create an empty instance of github file system without parameters', () => {
      const fs = new GitHubFileSystem()
      expect(fs).toBeDefined()
      expect(fs.username).toBe('Gary-Ascuy')
    })
  })

  describe('.mount/unmount()', () => {
    let fs: GitHubFileSystem

    beforeEach(() => {
      fs = new GitHubFileSystem()
      expect(fs).toBeDefined()
    })

    test('should load repos on mount', async () => {
      expect(fs.mount()).resolves.toBeCalled()
    })
  })
})

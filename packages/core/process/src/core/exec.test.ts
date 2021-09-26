import { AppicationMainResponse, EnvironmentVariables, Task } from '@garyos/kernel'

import { ApplicationLoader } from '../loader/ApplicationLoader'
import { MockApplicationLoader } from '../loader/ApplicationLoader.mock'
import { MockStream } from '../loader/Stream.mock'
import { execute } from './exec'

describe('exec.ts', () => {
  let loader: ApplicationLoader
  let env: EnvironmentVariables

  describe('.execute()', () => {
    let io: MockStream

    beforeEach(() => {
      loader = new MockApplicationLoader()
      env = { USER: 'gary', HOME: '/root/gary/' }
      io = new MockStream([''])
      io.init()
    })

    test('should execute an empty application', async () => {
      const task: Task = { argv: ['success'], env: {}, execPath: '' }
      const execution = execute(loader, task, io, env)

      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should execute an empty application with failure', async () => {
      const task: Task = { argv: ['failure'], env: {}, execPath: '' }
      const execution = execute(loader, task, io, env)

      return expect(execution).resolves.toBe(AppicationMainResponse.FAILURE)
    })

    test('should execute an empty application with error', async () => {
      const task: Task = { argv: ['error'], env: {}, execPath: '' }
      const execution = execute(loader, task, io, env)

      return expect(execution).resolves.toBe(AppicationMainResponse.ERROR)
    })

    test('should execute an application that uses stdin', async () => {
      const task: Task = { argv: ['grep', 'gary'], env: {}, execPath: '' }
      const io = new MockStream(['gary ascuy\n', 'tejon gary\n', 'camila tejada\n'])
      io.init()
      const execution = execute(loader, task, io, env)

      expect(io.getStdOut()).resolves.toBe('gary ascuy\ntejon gary\n')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should execute an application that uses stdin using arguments in diferent order', async () => {
      const cmd = 'grep unused parameter -f i --pattern gary'
      const task: Task = { argv: cmd.split(' '), env: {}, execPath: '' }
      const io = new MockStream(['gary ascuy\n', 'tejon Gary\n', 'camila tejada\n', 'TestGARY\n'])
      io.init()
      const execution = execute(loader, task, io, env)

      expect(io.getStdOut()).resolves.toBe('gary ascuy\ntejon Gary\nTestGARY\n')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should execute an application that uses stdout', async () => {
      const task: Task = { argv: ['echo', 'gary'], env: {}, execPath: '' }
      const execution = execute(loader, task, io, env)

      expect(io.getStdOut()).resolves.toBe('gary')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should execute an application that uses stdout with variables', async () => {
      const task: Task = { argv: ['echo', 'P1', '${USER}', 'P2', '$CI'], env: { PATTERN: '*.txt', CI: '1' }, execPath: '' }
      const execution = execute(loader, task, io, env)

      expect(io.getStdOut()).resolves.toBe('P1 gary P2 1')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should execute an application that uses env variables', async () => {
      const task: Task = { argv: ['env'], env: { PATTERN: '*.txt' }, execPath: '' }
      const execution = execute(loader, task, io, env)

      expect(io.getStdOut()).resolves.toBe('USER=gary\nHOME=/root/gary/\nPATTERN=*.txt\n')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })
  })
})

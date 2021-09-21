import { AppicationMainResponse, EnvironmentVariables, ProcessOptions } from './models'
import { ProcessManager } from './ProcessManager'

import { MockApplicationLoader, MockStream } from './ApplicationLoader.mock'

describe('ProcessManager.ts', () => {
  let pm: ProcessManager
  let env: EnvironmentVariables

  describe('.execute()', () => {
    let io: MockStream

    beforeEach(() => {
      pm = new ProcessManager(new MockApplicationLoader(), {})
      env = { USER: 'gary', HOME: '/root/gary/' }
      io = new MockStream([''])
      io.init()
    })

    test('should execute success an empty application', async () => {
      const options: ProcessOptions = { argv: ['success'], env: {}, execPath: '' }
      const execution = pm.execute(options, io, env)

      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should execute success an empty application with failure', async () => {
      const options: ProcessOptions = { argv: ['failure'], env: {}, execPath: '' }
      const execution = pm.execute(options, io, env)

      return expect(execution).resolves.toBe(AppicationMainResponse.FAILURE)
    })

    test('should execute success an empty application with error', async () => {
      const options: ProcessOptions = { argv: ['error'], env: {}, execPath: '' }
      const execution = pm.execute(options, io, env)

      return expect(execution).resolves.toBe(AppicationMainResponse.ERROR)
    })

    test('should execute an application that uses stdout', async () => {
      const options: ProcessOptions = { argv: ['echo', 'gary'], env: {}, execPath: '' }
      const execution = pm.execute(options, io, env)

      expect(io.getStdOut()).resolves.toBe('gary')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should execute an application that uses stdout with variables', async () => {
      const options: ProcessOptions = { argv: ['echo', 'P1', '${USER}', 'P2'], env: { PATTERN: '*.txt' }, execPath: '' }
      const execution = pm.execute(options, io, env)

      expect(io.getStdOut()).resolves.toBe('P1 gary P2')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should execute an application that uses env variables', async () => {
      const options: ProcessOptions = { argv: ['env'], env: { PATTERN: '*.txt' }, execPath: '' }
      const execution = pm.execute(options, io, env)

      expect(io.getStdOut()).resolves.toBe('USER=gary\nHOME=/root/gary/\nPATTERN=*.txt\n')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })
  })
})

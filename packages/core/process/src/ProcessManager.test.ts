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

    test('should execute an empty application', async () => {
      const options: ProcessOptions = { argv: ['success'], env: {}, execPath: '' }
      const execution = pm.execute(options, io, env)

      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should execute an empty application with failure', async () => {
      const options: ProcessOptions = { argv: ['failure'], env: {}, execPath: '' }
      const execution = pm.execute(options, io, env)

      return expect(execution).resolves.toBe(AppicationMainResponse.FAILURE)
    })

    test('should execute an empty application with error', async () => {
      const options: ProcessOptions = { argv: ['error'], env: {}, execPath: '' }
      const execution = pm.execute(options, io, env)

      return expect(execution).resolves.toBe(AppicationMainResponse.ERROR)
    })

    test('should execute an application that uses stdin', async () => {
      const options: ProcessOptions = { argv: ['grep', 'gary'], env: {}, execPath: '' }
      const io = new MockStream(['gary ascuy\n', 'tejon gary\n', 'camila tejada\n'])
      io.init()
      const execution = pm.execute(options, io, env)

      expect(io.getStdOut()).resolves.toBe('gary ascuy\ntejon gary\n')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should execute an application that uses stdin using arguments in diferent order', async () => {
      const cmd = 'grep unused parameter -f i --pattern gary'
      const options: ProcessOptions = { argv: cmd.split(' '), env: {}, execPath: '' }
      const io = new MockStream(['gary ascuy\n', 'tejon Gary\n', 'camila tejada\n', 'TestGARY\n'])
      io.init()
      const execution = pm.execute(options, io, env)

      expect(io.getStdOut()).resolves.toBe('gary ascuy\ntejon Gary\nTestGARY\n')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should execute an application that uses stdout', async () => {
      const options: ProcessOptions = { argv: ['echo', 'gary'], env: {}, execPath: '' }
      const execution = pm.execute(options, io, env)

      expect(io.getStdOut()).resolves.toBe('gary')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should execute an application that uses stdout with variables', async () => {
      const options: ProcessOptions = { argv: ['echo', 'P1', '${USER}', 'P2', '$CI'], env: { PATTERN: '*.txt', CI: '1' }, execPath: '' }
      const execution = pm.execute(options, io, env)

      expect(io.getStdOut()).resolves.toBe('P1 gary P2 1')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should execute an application that uses env variables', async () => {
      const options: ProcessOptions = { argv: ['env'], env: { PATTERN: '*.txt' }, execPath: '' }
      const execution = pm.execute(options, io, env)

      expect(io.getStdOut()).resolves.toBe('USER=gary\nHOME=/root/gary/\nPATTERN=*.txt\n')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    /// NOT FOUND APP
  })

  describe('.pipeline()', () => {
    let io: MockStream

    beforeEach(() => {
      pm = new ProcessManager(new MockApplicationLoader(), {})
      env = { USER: 'gary', HOME: '/root/gary/' }
      io = new MockStream([''])
      io.init()
    })

    test('should run a basic pipeline', async () => {
      const options: ProcessOptions[] = [
        { argv: ['success'], env: {}, execPath: '' },
        { argv: ['echo', 'gary'], env: {}, execPath: '' },
      ]
      const execution = pm.pipeline(options, io, env)

      expect(io.getStdOut()).resolves.toBe('gary')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should run a long pipeline', async () => {
      const options: ProcessOptions[] = [
        { argv: ['success'], env: {}, execPath: '' },
        { argv: ['success'], env: {}, execPath: '' },
        { argv: ['success'], env: {}, execPath: '' },
        { argv: ['success'], env: {}, execPath: '' },
        { argv: ['echo', 'gary'], env: {}, execPath: '' },
      ]
      const execution = pm.pipeline(options, io, env)

      expect(io.getStdOut()).resolves.toBe('gary')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should run a long pipeline and return latest error code', async () => {
      const options: ProcessOptions[] = [
        { argv: ['success'], env: {}, execPath: '' },
        { argv: ['success'], env: {}, execPath: '' },
        { argv: ['failure'], env: {}, execPath: '' },
      ]
      const execution = pm.pipeline(options, io, env)

      return expect(execution).resolves.toBe(AppicationMainResponse.FAILURE)
    })

    test('should run a long pipeline and return latest success code', async () => {
      const options: ProcessOptions[] = [
        { argv: ['failure'], env: {}, execPath: '' },
        { argv: ['failure'], env: {}, execPath: '' },
        { argv: ['success'], env: {}, execPath: '' },
      ]
      const execution = pm.pipeline(options, io, env)

      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should pipe one process', async () => {
      const options: ProcessOptions[] = [
        { argv: ['echo', 'Gary Ascuy'], env: {}, execPath: '' },
      ]
      const execution = pm.pipeline(options, io, env)

      expect(io.getStdOut()).resolves.toBe('Gary Ascuy')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should pipe two process', async () => {
      const options: ProcessOptions[] = [
        { argv: ['echo', 'Gary Ascuy'], env: {}, execPath: '' },
        { argv: ['uppercase'], env: {}, execPath: '' },
      ]
      const execution = pm.pipeline(options, io, env)

      expect(io.getStdOut()).resolves.toBe('GARY ASCUY')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should pipe three process', async () => {
      const options: ProcessOptions[] = [
        { argv: ['echo', 'Gary Ascuy'], env: {}, execPath: '' },
        { argv: ['uppercase'], env: {}, execPath: '' },
        { argv: ['lowercase'], env: {}, execPath: '' },
      ]
      const execution = pm.pipeline(options, io, env)

      expect(io.getStdOut()).resolves.toBe('gary ascuy')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should pipe many process (removelast 1)', async () => {
      const options: ProcessOptions[] = [
        { argv: ['echo', 'First Name Gary Ascuy Anturiano'], env: { DEBUG: '1' }, execPath: '' },
        { argv: ['removelast'], env: {}, execPath: '' },
      ]
      const execution = pm.pipeline(options, io, env)

      expect(io.getStdOut()).resolves.toBe('First Name Gary Ascuy')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should pipe many process (removelast 3)', async () => {
      const options: ProcessOptions[] = [
        { argv: ['echo', 'First Name Gary Ascuy Anturiano'], env: {}, execPath: '' },
        { argv: ['removelast'], env: {}, execPath: '' },
        { argv: ['removelast'], env: {}, execPath: '' },
        { argv: ['removelast'], env: {}, execPath: '' },
      ]
      const execution = pm.pipeline(options, io, env)

      expect(io.getStdOut()).resolves.toBe('First Name')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })
  })
})

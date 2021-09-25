import { AppicationMainResponse, EnvironmentVariables, LogicalPipeline, Operator, ParallelPipeline, Pipeline, ProcessOptions, Task } from './models'
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
      const task: Task = { argv: ['success'], env: {}, execPath: '' }
      const execution = pm.execute(task, io, env)

      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should execute an empty application with failure', async () => {
      const task: Task = { argv: ['failure'], env: {}, execPath: '' }
      const execution = pm.execute(task, io, env)

      return expect(execution).resolves.toBe(AppicationMainResponse.FAILURE)
    })

    test('should execute an empty application with error', async () => {
      const task: Task = { argv: ['error'], env: {}, execPath: '' }
      const execution = pm.execute(task, io, env)

      return expect(execution).resolves.toBe(AppicationMainResponse.ERROR)
    })

    test('should execute an application that uses stdin', async () => {
      const task: Task = { argv: ['grep', 'gary'], env: {}, execPath: '' }
      const io = new MockStream(['gary ascuy\n', 'tejon gary\n', 'camila tejada\n'])
      io.init()
      const execution = pm.execute(task, io, env)

      expect(io.getStdOut()).resolves.toBe('gary ascuy\ntejon gary\n')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should execute an application that uses stdin using arguments in diferent order', async () => {
      const cmd = 'grep unused parameter -f i --pattern gary'
      const task: Task = { argv: cmd.split(' '), env: {}, execPath: '' }
      const io = new MockStream(['gary ascuy\n', 'tejon Gary\n', 'camila tejada\n', 'TestGARY\n'])
      io.init()
      const execution = pm.execute(task, io, env)

      expect(io.getStdOut()).resolves.toBe('gary ascuy\ntejon Gary\nTestGARY\n')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should execute an application that uses stdout', async () => {
      const task: Task = { argv: ['echo', 'gary'], env: {}, execPath: '' }
      const execution = pm.execute(task, io, env)

      expect(io.getStdOut()).resolves.toBe('gary')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should execute an application that uses stdout with variables', async () => {
      const task: Task = { argv: ['echo', 'P1', '${USER}', 'P2', '$CI'], env: { PATTERN: '*.txt', CI: '1' }, execPath: '' }
      const execution = pm.execute(task, io, env)

      expect(io.getStdOut()).resolves.toBe('P1 gary P2 1')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should execute an application that uses env variables', async () => {
      const task: Task = { argv: ['env'], env: { PATTERN: '*.txt' }, execPath: '' }
      const execution = pm.execute(task, io, env)

      expect(io.getStdOut()).resolves.toBe('USER=gary\nHOME=/root/gary/\nPATTERN=*.txt\n')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })
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
      const pipeline: Pipeline = [
        { argv: ['success'], env: {}, execPath: '' },
        { argv: ['echo', 'gary'], env: {}, execPath: '' },
      ]
      const execution = pm.pipeline(pipeline, io, env)

      expect(io.getStdOut()).resolves.toBe('gary')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should run a many echo pipeline', async () => {
      const pipeline: Pipeline = [
        { argv: ['echo', 'gary'], env: {}, execPath: '' },
        { argv: ['echo', 'info'], env: {}, execPath: '' },
      ]
      const execution = pm.pipeline(pipeline, io, env)

      expect(io.getStdOut()).resolves.toBe('info')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should run a long pipeline', async () => {
      const pipeline: Pipeline = [
        { argv: ['success'], env: {}, execPath: '' },
        { argv: ['success'], env: {}, execPath: '' },
        { argv: ['success'], env: {}, execPath: '' },
        { argv: ['success'], env: {}, execPath: '' },
        { argv: ['echo', 'gary'], env: {}, execPath: '' },
      ]
      const execution = pm.pipeline(pipeline, io, env)

      expect(io.getStdOut()).resolves.toBe('gary')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should run a long pipeline and return latest error code', async () => {
      const pipeline: Pipeline = [
        { argv: ['success'], env: {}, execPath: '' },
        { argv: ['success'], env: {}, execPath: '' },
        { argv: ['failure'], env: {}, execPath: '' },
      ]
      const execution = pm.pipeline(pipeline, io, env)

      return expect(execution).resolves.toBe(AppicationMainResponse.FAILURE)
    })

    test('should run a long pipeline and return latest success code', async () => {
      const pipeline: Pipeline = [
        { argv: ['failure'], env: {}, execPath: '' },
        { argv: ['failure'], env: {}, execPath: '' },
        { argv: ['success'], env: {}, execPath: '' },
      ]
      const execution = pm.pipeline(pipeline, io, env)

      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should pipe one process', async () => {
      const pipeline: Pipeline = [
        { argv: ['echo', 'Gary Ascuy'], env: {}, execPath: '' },
      ]
      const execution = pm.pipeline(pipeline, io, env)

      expect(io.getStdOut()).resolves.toBe('Gary Ascuy')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should pipe two process', async () => {
      const pipeline: Pipeline = [
        { argv: ['echo', 'Gary Ascuy'], env: {}, execPath: '' },
        { argv: ['uppercase'], env: {}, execPath: '' },
      ]
      const execution = pm.pipeline(pipeline, io, env)

      expect(io.getStdOut()).resolves.toBe('GARY ASCUY')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should pipe three process', async () => {
      const pipeline: Pipeline = [
        { argv: ['echo', 'Gary Ascuy'], env: {}, execPath: '' },
        { argv: ['uppercase'], env: {}, execPath: '' },
        { argv: ['lowercase'], env: {}, execPath: '' },
      ]
      const execution = pm.pipeline(pipeline, io, env)

      expect(io.getStdOut()).resolves.toBe('gary ascuy')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should pipe many process (removelast 1)', async () => {
      const pipeline: Pipeline = [
        { argv: ['echo', 'First Name Gary Ascuy Anturiano'], env: { DEBUG: '1' }, execPath: '' },
        { argv: ['removelast'], env: {}, execPath: '' },
      ]
      const execution = pm.pipeline(pipeline, io, env)

      expect(io.getStdOut()).resolves.toBe('First Name Gary Ascuy')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should pipe many process (removelast 3)', async () => {
      const pipeline: Pipeline = [
        { argv: ['echo', 'First Name Gary Ascuy Anturiano'], env: {}, execPath: '' },
        { argv: ['removelast'], env: {}, execPath: '' },
        { argv: ['removelast'], env: {}, execPath: '' },
        { argv: ['removelast'], env: {}, execPath: '' },
      ]
      const execution = pm.pipeline(pipeline, io, env)

      expect(io.getStdOut()).resolves.toBe('First Name')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should pipe many greps', async () => {
      const io = new MockStream([
        'gary.zip\n',
        'gary_ascuy.png\n',
        'finalgary_ascuy.png\n',
        'figary_ascuy.zip\n',
        'final.zip\n',
        'gary_test.zip\n',
      ])
      io.init()

      const pipeline: Pipeline = [
        { argv: 'grep .zip'.split(' '), env: {}, execPath: '' },
        { argv: 'grep --pattern ^gary'.split(' '), env: {}, execPath: '' },
      ]
      const execution = pm.pipeline(pipeline, io, env)

      expect(io.getStdOut()).resolves.toBe('gary.zip\ngary_test.zip\n')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })
  })

  describe('.logical()', () => {
    let io: MockStream
    let TRUE: Pipeline = [{ argv: ['success'], env: {}, execPath: '' }]
    let FALSE: Pipeline = [{ argv: ['failure'], env: {}, execPath: '' }]

    beforeEach(() => {
      pm = new ProcessManager(new MockApplicationLoader(), {})
      env = { USER: 'gary', HOME: '/root/gary/' }
      io = new MockStream([''])
      io.init()
    })

    test.each([
      ['TRUE  AND TRUE  = TRUE', TRUE, TRUE, AppicationMainResponse.SUCCESS],
      ['TRUE  AND FALSE = FALSE', TRUE, FALSE, AppicationMainResponse.FAILURE],
      ['FALSE AND TRUE  = FALSE', FALSE, TRUE, AppicationMainResponse.FAILURE],
      ['FALSE AND FALSE = FALSE', FALSE, FALSE, AppicationMainResponse.FAILURE],
    ])('should evaluate "%s" expression', (name: string, a: Pipeline, b: Pipeline, result: AppicationMainResponse) => {
      const logical: LogicalPipeline = [a, Operator.AND, b]

      const execution = pm.logical(logical, io, env)
      return expect(execution).resolves.toBe(result)
    })

    // TRUE OR OR OR TRUE, HOW TEST LAZY EVALUATION
    test.each([
      ['TRUE  OR TRUE  = TRUE', TRUE, TRUE, AppicationMainResponse.SUCCESS],
      ['TRUE  OR FALSE = TRUE', TRUE, FALSE, AppicationMainResponse.SUCCESS],
      ['FALSE OR TRUE  = TRUE', FALSE, TRUE, AppicationMainResponse.SUCCESS],
      ['FALSE OR FALSE = FALSE', FALSE, FALSE, AppicationMainResponse.FAILURE],
    ])('should evaluate "%s" expression', (name: string, a: Pipeline, b: Pipeline, result: AppicationMainResponse) => {
      const logical: LogicalPipeline = [a, Operator.OR, b]

      const execution = pm.logical(logical, io, env)
      return expect(execution).resolves.toBe(result)
    })

    test('should evaluate OR in lazy mode "TRUE || CRASH = TRUE"', () => {
      const crash = [{ argv: ['nonExistentApplication'], env: {}, execPath: '' }]

      const logical: LogicalPipeline = [TRUE, Operator.OR, crash]
      const execution = pm.logical(logical, io, env)
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should evaluate AND in lazy mode "FALSE && CRASH = FALSE"', () => {
      const crash = [{ argv: ['nonExistentApplication'], env: {}, execPath: '' }]

      const logical: LogicalPipeline = [FALSE, Operator.AND, crash]
      const execution = pm.logical(logical, io, env)
      return expect(execution).resolves.toBe(AppicationMainResponse.FAILURE)
    })
  })

  describe.skip('.parallel()', () => {
    // let io: MockStream

    // const WAIT: Pipeline = [{ argv: ['sleep', '100'], env: {}, execPath: '' }]
    // const P1: Pipeline = [{ argv: ['echo', 'P1'], env: {}, execPath: '' }]
    // const P2: Pipeline = [{ argv: ['echo', 'P2'], env: {}, execPath: '' }]

    // beforeEach(() => {
    //   pm = new ProcessManager(new MockApplicationLoader(), {})
    //   env = { USER: 'gary', HOME: '/root/gary/' }
    //   io = new MockStream([''])
    //   io.init()
    // })

    // test('should run in parallel 2 pipelines', () => {
    //   const parallel: ParallelPipeline = [
    //     [WAIT, WAIT, P1],
    //     [P2, WAIT, WAIT],
    //   ]

    //   const execution = pm.parallel(parallel, io, env)

    //   expect(io.getStdOut()).resolves.toBe('P2')
    //   return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)

    // })

  })
})

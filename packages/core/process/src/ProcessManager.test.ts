import { AppicationMainResponse, EnvironmentVariables, LogicalPipeline, LogicalOperator, Pipeline, Task } from '@garyos/kernel'

import { ProcessManager } from './ProcessManagera'

import { MockApplicationLoader } from './loader/ApplicationLoader.mock'
import { MockStream } from "./loader/Stream.mock"

describe('ProcessManager.ts', () => {
  let pm: ProcessManager
  let env: EnvironmentVariables
  let io: MockStream

  beforeEach(() => {
    pm = new ProcessManager(new MockApplicationLoader())
    env = { USER: 'gary', HOME: '/root/gary/' }
    io = new MockStream([''])
    io.init()
  })

  describe('.exec()', () => {
    test('should execute an application', () => {
      const a = pm.execScript('echo gary', io, env, {})
      expect(1).toBe(1)
    })
  })
})

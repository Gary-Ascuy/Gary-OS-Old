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
      env = { USER: 'GARY', HOME: '/root/gary/' }
      io = new MockStream([''])
      io.init()
    })

    test('should execute an application', async () => {
      const options: ProcessOptions = { argv: ['echo'], env: {}, execPath: '' }
      const code = await pm.execute(options, io, env)

      expect(code).toBe(AppicationMainResponse.SUCCESS)
      // expect(io.getStdOut()).resolves.toBeCalledWith('gary')
    })
  })
})

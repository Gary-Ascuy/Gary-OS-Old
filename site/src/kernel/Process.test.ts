import Kernel from './Kernel'
import { Application } from './models/Application'
import { ProcessResponse } from './models/Process'
import {
  AppicationMainFunction, ApplicationContext,
  ApplicationMedatada, ApplicationType, TerminalApplication,
} from './options/ApplicationOptions'
import { ProcessOptions } from './options/ProcessOptions'

export function buildApplicationMetadata(
  identifier: string = 'com.garyos.env',
  name: string = 'Env',
  version: string = '1.0.0',
): ApplicationMedatada {
  const authors = [{ name: 'Gary Ascuy', email: 'gary.ascuy@gmail.com' }]

  return { identifier, name, version, authors }
}

export function buildMainFunction(code: number): AppicationMainFunction {
  return async (context: ApplicationContext) => code
}

export function buildTerminalApplication(main: AppicationMainFunction) {
  const application: TerminalApplication = {
    type: ApplicationType.Terminal,
    metadata: buildApplicationMetadata(),
    main
  }

  return application
}

export function wait(time: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, time))
}

export default describe('Process.ts', () => {
  describe('.open()', () => {
    let kernel: Kernel
    let application: Application
    let terminal: TerminalApplication

    beforeEach(async () => {
      kernel = await Kernel.getInstance(true)

      const main = buildMainFunction(ProcessResponse.SUCCESS)
      application = await kernel.build(buildTerminalApplication(main))
      terminal = application.options as TerminalApplication

      expect(kernel).toBeDefined()
      expect(application).toBeDefined()
    })

    test('should execute and returns success', async () => {
      const options: ProcessOptions = { command: 'code', arguments: [], env: {} }
      const code = await kernel.open(options, application)
      expect(code).toBe(ProcessResponse.SUCCESS)
    })

    test('should execute and returns error', async () => {
      const options: ProcessOptions = { command: 'code', arguments: [], env: {} }
      terminal.main = buildMainFunction(ProcessResponse.ERROR)

      const code = await kernel.open(options, application)
      expect(code).toBe(ProcessResponse.ERROR)
    })

    test('should execute and returns error with async functions', async () => {
      const options: ProcessOptions = { command: 'code', arguments: [], env: {} }
      terminal.main = async (context: ApplicationContext) => {
        await wait(20)
        return ProcessResponse.ERROR
      }

      const code = await kernel.open(options, application)
      expect(code).toBe(ProcessResponse.ERROR)
    })
  })
})

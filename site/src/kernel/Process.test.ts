import React from 'react'

import Kernel from './Kernel'
import { Application } from './models/Application'
import { ProcessResponse } from './models/Process'
import {
  AppicationMainFunction, ApplicationMedatada, ApplicationType,
  TerminalApplication, WindowApplication
} from './options/ApplicationOptions'
import { KernelOptions } from './options/KernelOptions'
import { ProcessOptions } from './options/ProcessOptions'

export function buildApplicationMetadata(
  identifier: string = 'com.garyos.env',
  name: string = 'Env',
  version: string = '1.0.0',
): ApplicationMedatada {
  const authors = [{ name: 'Gary Ascuy', email: 'gary.ascuy@gmail.com' }]

  return { identifier, name, version, authors }
}

export function buildMainVoidFunction(
  action: AppicationMainFunction<void> = async (context: any) => { console.log('test') },
) {
  return action
}

export function buildMainCodeFunction(code: number): AppicationMainFunction<number> {
  return async (context: any) => code
}

export function buildTerminalApplication(main: AppicationMainFunction<number>) {
  const application: TerminalApplication = {
    type: ApplicationType.Terminal,
    metadata: buildApplicationMetadata(),
    main
  }

  return application
}

export default describe('Process.ts', () => {
  describe('.open()', () => {
    test('should execute and return success', async () => {
      const kernel = await Kernel.getInstance(true)
      const main = buildMainCodeFunction(ProcessResponse.SUCCESS)
      const application = await kernel.build(buildTerminalApplication(main))
      const options: ProcessOptions = { command: 'code', arguments: [], env: {} }

      expect(kernel).toBeDefined()
      expect(application).toBeDefined()
      expect(options).toBeDefined()

      const code = await kernel.open(options, application)
      expect(code).toBe(ProcessResponse.SUCCESS)
    })

    test('should execute and return success', async () => {
      const kernel = await Kernel.getInstance(true)
      const main = buildMainCodeFunction(ProcessResponse.ERROR)
      const application = await kernel.build(buildTerminalApplication(main))
      const options: ProcessOptions = { command: 'code', arguments: [], env: {} }

      expect(kernel).toBeDefined()
      expect(application).toBeDefined()
      expect(options).toBeDefined()

      const code = await kernel.open(options, application)
      expect(code).toBe(ProcessResponse.ERROR)
    })
  })
})

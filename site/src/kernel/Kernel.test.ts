import React from 'react'

import Kernel from './Kernel'
import { ProcessResponse } from './models/Process'
import {
  AppicationMainFunction, ApplicationMedatada, ApplicationType,
  TerminalApplication, WindowApplication
} from './options/ApplicationOptions'
import { KernelOptions } from './options/KernelOptions'

export function buildApplicationMetadata(
  identifier: string = 'com.garyos.env',
  name: string = 'Env',
  version: string = '1.0.0',
): ApplicationMedatada {
  const authors = [{ name: 'Gary Ascuy', email: 'gary.ascuy@gmail.com' }]

  return { identifier, name, version, authors }
}

export function buildMainFunction(
  action: AppicationMainFunction<number> = async (context: any) => ProcessResponse.SUCCESS,
) {
  return action
}

export default describe('Kernel.ts', () => {
  describe('.constructor()', () => {
    test('should create an instance using constructor', () => {
      const kernel = new Kernel()

      expect(kernel).toBeDefined()
    })

    test('should create an instance with options using constructor', () => {
      const options: KernelOptions = { env: {}, alias: {} }
      const kernel = new Kernel(options)

      expect(kernel).toBeDefined()
    })
  })

  describe('.getInstance()', () => {
    test('should create an instance of Kernel', async () => {
      const kernel = await Kernel.getInstance()

      expect(kernel).toBeDefined()
    })

    test('should return the same instance of Kernel', async () => {
      const kernel1 = await Kernel.getInstance()
      const kernel2 = await Kernel.getInstance()

      expect(kernel1).toEqual(kernel2)
    })
  })

  describe('.load()', () => {
    test('should call load without exception', async () => {
      const kernel = await Kernel.getInstance()
      await kernel.load()

      expect(kernel).toBeDefined()
    })
  })

  describe('.install()', () => {
    test('should install an terminal application', async () => {
      const kernel = await Kernel.getInstance(true)
      const env: TerminalApplication = {
        type: ApplicationType.Terminal,
        metadata: buildApplicationMetadata(),
        main: buildMainFunction()
      }

      expect(kernel.Applications.length).toBe(0)
      await kernel.install(env)

      expect(kernel.Applications.length).toBe(1)
      expect(kernel.Applications[0].type).toBe(ApplicationType.Terminal)
      expect(kernel.Applications[0].aid).toBe(env.metadata.identifier)
    })

    test('should install an window application', async () => {
      const kernel = await Kernel.getInstance(true)
      const terminal: WindowApplication = {
        type: ApplicationType.Window,
        metadata: buildApplicationMetadata('com.garyos.terminal', 'Terminal', '1.0.0'),
        view: React.createElement('div', 'hello world'),
      }

      expect(kernel.Applications.length).toBe(0)
      await kernel.install(terminal)

      expect(kernel.Applications.length).toBe(1)
      expect(kernel.Applications[0].type).toBe(ApplicationType.Window)
      expect(kernel.Applications[0].aid).toBe(terminal.metadata.identifier)
    })

    test('should install more than one application', async () => {
      const kernel = await Kernel.getInstance(true)

      const env: TerminalApplication = {
        type: ApplicationType.Terminal,
        metadata: buildApplicationMetadata(),
        main: buildMainFunction()
      }

      const terminal: WindowApplication = {
        type: ApplicationType.Window,
        metadata: buildApplicationMetadata('com.garyos.terminal', 'Terminal', '1.0.0'),
        view: React.createElement('div', 'hello world'),
      }

      expect(kernel.Applications.length).toBe(0)

      await kernel.install(env)

      expect(kernel.Applications.length).toBe(1)
      expect(kernel.Applications[0].type).toBe(ApplicationType.Terminal)
      expect(kernel.Applications[0].aid).toBe(env.metadata.identifier)

      await kernel.install(terminal)

      expect(kernel.Applications.length).toBe(2)
      expect(kernel.Applications[1].type).toBe(ApplicationType.Window)
      expect(kernel.Applications[1].aid).toBe(terminal.metadata.identifier)
    })

    test('should thrown an exeption if application it is already installed', async () => {
      const kernel = await Kernel.getInstance(true)
      const terminal: WindowApplication = {
        type: ApplicationType.Window,
        metadata: buildApplicationMetadata('com.garyos.terminal', 'Terminal', '1.0.0'),
        view: React.createElement('div', 'hello world'),
      }

      expect(kernel.Applications.length).toBe(0)
      await kernel.install(terminal)

      expect(kernel.Applications.length).toBe(1)
      expect(kernel.Applications[0].type).toBe(ApplicationType.Window)
      expect(kernel.Applications[0].aid).toBe(terminal.metadata.identifier)

      expect(async () => {
        await kernel.install(terminal)
      }).rejects.toThrowError()
    })
  })

  describe('.uninstall()', () => {
    test('should uninstall an application', async () => {
      const kernel = await Kernel.getInstance(true)
      const env: TerminalApplication = {
        type: ApplicationType.Terminal,
        metadata: buildApplicationMetadata(),
        main: buildMainFunction()
      }

      expect(kernel.Applications.length).toBe(0)
      await kernel.install(env)

      expect(kernel.Applications.length).toBe(1)
      expect(kernel.Applications[0].type).toBe(ApplicationType.Terminal)
      expect(kernel.Applications[0].aid).toBe(env.metadata.identifier)

      const uninstalledApp = await kernel.uninstall(env.metadata.identifier)
      expect(kernel.Applications.length).toBe(0)
      expect(uninstalledApp.type).toBe(ApplicationType.Terminal)
      expect(uninstalledApp.aid).toBe(env.metadata.identifier)
    })

    test('should uninstall more than one application', async () => {
      const kernel = await Kernel.getInstance(true)

      const env: TerminalApplication = {
        type: ApplicationType.Terminal,
        metadata: buildApplicationMetadata(),
        main: buildMainFunction()
      }

      const terminal: WindowApplication = {
        type: ApplicationType.Window,
        metadata: buildApplicationMetadata('com.garyos.terminal', 'Terminal', '1.0.0'),
        view: React.createElement('div', 'hello world'),
      }

      expect(kernel.Applications.length).toBe(0)

      await kernel.install(env)

      expect(kernel.Applications.length).toBe(1)
      expect(kernel.Applications[0].type).toBe(ApplicationType.Terminal)
      expect(kernel.Applications[0].aid).toBe(env.metadata.identifier)

      await kernel.install(terminal)

      expect(kernel.Applications.length).toBe(2)
      expect(kernel.Applications[1].type).toBe(ApplicationType.Window)
      expect(kernel.Applications[1].aid).toBe(terminal.metadata.identifier)

      const uninstalled1 = await kernel.uninstall(terminal.metadata.identifier)
      expect(kernel.Applications.length).toBe(1)
      expect(uninstalled1.type).toBe(ApplicationType.Window)
      expect(uninstalled1.aid).toBe(terminal.metadata.identifier)

      const uninstalled2 = await kernel.uninstall(env.metadata.identifier)
      expect(kernel.Applications.length).toBe(0)
      expect(uninstalled2.type).toBe(ApplicationType.Terminal)
      expect(uninstalled2.aid).toBe(env.metadata.identifier)
    })

    test('should thrown an exeption if application does not exist', async () => {
      const kernel = await Kernel.getInstance(true)
      const terminal: WindowApplication = {
        type: ApplicationType.Window,
        metadata: buildApplicationMetadata('com.garyos.terminal', 'Terminal', '1.0.0'),
        view: React.createElement('div', 'hello world'),
      }

      expect(kernel.Applications.length).toBe(0)
      await kernel.install(terminal)

      expect(kernel.Applications.length).toBe(1)
      expect(kernel.Applications[0].type).toBe(ApplicationType.Window)
      expect(kernel.Applications[0].aid).toBe(terminal.metadata.identifier)

      expect(async () => {
        await kernel.uninstall('com.garyos.preview')
      }).rejects.toThrowError()
    })
  })

  describe('.registerEnvironmentVariable()', () => {
    test('should register an env variable', async () => {
      const kernel = await Kernel.getInstance(true)

      expect(Object.keys(kernel.EnvironmentVariables).length).toBe(0)

      await kernel.registerEnvironmentVariable('PATH', '/home/bin;/local/bin;')
      expect(Object.keys(kernel.EnvironmentVariables).length).toBe(1)
    })

    test('should register more than one env variable', async () => {
      const kernel = await Kernel.getInstance(true)
      expect(Object.keys(kernel.EnvironmentVariables).length).toBe(0)

      await kernel.registerEnvironmentVariable('PATH', '/home/bin;/local/bin;')
      expect(Object.keys(kernel.EnvironmentVariables).length).toBe(1)

      await kernel.registerEnvironmentVariable('HOME', '/home/bin')
      expect(Object.keys(kernel.EnvironmentVariables).length).toBe(2)

      await kernel.registerEnvironmentVariable('GARYOS_PATH', '/home/garyos/home')
      expect(Object.keys(kernel.EnvironmentVariables).length).toBe(3)
    })

    test('should overwrite an env variable', async () => {
      const kernel = await Kernel.getInstance(true)
      expect(Object.keys(kernel.EnvironmentVariables).length).toBe(0)

      await kernel.registerEnvironmentVariable('PATH', '/home/bin;/local/bin;')
      expect(Object.keys(kernel.EnvironmentVariables).length).toBe(1)

      await kernel.registerEnvironmentVariable('PATH', '/home/bin;/local/bin;/root/user/bin;')
      expect(Object.keys(kernel.EnvironmentVariables).length).toBe(1)
    })
  })

  describe('.registerAlias()', () => {
    test('should register an alias', async () => {
      const kernel = await Kernel.getInstance(true)

      expect(Object.keys(kernel.Alias).length).toBe(0)

      await kernel.registerAlias('code', 'com.microsoft.vscode')
      expect(Object.keys(kernel.Alias).length).toBe(1)
    })

    test('should register more than one alias', async () => {
      const kernel = await Kernel.getInstance(true)
      expect(Object.keys(kernel.Alias).length).toBe(0)

      await kernel.registerAlias('code', 'com.microsoft.vscode')
      expect(Object.keys(kernel.Alias).length).toBe(1)

      await kernel.registerAlias('terminal', 'com.garyos.terminal')
      expect(Object.keys(kernel.Alias).length).toBe(2)

      await kernel.registerAlias('ls', 'com.garyos.ls')
      expect(Object.keys(kernel.Alias).length).toBe(3)
    })

    test('should overwrite one alias', async () => {
      const kernel = await Kernel.getInstance(true)
      expect(Object.keys(kernel.Alias).length).toBe(0)

      await kernel.registerAlias('code', 'com.microsoft.vscode')
      expect(Object.keys(kernel.Alias).length).toBe(1)

      await kernel.registerAlias('code', 'com.garyos.terminal')
      expect(Object.keys(kernel.Alias).length).toBe(1)
    })
  })

  describe('.getApplication()', () => {
    test('should get an application by identifier', async () => {
      const kernel = await Kernel.getInstance(true)
      const env: TerminalApplication = {
        type: ApplicationType.Terminal,
        metadata: buildApplicationMetadata(),
        main: buildMainFunction()
      }

      expect(kernel.Applications.length).toBe(0)
      await kernel.install(env)

      expect(kernel.Applications.length).toBe(1)
      expect(kernel.Applications[0].type).toBe(ApplicationType.Terminal)
      expect(kernel.Applications[0].aid).toBe(env.metadata.identifier)

      const app = await kernel.getApplication(env.metadata.identifier)
      expect(app.type).toBe(ApplicationType.Terminal)
      expect(app.aid).toBe(env.metadata.identifier)
    })

    test('should thrown an exeption if application does not exist', async () => {
      const kernel = await Kernel.getInstance(true)
      const terminal: WindowApplication = {
        type: ApplicationType.Window,
        metadata: buildApplicationMetadata('com.garyos.terminal', 'Terminal', '1.0.0'),
        view: React.createElement('div', 'hello world'),
      }

      expect(kernel.Applications.length).toBe(0)
      await kernel.install(terminal)

      expect(kernel.Applications.length).toBe(1)
      expect(kernel.Applications[0].type).toBe(ApplicationType.Window)
      expect(kernel.Applications[0].aid).toBe(terminal.metadata.identifier)

      expect(async () => {
        await kernel.getApplication('com.garyos.preview')
      }).rejects.toThrowError()
    })

    test('should get an application by alias', async () => {
      const kernel = await Kernel.getInstance(true)
      const env: TerminalApplication = {
        type: ApplicationType.Terminal,
        metadata: buildApplicationMetadata(),
        main: buildMainFunction()
      }

      expect(kernel.Applications.length).toBe(0)
      await kernel.install(env)

      expect(kernel.Applications.length).toBe(1)
      expect(kernel.Applications[0].type).toBe(ApplicationType.Terminal)
      expect(kernel.Applications[0].aid).toBe(env.metadata.identifier)

      await kernel.registerAlias('code', env.metadata.identifier)
      const app = await kernel.getApplication('code')
      expect(app.type).toBe(ApplicationType.Terminal)
      expect(app.aid).toBe(env.metadata.identifier)
    })
  })
})

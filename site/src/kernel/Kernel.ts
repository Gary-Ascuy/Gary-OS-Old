import { v4 as uuid } from 'uuid'
import { EventEmitter } from 'events'

import { KernelOptions } from './options/KernelOptions'
import { ApplicationContext, ApplicationOptions, ApplicationType, TerminalApplication } from './options/ApplicationOptions'
import { ProcessOptions } from './options/ProcessOptions'

import { Process, ProcessResponse } from './models/Process'
import { Application } from './models/Application'
import { EnvironmentVariables } from './models/EnvironmentVariables'
import { Alias } from './models/Alias'
import { ApplicationNotFound } from './error/ApplicationNotFound'

import './FileSystem'
import { ApplicationAlreadyExist } from './error/ApplicationAlreadyExist'

export default class Kernel extends EventEmitter {
  private static __instance?: Kernel = undefined

  constructor(
    private options: KernelOptions = { env: {}, alias: {} },
    private applications: { [key: string]: Application } = {},
    private processes: { [key: string]: Process } = {},
  ) {
    super()
  }

  get EnvironmentVariables(): EnvironmentVariables {
    return this.options.env
  }

  get Alias(): Alias {
    return this.options.alias
  }

  get Applications(): Application[] {
    return Object.values(this.applications)
  }

  get Processes(): Process[] {
    return Object.values(this.processes)
  }

  async load(): Promise<void> {
    this.emit('load', 0)
    this.emit('load', 100)
  }

  async build(options: ApplicationOptions): Promise<Application> {
    const application: Application = { aid: options.metadata.identifier, type: options.type, options }
    return application
  }

  // TODO: Validate auth/certs to install applications
  async install(options: ApplicationOptions): Promise<Application> {
    if (!!this.applications[options.metadata.identifier]) throw new ApplicationAlreadyExist()

    const app: Application = await this.build(options)
    this.applications[app.aid] = app
    this.emit('install', app)
    return app
  }

  async uninstall(aid: string): Promise<Application> {
    const app = this.applications[aid]
    if (!app) throw new ApplicationNotFound()

    delete this.applications[aid]
    this.emit('uninstall', app)
    return app
  }

  async registerEnvironmentVariable(key: string, value: string) {
    this.options.env[key] = value
    this.emit('registerEnvironmentVariable', { key, value })
  }

  async registerAlias(alias: string, identifier: string) {
    this.options.alias[alias] = identifier
    this.emit('registerAlias', { alias, identifier })
  }

  async getApplication(aidOrAlias: string): Promise<Application> {
    const application = this.applications[aidOrAlias] || this.applications[this.options.alias[aidOrAlias]]

    if (!application) throw new ApplicationNotFound()
    return application
  }

  async open(options: ProcessOptions, _application?: Application): Promise<number> {
    const pid = uuid()
    const application = _application ? _application : await this.getApplication(options.command)

    const env = { ...this.options.env, ...options.env }
    const process: Process = { pid, env, options, application }
    this.processes[pid] = process
    this.emit('open', process)

    const context: ApplicationContext = { pid, kernel: await Kernel.getInstance(), process }
    if (application.type === ApplicationType.Terminal) {
      const terminal: TerminalApplication = application.options as TerminalApplication
      const code = await terminal.main(context)
      return code
    }

    return ProcessResponse.SUCCESS
  }

  async kill(pid: string) {
    const process = this.processes[pid]
    delete this.processes[pid]
    this.emit('kill', process)
  }

  static async getInstance(isUnitTest: boolean = false): Promise<Kernel> {
    if (isUnitTest) {
      const kernel = new Kernel()
      await kernel.load()
      return kernel
    }

    if (!Kernel.__instance) {
      Kernel.__instance = new Kernel()
      await Kernel.__instance.load()
    }

    return Kernel.__instance
  }
}

export async function open(options: ProcessOptions) {
  const kernel = await Kernel.getInstance()
  return kernel.open(options)
}

export async function kill(pid: string) {
  const kernel = await Kernel.getInstance()
  return kernel.kill(pid)
}

export async function install(options: ApplicationOptions) {
  const kernel = await Kernel.getInstance()
  return kernel.install(options)
}


export async function uninstall(aid: string) {
  const kernel = await Kernel.getInstance()
  return kernel.uninstall(aid)
}

export function useKernel() {
  return { open, kill, install, uninstall }
}

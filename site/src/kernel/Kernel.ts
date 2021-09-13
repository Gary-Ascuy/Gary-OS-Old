import { v4 as uuid } from 'uuid'
import { EventEmitter } from 'events'

import { KernelOptions } from './options/KernelOptions'
import { ApplicationOptions } from './options/ApplicationOptions'
import { ProcessOptions } from './options/ProcessOptions'

import { Process } from './models/Process'
import { Application } from './models/Application'
import { EnvironmentVariables } from './models/EnvironmentVariables'
import { Alias } from './models/Alias'

import './FileSystem'

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
  }

  // TODO: Validate auth/certs to install applications
  async install(options: ApplicationOptions): Promise<void> {
    if (!!this.applications[options.metadata.identifier]) throw new Error('Application already exists')

    const app: Application = { aid: options.metadata.identifier, type: options.type, options }
    this.applications[app.aid] = app
  }

  async uninstall(aid: string): Promise<Application> {
    const app = this.applications[aid]
    if (!app) throw new Error('Application not found')

    delete this.applications[aid]
    return app
  }

  async registerEnvironmentVariable(key: string, value: string) {
    this.options.env[key] = value
  }

  async registerAlias(alias: string, aid: string) {
    this.options.alias[alias] = aid
  }

  async getApplication(aidOrAlias: string): Promise<Application> {
    const application = this.applications[aidOrAlias] || this.applications[this.options.alias[aidOrAlias]]

    if (!application) throw new Error('Application not found')
    return application
  }

  async open(options: ProcessOptions): Promise<Process> {
    const env = { ...this.options.env, ...options.env }
    const process = { pid: uuid(), env, options }

    this.processes[process.pid] = process
    return process
  }

  async kill(pid: string) {
    const process = this.processes[pid]
    delete this.processes[pid]
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

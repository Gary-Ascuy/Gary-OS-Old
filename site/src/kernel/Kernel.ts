import { v4 as uuid } from 'uuid'
import { EventEmitter } from 'events'

import { KernelOptions } from './options/KernelOptions'
import { ApplicationOptions } from './options/ApplicationOptions'
import { ProcessOptions } from './options/ProcessOptions'

import { Process } from './models/Process'
import { Application } from './models/Application'

const defaultOptions: KernelOptions = { env: {} }
export default class Kernel extends EventEmitter {
  private static __instance?: Kernel = undefined

  constructor(
    private options: KernelOptions = defaultOptions,
    private applications: { [key: string]: Application } = {},
    private processes: { [key: string]: Process } = {},
  ) {
    super(/* options */)
  }

  async load(): Promise<void> {
  }

  // TODO: Validate auth/certs to install applications
  async install(options: ApplicationOptions): Promise<void> {
    const app: Application = { aid: uuid(), type: options.type, options }
    this.applications[app.aid] = app
  }

  async uninstall(aid: string): Promise<void> {
    delete this.applications[aid]
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

  static async getInstance(): Promise<Kernel> {
    if (!this.__instance) {
      this.__instance = new Kernel()
      await this.__instance.load()
    }

    return this.__instance
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

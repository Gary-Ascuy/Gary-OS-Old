import {
  EnvironmentVariables, Process, Task, BaseProcessManager, StandardStream,
} from '@garyos/kernel'

import { ApplicationLoader } from './loader/ApplicationLoader'
import { execute } from './core/exec'

export class ProcessManager extends BaseProcessManager {
  constructor(
    public loader: ApplicationLoader,
    public map: { [key: string]: Process } = {},
  ) {
    super()
  }

  exec(ast: any, io: StandardStream, system: EnvironmentVariables): Promise<number> {
    const task = {} as Task
    return execute(this.loader, task, io, system)
  }
}

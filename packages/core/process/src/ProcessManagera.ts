import {
  EnvironmentVariables, Process, Task, BaseProcessManager, StandardStream,
} from '@garyos/kernel'

import { ApplicationLoader } from './loader/ApplicationLoader'
import { execute, executeAndFlush } from './core/exec'

function checkScript(ast: any) {
  if (ast.type !== 'Script') throw new Error('Error: Invalid parameter')
}


function checkCommand(ast: any) {
  if (ast.type !== 'Command') throw new Error('Error: Invalid command')
}

function buildCommand(ast: any, execPath: string): Task {
  checkCommand(ast)

  const { name, suffix, prefix } = ast

  const values = (suffix ?? []).map(({ text }: any) => text)
  const assignments = (prefix ?? []).map(({ text }: any) => text)

  const env: EnvironmentVariables = {}
  for (const assignment of assignments) {
    const [key, value] = assignment.split('=')
    env[key] = value
  }

  const task: Task = { argv: [ast.name.text, ...values], env, execPath }
  console.log(ast, task)

  return task
}
export class ProcessManager extends BaseProcessManager {
  constructor(
    public loader: ApplicationLoader,
    public map: { [key: string]: Process } = {},
  ) {
    super()
  }

  async exec(ast: any, io: StandardStream, system: EnvironmentVariables): Promise<number> {
    checkScript(ast)

    for (const command of ast.commands) {
      console.log('before')
      const task = buildCommand(command, system.PWD)
      const process = execute(this.loader, task, io, system)
      if (!command.async) await process
      console.log('after')
    }

    console.log(ast)

    const task = {} as Task
    return execute(this.loader, task, io, system)
  }
}

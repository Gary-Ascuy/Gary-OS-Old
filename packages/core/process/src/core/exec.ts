import {
  AppicationMainResponse, EnvironmentVariables, Process, Task,
  StandardStream, StringReadableStream, StringWritableStream, Kernel,
} from '@garyos/kernel'
import { v4 as uuid } from 'uuid'

import { ApplicationLoader } from '../loader/ApplicationLoader'
import { replaceEnvVariables } from '../parser.deprecated/CommandParser'

export async function execute(loader: ApplicationLoader, task: Task, io: StandardStream, system: EnvironmentVariables): Promise<number> {
  try {
    const [identifier, ...args] = task.argv
    const application = await loader.get(identifier)

    // env variables
    const env = { ...system, ...task.env }
    for (const key of Object.keys(task.env)) {
      env[key] = replaceEnvVariables(env[key], env)
    }

    // arguments
    const params = args.map((value) => replaceEnvVariables(value, env))
    const argv = [identifier, ...params]

    // process
    const pid = uuid()
    const process: Process = { ...task, ...io, pid, application, env, argv }
    system.DEBUG && console.log(process)

    const context = { pid, process, kernel: {} as Kernel }
    return application.main(context)
  } catch (error) {
    system.DEBUG && console.error(error)
    return AppicationMainResponse.ERROR
  }
}

export async function flushWritable(writable: StringWritableStream): Promise<void> {
  try {
    const writer = writable.getWriter()
    await writer.close()
  } catch (error) { }
}

export async function flushReadable(readable: StringReadableStream): Promise<void> {
  try {
    const reader = readable.getReader()
    let done
    do {
      const chunk = await reader.read()
      done = chunk.done
    } while (!done)
  } catch (error) { }
}

export async function executeAndFlush(loader: ApplicationLoader, task: Task, io: StandardStream, system: EnvironmentVariables): Promise<number> {
  const code = await execute(loader, task, io, system)

  await flushReadable(io.stdin)
  await flushWritable(io.stdout)
  await flushWritable(io.stderr)
  return code
}
